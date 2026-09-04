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
  LocationPinSolidIcon,
  CategoryGridIcon,
  FilterSlidersIcon,
  GreenCheckCircleIcon,
  PhoneReceiverVectorIcon,
  MailEnvelopeVectorIcon,
  WhatsAppIcon,
  WhatsAppBadgeIcon,
  PhoneCallBadgeIcon,
  CloseCrossIcon,
} from '@/components/LandingIcons';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import formatUaePhone from '@/utils/phone';
import SwipableImageCarousel from '@/components/SwipableImageCarousel';
import SkeletonCard from '@/components/SkeletonCard';

export interface ServiceItem {
  id: string;
  title: string;
  location: string;
  emirate: string;
  category: string;
  isVerified: boolean;
  image: string;
  rating: number;
  reviewsCount: number;
  price: number;
  providerName: string;
  phone: string;
  email?: string;
  emergencyService?: string;
  providerType?: string;
  description: string;
  inclusions: string[];
  images?: string[];
}

export const MOCK_SERVICES: ServiceItem[] = [];

const EMIRATES = ['All Emirates', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK'];
const AREAS = ['All Areas', 'Warsan', 'Business Bay', 'Dubai Marina', 'Downtown', 'JLT'];
const SORTS = ['Newest to Oldest', 'Oldest to Newest', 'Alphabetical (A-Z)', 'Alphabetical (Z-A)'];

interface ServicesViewProps {
  onTabChange?: (tab: TabType) => void;
  currentTab?: TabType;
}

export function ServicesContent({ onTabChange }: { onTabChange?: (tab: TabType) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmirate, setSelectedEmirate] = useState('All Emirates');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedSort, setSelectedSort] = useState('Newest to Oldest');

  // Backend state - initially empty array to avoid flash of fake data
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter Modals state
  const [activeModalFilter, setActiveModalFilter] = useState<'emirate' | 'area' | 'sort' | null>(
    null
  );

  // Detail & Contact Modals state
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [contactService, setContactService] = useState<ServiceItem | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');

  // Fetch live services from backend
  useEffect(() => {
    async function loadServices() {
      setIsLoading(true);
      try {
        const res = await api.get<any>('/services/');
        const rawItems = Array.isArray(res.data) ? res.data : res.data?.items || [];
        if (rawItems && rawItems.length > 0) {
          const apiServices: ServiceItem[] = rawItems.map((item: any) => ({
            id: item.id.toString(),
            title: item.title,
            location: item.city?.name || 'Warsan',
            emirate: item.city?.emirate?.name || 'Dubai',
            category: item.category?.name || 'Technical Services',
            isVerified: true,
            image:
              item.images && item.images.length > 0
                ? item.images[0]
                : 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600',
            images: item.images && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600'],
            rating: 4.9,
            reviewsCount: 120,
            price: 150,
            providerName: item.partner
              ? `${item.partner.first_name || ''} ${item.partner.last_name || ''}`.trim() || item.partner.business_name || 'Verified Partner'
              : 'Verified Partner',
            phone: item.partner?.phone && item.partner.phone !== 'HIDDEN_LOGIN_REQUIRED' ? item.partner.phone : '+971 52 164 0226',
            email: item.partner?.email || 'info@unifglobal.com',
            emergencyService: item.emergency_service || 'During business hours only',
            providerType: item.provider_type || 'Licensed Company',
            description: item.description || 'Professional handyman services for residential and commercial properties.',
            inclusions: ['Free Consultation', 'Professional Technicians', 'Service Guarantee'],
          }));
          setServicesList(apiServices);
        }
      } catch (err) {
        console.log('Error fetching services:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadServices();
  }, []);

  // Filtered Services logic
  const filteredServices = useMemo(() => {
    return servicesList
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
  }, [servicesList, searchQuery, selectedEmirate, selectedArea, selectedSort]);

  const handleCall = (phone?: string) => {
    const formatted = formatUaePhone(phone);
    Linking.openURL(formatted.telUrl).catch(() => {
      Alert.alert('Contact Provider', `Call provider at: ${formatted.display}`);
    });
  };

  const handleWhatsApp = (phone?: string) => {
    const formatted = formatUaePhone(phone);
    Linking.openURL(formatted.waUrl).catch(() => {
      Alert.alert('Contact Provider', `WhatsApp: ${formatted.display}`);
    });
  };

  const handleSendInquiry = async () => {
    if (!contactService) return;
    try {
      await api.post('/contact/submit', {
        first_name: 'App',
        last_name: 'User',
        email: contactService.email || 'user@example.com',
        message: inquiryMsg || `Inquiry regarding: ${contactService.title}`,
      });
    } catch (_) {}
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactService(null);
      setInquiryMsg('');
    }, 2000);
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

      {/* Services List Scroll Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <SkeletonCard count={3} />
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Services Found</Text>
            <Text style={styles.emptySub}>
              Try adjusting your search keywords or filter criteria.
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
          filteredServices.map((item) => (
            <View key={item.id} style={styles.serviceCard}>
              {/* Left Image Column with Swipable Carousel */}
              <SwipableImageCarousel
                images={item.images && item.images.length > 0 ? item.images : [item.image]}
                height={132}
                width={130}
              />

              {/* Right Details Column */}
              <View style={styles.detailsContainer}>
                {/* Verified Badge Row */}
                <View style={styles.verifiedRow}>
                  <VerifiedBadgeIcon size={16} />
                  <Text style={styles.verifiedText}>VERIFIED USER</Text>
                </View>

                {/* Title */}
                <Text style={styles.serviceTitle} numberOfLines={2}>
                  {item.title}
                </Text>

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
                    onPress={() => setSelectedService(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewMoreText}>View More</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.contactBtn}
                    onPress={() => setContactService(item)}
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

      {/* Service Details Mobile View Modal (Matching Website Screenshot) */}
      <Modal
        visible={selectedService !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedService(null)}
      >
        <SafeAreaView style={styles.mobileDetailContainer}>
          {selectedService && (
            <View style={{ flex: 1 }}>
              {/* Top Navigation Bar: ← Back to Services */}
              <View style={styles.webHeaderRow}>
                <TouchableOpacity
                  style={styles.backNavBtn}
                  onPress={() => setSelectedService(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backNavText}>← Back to Services</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.webDetailScroll}>
                {/* Service Title */}
                <Text style={styles.webTitleText}>{selectedService.title}</Text>

                {/* Main Banner Image Container */}
                <View style={styles.webImageCard}>
                  <Image
                    source={{ uri: selectedService.image }}
                    style={styles.webMainImage}
                    resizeMode="cover"
                  />
                </View>

                {/* POSTED BY Card */}
                <View style={styles.webCardBox}>
                  <Text style={styles.webCardSubHeader}>POSTED BY</Text>
                  <View style={styles.postedByRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarInitial}>
                        {selectedService.providerName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.postedByNameCol}>
                      <Text style={styles.postedByName}>{selectedService.providerName}</Text>
                      <View style={styles.verifiedPartnerBadge}>
                        <Text style={styles.checkIconSmall}>✓</Text>
                        <Text style={styles.verifiedPartnerText}>VERIFIED PARTNER</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.goldContactNowBtn}
                    onPress={() => {
                      const svc = selectedService;
                      setSelectedService(null);
                      setContactService(svc);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.goldContactNowText}>Contact Now</Text>
                  </TouchableOpacity>
                </View>

                {/* Details Card */}
                <View style={styles.webCardBox}>
                  <Text style={styles.webCardOrangeHeader}>Details</Text>

                  <View style={styles.detailPairRow}>
                    <Text style={styles.detailPairLabel}>Service Category</Text>
                    <Text style={styles.detailPairValue}>{selectedService.category}</Text>
                  </View>

                  <View style={styles.detailPairRow}>
                    <Text style={styles.detailPairLabel}>Emergency Service</Text>
                    <Text style={styles.detailPairValue}>
                      {selectedService.emergencyService || 'During business hours only'}
                    </Text>
                  </View>

                  <View style={styles.detailPairRow}>
                    <Text style={styles.detailPairLabel}>Provider Type</Text>
                    <Text style={styles.detailPairValue}>
                      {selectedService.providerType || 'Licensed Company'}
                    </Text>
                  </View>
                </View>

                {/* Location Card */}
                <View style={styles.webCardBox}>
                  <Text style={styles.webCardOrangeHeader}>Location</Text>
                  <View style={styles.locationRow}>
                    <LocationPinSolidIcon color="#A0A0A8" size={16} />
                    <Text style={styles.locationText}>
                      {selectedService.location}, {selectedService.emirate}
                    </Text>
                  </View>
                </View>

                {/* Description Card */}
                <View style={styles.webCardBox}>
                  <Text style={styles.webCardOrangeHeader}>Description</Text>
                  <Text style={styles.webDescriptionBody}>{selectedService.description}</Text>
                </View>
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Contact Action Sheet Modal ("Contact Now") */}
      <Modal
        visible={contactService !== null}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setContactService(null);
          setContactSuccess(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setContactService(null);
            setContactSuccess(false);
          }}
        >
          <View style={styles.contactSheet}>
            <View style={styles.sheetHandleBar} />
            <View style={styles.sheetHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>Contact Provider</Text>
                <Text style={styles.sheetSub}>
                  {contactService?.providerName} ({formatUaePhone(contactService?.phone).display})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setContactService(null);
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
                <Text style={styles.successText}>Request Sent! Provider will call back shortly.</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.contactOptionBtn}
                  onPress={() => contactService && handleCall(contactService.phone)}
                  activeOpacity={0.8}
                >
                  <PhoneCallBadgeIcon size={44} />
                  <View style={styles.contactOptionInfo}>
                    <Text style={styles.contactOptionTitle}>Direct Phone Call</Text>
                    <Text style={styles.contactOptionSub}>
                      {formatUaePhone(contactService?.phone).display}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.contactOptionBtn, styles.whatsappBtn]}
                  onPress={() =>
                    contactService && handleWhatsApp(contactService.phone)
                  }
                  activeOpacity={0.8}
                >
                  <WhatsAppBadgeIcon size={44} />
                  <View style={styles.contactOptionInfo}>
                    <Text style={styles.contactOptionTitle}>WhatsApp Chat</Text>
                    <Text style={styles.contactOptionSub}>
                      Instant message quote & photos ({formatUaePhone(contactService?.phone).display})
                    </Text>
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

export default function ServicesScreen({ onTabChange, currentTab }: ServicesViewProps) {
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
          break;
        case 'deals':
          router.replace('/deals');
          break;
        case 'profile':
          router.replace('/profile');
          break;
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ServicesContent onTabChange={handleTabSelect} />
      <FloatingNavBar currentTab={currentTab || 'services'} onSelectTab={handleTabSelect} />
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

  // Service Card Styling
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
    height: 132,
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
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F4F4F6',
    lineHeight: 20,
    letterSpacing: -0.2,
    marginVertical: 3,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
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

  // Screenshot-Matching Mobile Detail Screen Styles
  mobileDetailContainer: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  webHeaderRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backNavBtn: {
    paddingVertical: 4,
  },
  backNavText: {
    color: '#8E8E98',
    fontSize: 14,
    fontWeight: '600',
  },
  webDetailScroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  webTitleText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginVertical: 12,
  },
  webImageCard: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1C1C20',
    borderWidth: 1,
    borderColor: '#242428',
    marginBottom: 16,
  },
  webMainImage: {
    width: '100%',
    height: '100%',
  },
  webCardBox: {
    backgroundColor: '#141416',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242428',
    padding: 16,
    marginBottom: 14,
  },
  webCardSubHeader: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  webCardOrangeHeader: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  postedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C20',
    marginRight: 12,
  },
  avatarInitial: {
    color: '#D4D4D8',
    fontSize: 18,
    fontWeight: '700',
  },
  postedByNameCol: {
    flex: 1,
  },
  postedByName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  verifiedPartnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIconSmall: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '900',
    marginRight: 4,
  },
  verifiedPartnerText: {
    color: '#007AFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  goldContactNowBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  goldContactNowText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  detailPairRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F23',
  },
  detailPairLabel: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  detailPairValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  webDescriptionBody: {
    color: '#D4D4D8',
    fontSize: 14,
    lineHeight: 22,
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

  sheetHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A40',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
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
