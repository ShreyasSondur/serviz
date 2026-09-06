/**
 * SERVIZ Landing & Tab Hub Screen.
 * Holds stationary FloatingNavBar at bottom while dynamically switching views
 * (Home, Services, Deals, Profile) without full page transitions or bar movement.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Dimensions,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import ServizLogo from '@/components/Logo';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import FloatingNavBar, { TabType } from '@/components/FloatingNavBar';
import { ServicesContent } from '@/app/services';
import { DealsContent } from '@/app/deals';
import { ProfileContent } from '@/app/profile';
import { DashboardContent } from '@/app/dashboard';
import {
  SearchIcon,
  LocationPinIcon,
  TargetCrosshairIcon,
  PartnerBadgeIcon,
  ShieldCheckIcon,
  FastTimerIcon,
  SupportHeadsetIcon,
  DashboardIcon,
} from '@/components/LandingIcons';

import useAuth from '@/hooks/useAuth';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

import CustomAlertModal from '@/components/CustomAlertModal';
import api from '@/services/api';

const DEFAULT_EMIRATES = [
  { id: 1, name: 'Dubai' },
  { id: 3, name: 'Ajman' },
  { id: 4, name: 'Sharjah' },
];

const DEFAULT_AREAS = [
  { id: 1, name: 'Downtown Dubai' },
  { id: 2, name: 'Dubai Marina' },
  { id: 3, name: 'Business Bay' },
];

export default function LandingScreen() {
  const router = useRouter();
  const { isPartner } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Catalog API States (loaded smoothly in background without blocking UI)
  const [emiratesList, setEmiratesList] = useState<{ id: number; name: string }[]>(DEFAULT_EMIRATES);
  const [areasList, setAreasList] = useState<{ id: number; name: string }[]>(DEFAULT_AREAS);
  const [servicesList, setServicesList] = useState<{ id: number; name: string }[]>([]);

  const [selectedEmirateObj, setSelectedEmirateObj] = useState<{ id: number; name: string } | null>(DEFAULT_EMIRATES[0]);
  const [selectedAreaObj, setSelectedAreaObj] = useState<{ id: number; name: string } | null>(DEFAULT_AREAS[0]);
  const [selectedServiceObj, setSelectedServiceObj] = useState<{ id: number; name: string } | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [landingModal, setLandingModal] = useState<'emirate' | 'area' | 'service' | null>(null);
  const [serviceSearchFilter, setServiceSearchFilter] = useState('');
  const [alreadyPartnerModal, setAlreadyPartnerModal] = useState(false);

  // Fetch real Emirates, Areas & Admin Services from backend catalog in background
  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const [emiratesRes, servicesRes] = await Promise.all([
          api.get<any[]>('/catalog/emirates'),
          api.get<any[]>('/catalog/services'),
        ]);

        if (!isMounted) return;

        if (emiratesRes.data && emiratesRes.data.length > 0) {
          setEmiratesList(emiratesRes.data);
          const firstEmirate = emiratesRes.data[0];
          setSelectedEmirateObj(firstEmirate);

          // Fetch cities for first emirate
          const citiesRes = await api.get<any[]>(`/catalog/cities?emirate_id=${firstEmirate.id}`);
          if (isMounted && citiesRes.data && citiesRes.data.length > 0) {
            setAreasList(citiesRes.data);
            setSelectedAreaObj(citiesRes.data[0]);
          }
        }

        if (servicesRes.data && servicesRes.data.length > 0) {
          setServicesList(servicesRes.data);
        }
      } catch (err) {
        console.log('Catalog fetch error:', err);
      }
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectEmirate = async (emirate: { id: number; name: string }) => {
    setSelectedEmirateObj(emirate);
    setLandingModal(null);
    try {
      const citiesRes = await api.get<any[]>(`/catalog/cities?emirate_id=${emirate.id}`);
      if (citiesRes.data && citiesRes.data.length > 0) {
        setAreasList(citiesRes.data);
        setSelectedAreaObj(citiesRes.data[0]);
      } else {
        setAreasList([]);
        setSelectedAreaObj(null);
      }
    } catch (err) {
      console.log('Cities fetch error:', err);
    }
  };

  const handleSelectArea = (area: { id: number; name: string }) => {
    setSelectedAreaObj(area);
    setLandingModal(null);
  };

  const handleSelectService = (service: { id: number; name: string }) => {
    setSelectedServiceObj(service);
    setLandingModal(null);
  };

  const handleSearchClick = () => {
    setActiveTab('services');
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Content View based on activeTab */}
      <View style={styles.tabContentArea}>
        {activeTab === 'home' && (
          <ScrollView
            style={styles.homeContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Hero Section */}
            <ImageBackground
              source={require('@/assets/images/hero-bg.png')}
              style={styles.heroBackground}
              imageStyle={styles.heroImageStyle}
              resizeMode="cover"
            >
              {/* Overlay */}
              <View style={styles.heroOverlay}>
                <SafeAreaView style={styles.safeHeader}>
                  <View style={styles.headerRow}>
                    <ServizLogo size="md" />
                  </View>
                </SafeAreaView>

                {/* Hero Headline & Subtitle */}
                <View style={styles.heroTextContainer}>
                  <Text style={styles.heroTitleSerif}>Find trusted</Text>
                  <Text style={styles.heroTitleSerif}>Professionals</Text>
                  <Text style={styles.heroTitleGold}>for every Job.</Text>
                  <Text style={styles.heroSubtitle}>
                    From small fixes to big projects connect with the verified professionals nearby.
                  </Text>
                </View>
              </View>
            </ImageBackground>

            {/* Main Body Content */}
            <View style={styles.bodySection}>
              {/* Search Card Container */}
              <View style={styles.searchCard}>
                {/* Service Category Dropdown */}
                <TouchableOpacity
                  style={styles.searchInputRow}
                  onPress={() => {
                    setServiceSearchFilter('');
                    setLandingModal('service');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconSlot}>
                    <SearchIcon color={colors.primary} size={17} />
                  </View>
                  <Text style={[styles.filterText, !selectedServiceObj && { color: '#666672' }]} numberOfLines={1}>
                    {selectedServiceObj ? selectedServiceObj.name : 'Search service...'}
                  </Text>
                  <Text style={styles.dropdownArrow}>⌄</Text>
                </TouchableOpacity>

                {/* Combined Filters Row */}
                <View style={styles.filterRow}>
                  <TouchableOpacity
                    style={styles.filterBox}
                    onPress={() => setLandingModal('emirate')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconSlot}>
                      <LocationPinIcon color={colors.primary} size={16} />
                    </View>
                    <Text style={styles.filterText} numberOfLines={1}>
                      {selectedEmirateObj ? selectedEmirateObj.name : 'Select Emirate'}
                    </Text>
                    <Text style={styles.dropdownArrow}>⌄</Text>
                  </TouchableOpacity>

                  <View style={styles.filterDivider} />

                  <TouchableOpacity
                    style={styles.filterBox}
                    onPress={() => setLandingModal('area')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconSlot}>
                      <TargetCrosshairIcon color={colors.primary} size={16} />
                    </View>
                    <Text style={styles.filterText} numberOfLines={1}>
                      {selectedAreaObj ? selectedAreaObj.name : 'Select Area'}
                    </Text>
                    <Text style={styles.dropdownArrow}>⌄</Text>
                  </TouchableOpacity>
                </View>

                {/* Pill Search Button */}
                <Button
                  title="Search"
                  showArrow
                  style={styles.searchBtn}
                  onPress={handleSearchClick}
                />
              </View>

              {/* Partner Section Card (Dynamic for Partner vs User) */}
              {isPartner ? (
                <View style={styles.partnerCard}>
                  <View style={styles.partnerLeft}>
                    <PartnerBadgeIcon size={44} />
                    <View style={styles.partnerTextGroup}>
                      <Text style={styles.partnerTitle}>Partner Dashboard</Text>
                      <Text style={styles.partnerSubtext}>
                        Manage listings, active requests & earnings on <Text style={styles.goldHighlight}>Serviz</Text>
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.joinBtn}
                    onPress={() => {
                      router.push('/dashboard');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.joinBtnText}>Dashboard →</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.partnerCard}>
                  <View style={styles.partnerLeft}>
                    <PartnerBadgeIcon size={44} />
                    <View style={styles.partnerTextGroup}>
                      <Text style={styles.partnerTitle}>Become a partner</Text>
                      <Text style={styles.partnerSubtext}>
                        Join thousands of professionals growing with <Text style={styles.goldHighlight}>Serviz</Text>
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.joinBtn}
                    onPress={() => {
                      router.push('/partner-signup');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.joinBtnText}>Join now →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Trust Badges Container */}
              <View style={styles.trustCard}>
                <View style={styles.trustColumn}>
                  <ShieldCheckIcon color={colors.primary} size={26} />
                  <Text style={styles.trustTitle}>Verified{'\n'}Professionals</Text>
                  <Text style={styles.trustSubtext}>Trusted</Text>
                </View>

                <View style={styles.columnDivider} />

                <View style={styles.trustColumn}>
                  <FastTimerIcon color={colors.primary} size={26} />
                  <Text style={styles.trustTitle}>Fast &{'\n'}Reliable</Text>
                  <Text style={styles.trustSubtext}>Nearby</Text>
                </View>

                <View style={styles.columnDivider} />

                <View style={styles.trustColumn}>
                  <SupportHeadsetIcon color={colors.primary} size={26} />
                  <Text style={styles.trustTitle}>24/7{'\n'}Service</Text>
                  <Text style={styles.trustSubtext}>Available</Text>
                </View>
              </View>
            </View>

            {/* Dynamic Catalog Filter Modal */}
            <Modal
              visible={landingModal !== null}
              transparent
              animationType="fade"
              onRequestClose={() => setLandingModal(null)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setLandingModal(null)}
              >
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>
                    Select {landingModal === 'emirate' ? 'Emirate' : landingModal === 'area' ? 'Area' : 'Service Category'}
                  </Text>

                  {landingModal === 'service' && (
                    <View style={styles.modalSearchBox}>
                      <TextInput
                        style={styles.modalSearchInput}
                        placeholder="Search service categories..."
                        placeholderTextColor="#666672"
                        value={serviceSearchFilter}
                        onChangeText={setServiceSearchFilter}
                      />
                    </View>
                  )}

                  <ScrollView style={styles.modalScroll}>
                    {landingModal === 'emirate' &&
                      emiratesList.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.modalItem}
                          onPress={() => handleSelectEmirate(item)}
                        >
                          <Text style={styles.modalItemText}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}

                    {landingModal === 'area' &&
                      areasList.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.modalItem}
                          onPress={() => handleSelectArea(item)}
                        >
                          <Text style={styles.modalItemText}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}

                    {landingModal === 'service' && (
                      <>
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => {
                            setSelectedServiceObj(null);
                            setLandingModal(null);
                          }}
                        >
                          <Text style={[styles.modalItemText, { color: colors.primary, fontWeight: '600' }]}>
                            All Services
                          </Text>
                        </TouchableOpacity>
                        {servicesList
                          .filter((item) =>
                            item.name.toLowerCase().includes(serviceSearchFilter.toLowerCase())
                          )
                          .map((item) => (
                            <TouchableOpacity
                              key={item.id}
                              style={styles.modalItem}
                              onPress={() => handleSelectService(item)}
                            >
                              <Text style={styles.modalItemText}>{item.name}</Text>
                            </TouchableOpacity>
                          ))}
                      </>
                    )}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Custom Already a Partner Alert Modal */}
            <CustomAlertModal
              visible={alreadyPartnerModal}
              icon="🤝"
              title="Already a Partner"
              message="You are already registered as a Serviz Partner. You can manage your business listings directly from your dashboard."
              buttonText="Go to Dashboard"
              onClose={() => {
                setAlreadyPartnerModal(false);
                router.push('/dashboard');
              }}
            />
          </ScrollView>
        )}

        {activeTab === 'services' && <ServicesContent onTabChange={setActiveTab} />}

        {activeTab === 'deals' && <DealsContent />}

        {activeTab === 'profile' && <ProfileContent />}

        {activeTab === 'dashboard' && <DashboardContent />}
      </View>

      {/* Locked Stationary Floating Bottom Navigation Bar */}
      <FloatingNavBar currentTab={activeTab} onSelectTab={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContentArea: {
    flex: 1,
  },
  homeContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroBackground: {
    width: '100%',
    height: 310,
  },
  heroImageStyle: {
    opacity: 0.95,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 16, 0.45)',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 42 : 32,
    paddingBottom: 20,
  },
  safeHeader: {
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dashboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: '#F5B041',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    elevation: 4,
  },
  dashboardBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroTextContainer: {
    marginTop: 12,
    marginBottom: 10,
  },
  heroTitleSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'sans-serif-light',
    fontSize: 30,
    fontWeight: '300',
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: -0.2,
  },
  heroTitleGold: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'sans-serif-medium',
    fontSize: 30,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 38,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#D0D0D8',
    lineHeight: 18,
    maxWidth: '85%',
  },
  bodySection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  searchCard: {
    backgroundColor: '#141416',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#242428',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  iconSlot: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    height: 44,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  filterBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  filterText: {
    flex: 1,
    color: '#A0A0A8',
    fontSize: 13,
    fontWeight: '500',
  },
  dropdownArrow: {
    color: '#666670',
    fontSize: 12,
    marginLeft: 4,
  },
  filterDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#2C2C2E',
  },
  searchBtn: {
    height: 48,
    borderRadius: 24,
  },
  partnerCard: {
    backgroundColor: '#141416',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#242428',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  partnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  partnerTextGroup: {
    marginLeft: 12,
    flex: 1,
  },
  partnerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  partnerSubtext: {
    color: '#8E8E98',
    fontSize: 11,
    lineHeight: 15,
  },
  goldHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  joinBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'transparent',
  },
  joinBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  trustCard: {
    backgroundColor: '#141416',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#242428',
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  trustColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  trustTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 2,
    lineHeight: 14,
  },
  trustSubtext: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  columnDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#242428',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: 380,
    backgroundColor: '#161619',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#26262B',
    padding: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  modalSearchBox: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
    justifyContent: 'center',
  },
  modalSearchInput: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  modalScroll: {
    flexGrow: 0,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#242429',
  },
  modalItemText: {
    color: '#E0E0E6',
    fontSize: 15,
    fontWeight: '500',
  },
});
