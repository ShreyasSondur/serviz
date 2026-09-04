/**
 * Deals & Offers Screen Component with Ultra-Clean UI/UX.
 * Displays deal offers with green checkmark badge, search bar, Emirate/Area/Sort filters,
 * service detail modals, contact action sheets, and a locked stationary FloatingNavBar.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Image,
  Modal,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import colors from '@/constants/colors';
import FloatingNavBar, { TabType } from '@/components/FloatingNavBar';
import ServizLogo from '@/components/Logo';
import {
  SearchIcon,
  LocationPinIcon,
  TargetCrosshairIcon,
  VerifiedBadgeIcon,
  GreenCheckCircleIcon,
  LocationPinSolidIcon,
  CategoryGridIcon,
  FilterSlidersIcon,
  PhoneReceiverVectorIcon,
  MailEnvelopeVectorIcon,
  WhatsAppIcon,
  CloseCrossIcon,
} from '@/components/LandingIcons';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import SwipableImageCarousel from '@/components/SwipableImageCarousel';
import SkeletonCard from '@/components/SkeletonCard';

export interface DealItem {
  id: string;
  title: string;
  location: string;
  emirate: string;
  category: string;
  isVerified: boolean;
  dealOffer?: string; // e.g. "UPTO 50% OFF ON FIRST SERVICE"
  image: string;
  rating: number;
  reviewsCount: number;
  originalPrice: number;
  discountedPrice: number;
  providerName: string;
  phone: string;
  description: string;
  inclusions: string[];
  images?: string[];
}

export const MOCK_DEALS: DealItem[] = [];

const EMIRATES = ['All Emirates', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK'];
const AREAS = ['All Areas', 'Warsan', 'Business Bay', 'Dubai Marina', 'Downtown', 'JLT'];
const SORTS = ['Newest to Oldest', 'Oldest to Newest', 'Alphabetical (A-Z)', 'Alphabetical (Z-A)'];

interface DealsViewProps {
  onTabChange?: (tab: TabType) => void;
  currentTab?: TabType;
}

export function DealsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmirate, setSelectedEmirate] = useState('All Emirates');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedSort, setSelectedSort] = useState('Newest to Oldest');

  // Initial state empty array to avoid flash of fake data
  const [dealsList, setDealsList] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter Modals state
  const [activeModalFilter, setActiveModalFilter] = useState<'emirate' | 'area' | 'sort' | null>(
    null
  );

  // Detail & Contact Modals state
  const [selectedDeal, setSelectedDeal] = useState<DealItem | null>(null);
  const [contactDeal, setContactDeal] = useState<DealItem | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Fetch live deals from backend
  useEffect(() => {
    async function loadDeals() {
      setIsLoading(true);
      try {
        const res = await api.get<any>('/deals/');
        const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
        if (items && items.length > 0) {
          const apiDeals: DealItem[] = items.map((item: any) => ({
            id: item.id.toString(),
            title: item.title,
            location: item.city?.name || 'Warsan',
            emirate: item.city?.emirate?.name || 'Dubai',
            category: item.category?.name || 'Technical Services',
            isVerified: true,
            dealOffer: item.discount_desc || 'SPECIAL DISCOUNT DEAL',
            image:
              item.images && item.images.length > 0
                ? item.images[0]
                : 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600',
            images: item.images && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600'],
            rating: 4.9,
            reviewsCount: 140,
            originalPrice: 300,
            discountedPrice: 150,
            providerName: item.partner
              ? `${item.partner.first_name || ''} ${item.partner.last_name || ''}`.trim() || item.partner.business_name || 'Verified Partner'
              : 'Mohammed Sakib',
            phone: item.partner?.phone && item.partner.phone !== 'HIDDEN_LOGIN_REQUIRED' ? item.partner.phone : '+971 52 164 0226',
            description: item.description || 'Exclusive deal offer for verified services.',
            inclusions: ['Discount Applied', 'Verified Professional', 'Quality Guaranteed'],
          }));
          setDealsList(apiDeals);
        }
      } catch (err) {
        console.log('Error loading deals:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDeals();
  }, []);

  // Filtered Deals logic
  const filteredDeals = useMemo(() => {
    return dealsList
      .filter((item) => {
        if (selectedEmirate !== 'All Emirates' && item.emirate !== selectedEmirate) {
          return false;
        }
        if (selectedArea !== 'All Areas' && item.location !== selectedArea) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(query);
          const matchesLoc = item.location.toLowerCase().includes(query);
          const matchesCat = item.category.toLowerCase().includes(query);
          const matchesDesc = item.description.toLowerCase().includes(query);
          if (!matchesTitle && !matchesLoc && !matchesCat && !matchesDesc) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'Oldest to Newest') {
          return Number(a.id) - Number(b.id);
        }
        if (selectedSort === 'Alphabetical (A-Z)') {
          return a.title.localeCompare(b.title);
        }
        if (selectedSort === 'Alphabetical (Z-A)') {
          return b.title.localeCompare(a.title);
        }
        // Default: 'Newest to Oldest'
        return Number(b.id) - Number(a.id);
      });
  }, [dealsList, searchQuery, selectedEmirate, selectedArea, selectedSort]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {
      Alert.alert('Contact Provider', `Call provider at: ${phone}`);
    });
  };

  const handleWhatsApp = (phone: string) => {
    Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`).catch(() => {
      Alert.alert('Contact Provider', `WhatsApp ${phone}`);
    });
  };

  return (
    <View style={styles.contentWrapper}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <ServizLogo size="md" />
      </View>

      {/* Main Search & 3 Filters Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputRow}>
          <View style={styles.iconSlot}>
            <SearchIcon color="#FFFFFF" size={18} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="What service do you need ?"
            placeholderTextColor="#5E5E68"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 3 Filter Pickers Row (Emirate, Area, Sort Slider) */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBox, selectedEmirate !== 'All Emirates' && styles.activeFilterBox]}
            onPress={() => setActiveModalFilter('emirate')}
            activeOpacity={0.75}
          >
            <View style={styles.iconSlot}>
              <LocationPinIcon color={selectedEmirate !== 'All Emirates' ? colors.primary : '#FFFFFF'} size={15} />
            </View>
            <Text style={[styles.filterText, selectedEmirate !== 'All Emirates' && styles.goldText]} numberOfLines={1}>
              {selectedEmirate}
            </Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBox, selectedArea !== 'All Areas' && styles.activeFilterBox]}
            onPress={() => setActiveModalFilter('area')}
            activeOpacity={0.75}
          >
            <View style={styles.iconSlot}>
              <TargetCrosshairIcon color={selectedArea !== 'All Areas' ? colors.primary : '#FFFFFF'} size={15} />
            </View>
            <Text style={[styles.filterText, selectedArea !== 'All Areas' && styles.goldText]} numberOfLines={1}>
              {selectedArea}
            </Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBox, selectedSort !== 'Newest' && styles.activeFilterBox]}
            onPress={() => setActiveModalFilter('sort')}
            activeOpacity={0.75}
          >
            <View style={styles.iconSlot}>
              <FilterSlidersIcon color={selectedSort !== 'Newest' ? colors.primary : '#FFFFFF'} size={15} />
            </View>
            <Text style={[styles.filterText, selectedSort !== 'Newest' && styles.goldText]} numberOfLines={1}>
              {selectedSort}
            </Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Deals List Scroll Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <SkeletonCard count={3} />
        ) : filteredDeals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Deals Found</Text>
            <Text style={styles.emptySub}>
              Try adjusting your search query or filter settings.
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedEmirate('All Emirates');
                setSelectedArea('All Areas');
                setSelectedSort('Newest');
              }}
            >
              <Text style={styles.resetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDeals.map((item) => (
            <View key={item.id} style={styles.serviceCard}>
              {/* Left Image Column with Swipable Carousel */}
              <SwipableImageCarousel
                images={item.images && item.images.length > 0 ? item.images : [item.image]}
                height={132}
                width={130}
              />

              {/* Right Details Column */}
              <View style={styles.detailsContainer}>
                {/* Title */}
                <Text style={styles.serviceTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                {/* Verified Badge Row */}
                <View style={styles.verifiedRow}>
                  <VerifiedBadgeIcon size={15} />
                  <Text style={styles.verifiedText}>VERIFIED USER</Text>
                </View>

                {/* Optional Green Deal Offer Line */}
                {item.dealOffer && (
                  <View style={styles.dealOfferRow}>
                    <GreenCheckCircleIcon size={15} />
                    <Text style={styles.dealOfferText}>{item.dealOffer}</Text>
                  </View>
                )}

                {/* Location & Category Row */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <LocationPinSolidIcon color="#FFFFFF" size={14} />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>

                  <View style={styles.metaItem}>
                    <CategoryGridIcon color="#FFFFFF" size={14} />
                    <Text style={styles.metaText}>{item.category}</Text>
                  </View>
                </View>

                {/* Action Buttons Row */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.viewMoreBtn}
                    onPress={() => setSelectedDeal(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewMoreText}>View More</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.contactBtn}
                    onPress={() => setContactDeal(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.contactText}>Contact Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Filter Options Modal */}
      <Modal
        visible={activeModalFilter !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModalFilter(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveModalFilter(null)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Select {activeModalFilter === 'emirate' ? 'Emirate' : activeModalFilter === 'area' ? 'Area' : 'Sort Order'}
            </Text>

            {activeModalFilter === 'emirate' &&
              EMIRATES.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedEmirate(opt);
                    setActiveModalFilter(null);
                  }}
                >
                  <Text style={[styles.modalOptionText, selectedEmirate === opt && styles.goldText]}>
                    {opt}
                  </Text>
                  {selectedEmirate === opt && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              ))}

            {activeModalFilter === 'area' &&
              AREAS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedArea(opt);
                    setActiveModalFilter(null);
                  }}
                >
                  <Text style={[styles.modalOptionText, selectedArea === opt && styles.goldText]}>
                    {opt}
                  </Text>
                  {selectedArea === opt && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              ))}

            {activeModalFilter === 'sort' &&
              SORTS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedSort(opt);
                    setActiveModalFilter(null);
                  }}
                >
                  <Text style={[styles.modalOptionText, selectedSort === opt && styles.goldText]}>
                    {opt}
                  </Text>
                  {selectedSort === opt && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Deal Details Modal ("View More") */}
      <Modal
        visible={selectedDeal !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedDeal(null)}
      >
        <View style={styles.fullModalOverlay}>
          {selectedDeal && (
            <View style={styles.fullModalContainer}>
              <View style={styles.sheetHandleBar} />
              <View style={styles.modalHeaderRow}>
                <Text style={styles.detailHeaderTitle}>Deal Details</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedDeal(null)}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <Image
                  source={{ uri: selectedDeal.image }}
                  style={styles.detailBannerImage}
                  resizeMode="cover"
                />

                <View style={styles.detailBody}>
                  {selectedDeal.dealOffer && (
                    <View style={styles.dealBadgeBanner}>
                      <GreenCheckCircleIcon size={16} />
                      <Text style={styles.dealBadgeBannerText}>{selectedDeal.dealOffer}</Text>
                    </View>
                  )}

                  <View style={styles.verifiedRow}>
                    <VerifiedBadgeIcon size={18} />
                    <Text style={styles.verifiedText}>
                      VERIFIED USER • {selectedDeal.rating} ★ ({selectedDeal.reviewsCount} reviews)
                    </Text>
                  </View>

                  <Text style={styles.detailTitle}>{selectedDeal.title}</Text>

                  <View style={styles.priceRowModal}>
                    <Text style={styles.detailPrice}>AED {selectedDeal.discountedPrice}</Text>
                    <Text style={styles.originalPriceText}>AED {selectedDeal.originalPrice}</Text>
                  </View>

                  <View style={styles.dividerLine} />

                  <Text style={styles.sectionHeader}>Provider Profile</Text>
                  <Text style={styles.providerNameText}>{selectedDeal.providerName}</Text>
                  <Text style={styles.providerLocText}>Location: {selectedDeal.location}, {selectedDeal.emirate}</Text>

                  <Text style={styles.sectionHeader}>About This Offer</Text>
                  <Text style={styles.descriptionText}>{selectedDeal.description}</Text>

                  <Text style={styles.sectionHeader}>What's Included</Text>
                  {selectedDeal.inclusions.map((inc, i) => (
                    <View key={i} style={styles.inclusionRow}>
                      <GreenCheckCircleIcon size={14} />
                      <Text style={styles.inclusionText}>{inc}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalFooterActions}>
                <TouchableOpacity
                  style={styles.callNowFooterBtn}
                  onPress={() => {
                    const deal = selectedDeal;
                    setSelectedDeal(null);
                    setContactDeal(deal);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.callNowFooterText}>Claim Deal & Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Contact Action Sheet Modal ("Contact Now") */}
      <Modal
        visible={contactDeal !== null}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setContactDeal(null);
          setContactSuccess(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setContactDeal(null);
            setContactSuccess(false);
          }}
        >
          <View style={styles.contactSheet}>
            <View style={styles.sheetHandleBar} />
            <View style={styles.sheetHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>Claim Deal & Contact</Text>
                <Text style={styles.sheetSub}>
                  {contactDeal?.providerName} ({contactDeal?.phone})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setContactDeal(null);
                  setContactSuccess(false);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseCrossIcon size={18} color="#8E8E98" />
              </TouchableOpacity>
            </View>

            {contactSuccess ? (
              <View style={styles.successBox}>
                <GreenCheckCircleIcon size={16} />
                <Text style={styles.successText}>Deal Claimed! Provider will contact you shortly.</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.contactOptionBtn}
                  onPress={() => contactDeal && handleCall(contactDeal.phone)}
                  activeOpacity={0.8}
                >
                  <PhoneReceiverVectorIcon color={colors.primary} size={20} />
                  <View style={styles.contactOptionInfo}>
                    <Text style={styles.contactOptionTitle}>Direct Phone Call</Text>
                    <Text style={styles.contactOptionSub}>{contactDeal?.phone}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.contactOptionBtn, styles.whatsappBtn]}
                  onPress={() =>
                    contactDeal && handleWhatsApp(contactDeal.phone)
                  }
                  activeOpacity={0.8}
                >
                  <WhatsAppIcon size={22} />
                  <View style={styles.contactOptionInfo}>
                    <Text style={styles.contactOptionTitle}>WhatsApp Chat</Text>
                    <Text style={styles.contactOptionSub}>Instant message quote & photos</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function DealsScreen({ onTabChange, currentTab }: DealsViewProps) {
  const router = useRouter();

  const handleTabSelect = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      switch (tab) {
        case 'home':
          router.replace('/landing');
          break;
        case 'services':
          router.replace('/services');
          break;
        case 'deals':
          break;
        case 'profile':
          router.replace('/profile');
          break;
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DealsContent />
      <FloatingNavBar currentTab={currentTab || 'deals'} onSelectTab={handleTabSelect} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentWrapper: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 8,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141416',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242428',
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  iconSlot: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  filterBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141416',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242428',
    height: 42,
    paddingHorizontal: 10,
    marginHorizontal: 3,
  },
  activeFilterBox: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(217, 142, 50, 0.08)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  goldText: {
    color: colors.primary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },

  // Service & Deal Card Styling
  serviceCard: {
    backgroundColor: '#141416',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242428',
    padding: 12,
    flexDirection: 'row',
    marginBottom: 14,
  },
  imageContainer: {
    width: 130,
    height: 138,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#26262B',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  carouselPillBadge: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDotPill: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginRight: 3,
  },
  inactiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 1.5,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F4F4F6',
    lineHeight: 20,
    letterSpacing: -0.2,
    marginTop: 2,
    marginBottom: 3,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#8E8E98',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },
  verifiedText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  dealOfferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  dealOfferText: {
    color: '#34C759',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginLeft: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  metaText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 5,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  viewMoreBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 4,
  },
  viewMoreText: {
    color: '#141416',
    fontSize: 12,
    fontWeight: '700',
  },
  contactBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    marginLeft: 4,
  },
  contactText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 18,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomSpace: {
    height: 100,
  },

  // Modals Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#18181B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A30',
    padding: 20,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#26262B',
  },
  modalOptionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  checkMark: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },

  // Full Details Modal
  fullModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  fullModalContainer: {
    height: '85%',
    backgroundColor: '#141416',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
  },
  sheetHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A40',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#242428',
  },
  detailHeaderTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#8E8E93',
    fontSize: 18,
  },
  modalScroll: {
    flex: 1,
  },
  detailBannerImage: {
    width: '100%',
    height: 200,
  },
  detailBody: {
    padding: 20,
  },
  dealBadgeBanner: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dealBadgeBannerText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  detailTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 6,
    lineHeight: 26,
  },
  priceRowModal: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  detailPrice: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '800',
    marginRight: 10,
  },
  originalPriceText: {
    color: '#8E8E98',
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#242428',
    marginVertical: 10,
  },
  sectionHeader: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  providerNameText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  providerLocText: {
    color: '#8E8E98',
    fontSize: 13,
    marginTop: 2,
  },
  descriptionText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  inclusionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  inclusionText: {
    color: '#DDDDDD',
    fontSize: 14,
    marginLeft: 8,
  },
  modalFooterActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#242428',
    backgroundColor: '#141416',
  },
  callNowFooterBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
  },
  callNowFooterText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Contact Action Sheet
  contactSheet: {
    width: '100%',
    backgroundColor: '#18181B',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#2A2A30',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 2,
  },
  sheetSub: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  contactOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242428',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  whatsappBtn: {
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.3)',
  },
  contactOptionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  contactOptionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  contactOptionSub: {
    color: '#A0A0A8',
    fontSize: 12,
    marginTop: 2,
  },
  requestCallbackBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 6,
  },
  requestCallbackText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successBox: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  successText: {
    color: '#30D158',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});
