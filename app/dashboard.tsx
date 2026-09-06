/**
 * SERVIZ Partner Services & Deals Dashboard Screen.
 * Premium mobile UI/UX dashboard with generous spacing, rich typography,
 * live stat counters (0/6 Services, 0/2 Deals), dynamic card lists, and interactive modals.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import ServizLogo from '@/components/Logo';
import Input from '@/components/Input';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import FloatingNavBar, { TabType } from '@/components/FloatingNavBar';
import { takePhotoWithCamera, pickImageFromLibrary } from '@/utils/imagePicker';
import ImageSourceModal from '@/components/ImageSourceModal';
import ApplicationReceivedModal from '@/components/ApplicationReceivedModal';
import PartnerVerifiedModal from '@/components/PartnerVerifiedModal';
import LoadingModal from '@/components/LoadingModal';
import CustomAlertModal from '@/components/CustomAlertModal';
import DatePickerModal from '@/components/DatePickerModal';
import { SkeletonCard } from '@/components/SkeletonCard';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import {
  BriefcaseIcon,
  TagCouponIcon,
  PlusIcon,
  GreenCheckCircleIcon,
  UploadTrayIcon,
  CloseCrossIcon,
  CalendarIcon,
  BackArrowIcon,
} from '@/components/LandingIcons';
import api from '@/services/api';
import useAuth from '@/hooks/useAuth';

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  rate: string;
  description: string;
  emirate?: string;
  area?: string;
  availability?: string;
  providerType?: string;
  images?: string[];
  status: 'Active' | 'Pending';
}

export interface DealItem {
  id: string;
  title: string;
  discount: string;
  description: string;
  category?: string;
  emirate?: string;
  area?: string;
  expiryDate?: string;
  images?: string[];
}

export function DashboardContent() {
  const router = useRouter();
  const { isPartner } = useAuth();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [partnerStatus, setPartnerStatus] = useState<'PENDING' | 'VERIFIED' | null>(null);

  // State for services, deals & partner profile stats
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [servicesLimit, setServicesLimit] = useState<number>(6);
  const [dealsLimit, setDealsLimit] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Catalog States
  const [catalogEmirates, setCatalogEmirates] = useState<any[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<any[]>([]);
  const [catalogCities, setCatalogCities] = useState<any[]>([]);

  // Selected Catalog Objects for Service
  const [serviceEmirateObj, setServiceEmirateObj] = useState<any | null>(null);
  const [serviceAreaObj, setServiceAreaObj] = useState<any | null>(null);
  const [serviceCategoryObj, setServiceCategoryObj] = useState<any | null>(null);

  // Selected Catalog Objects for Deal
  const [dealEmirateObj, setDealEmirateObj] = useState<any | null>(null);
  const [dealAreaObj, setDealAreaObj] = useState<any | null>(null);
  const [dealCategoryObj, setDealCategoryObj] = useState<any | null>(null);

  // Editing & Loading states
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [submittingFormTitle, setSubmittingFormTitle] = useState('Saving...');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  // Modal states
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [isDealModalVisible, setIsDealModalVisible] = useState(false);

  // Picker Modal State for dropdown selections inside Modals
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');
  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    onSelect: (val: string) => void;
  }>({
    visible: false,
    title: '',
    options: [],
    onSelect: () => { },
  });

  // Form states - Service
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [serviceEmirate, setServiceEmirate] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [serviceAvailability, setServiceAvailability] = useState('Available 24/7');
  const [serviceProviderType, setServiceProviderType] = useState('Licensed Company');
  const [serviceImages, setServiceImages] = useState<string[]>([]);

  // Form states - Deal
  const [dealTitle, setDealTitle] = useState('');
  const [dealDescription, setDealDescription] = useState('');
  const [dealCategory, setDealCategory] = useState('');
  const [dealEmirate, setDealEmirate] = useState('');
  const [dealArea, setDealArea] = useState('');
  const [dealDiscountDesc, setDealDiscountDesc] = useState('');
  const [dealExpiryDate, setDealExpiryDate] = useState('');
  const [dealImages, setDealImages] = useState<string[]>([]);

  // Fetch partner data from API concurrently for instant 3x loading speed
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileRes, servicesRes, dealsRes] = await Promise.all([
        api.get<any>('/partner/profile'),
        api.get<any[]>('/partner/services'),
        api.get<any[]>('/partner/deals'),
      ]);

      if (profileRes.data) {
        const verified = profileRes.data.is_verified === true || profileRes.data.status === 'VERIFIED';
        setIsVerified(verified);
        if (profileRes.data.status) setPartnerStatus(profileRes.data.status);
        if (profileRes.data.services_limit) setServicesLimit(profileRes.data.services_limit);
        if (profileRes.data.deals_limit) setDealsLimit(profileRes.data.deals_limit);
      }

      if (servicesRes.data) {
        const fetchedServices: ServiceItem[] = servicesRes.data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          category: item.category?.name || 'Technical Services',
          rate: '',
          description: item.description || '',
          emirate: item.city?.emirate?.name || 'Dubai',
          area: item.city?.name || 'Warsan',
          availability: item.emergency_service || 'Available 24/7',
          providerType: item.provider_type || 'Licensed Company',
          images: item.images || [],
          status: 'Active',
        }));
        setServices(fetchedServices);
      }

      if (dealsRes.data) {
        const fetchedDeals: DealItem[] = dealsRes.data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          discount: item.discount_desc || 'Special Offer',
          description: item.description || '',
          category: item.category?.name || 'Technical Services',
          emirate: item.city?.emirate?.name || 'Dubai',
          area: item.city?.name || 'All Areas',
          expiryDate: item.expiry_date || 'Ongoing',
          images: item.images || [],
        }));
        setDeals(fetchedDeals);
      }
    } catch (err: any) {
      console.log('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch real Catalog Emirates & Admin Services (Categories)
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [emRes, catRes] = await Promise.all([
          api.get<any[]>('/catalog/emirates'),
          api.get<any[]>('/catalog/services'),
        ]);
        if (emRes.data && emRes.data.length > 0) {
          setCatalogEmirates(emRes.data);
        }
        if (catRes.data && catRes.data.length > 0) {
          setCatalogCategories(catRes.data);
        }
      } catch (err) {
        console.log('Error loading catalog data:', err);
      }
    }
    loadCatalog();
  }, []);

  const handleEmirateSelectForService = async (selectedName: string) => {
    setServiceEmirate(selectedName);
    setServiceArea('');
    setServiceAreaObj(null);
    const matched = catalogEmirates.find((e) => e.name === selectedName);
    if (matched) {
      setServiceEmirateObj(matched);
      try {
        const citiesRes = await api.get<any[]>(`/catalog/cities?emirate_id=${matched.id}`);
        if (citiesRes.data) {
          setCatalogCities(citiesRes.data);
        } else {
          setCatalogCities([]);
        }
      } catch (err) {
        console.log('Error fetching cities for service emirate:', err);
      }
    }
  };

  const handleEmirateSelectForDeal = async (selectedName: string) => {
    setDealEmirate(selectedName);
    setDealArea('');
    setDealAreaObj(null);
    const matched = catalogEmirates.find((e) => e.name === selectedName);
    if (matched) {
      setDealEmirateObj(matched);
      try {
        const citiesRes = await api.get<any[]>(`/catalog/cities?emirate_id=${matched.id}`);
        if (citiesRes.data) {
          setCatalogCities(citiesRes.data);
        } else {
          setCatalogCities([]);
        }
      } catch (err) {
        console.log('Error fetching cities for deal emirate:', err);
      }
    }
  };

  // Sample placeholder images for uploaded service/deal images
  const sampleUploadImages = [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60',
  ];

  const [sourceModalTarget, setSourceModalTarget] = useState<'service' | 'deal' | null>(null);

  // Upload Real Device Images (Camera or Photo Library custom modal)
  const handleUploadServiceImage = () => {
    if (serviceImages.length >= 4) {
      showAlert('Limit Reached', 'You can upload a maximum of 4 images.', 'info');
      return;
    }
    setSourceModalTarget('service');
  };

  const handleUploadDealImage = () => {
    if (dealImages.length >= 4) {
      showAlert('Limit Reached', 'You can upload a maximum of 4 images.', 'info');
      return;
    }
    setSourceModalTarget('deal');
  };

  const handleRemoveServiceImage = (index: number) => {
    setServiceImages(serviceImages.filter((_, i) => i !== index));
  };

  const handleRemoveDealImage = (index: number) => {
    setDealImages(dealImages.filter((_, i) => i !== index));
  };

  // Edit Service Handler
  const handleEditService = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setServiceTitle(service.title);
    setServiceDescription(service.description);
    setServiceCategory(service.category);
    setServiceEmirate(service.emirate || '');
    setServiceArea(service.area || '');
    setServiceAvailability(service.availability || 'Available 24/7');
    setServiceProviderType(service.providerType || 'Licensed Company');
    setServiceImages(service.images || []);
    setIsServiceModalVisible(true);
  };

  // Edit Deal Handler
  const handleEditDeal = (deal: DealItem) => {
    setEditingDealId(deal.id);
    setDealTitle(deal.title);
    setDealDescription(deal.description);
    setDealCategory(deal.category || '');
    setDealEmirate(deal.emirate || '');
    setDealArea(deal.area || '');
    setDealDiscountDesc(deal.discount);
    setDealExpiryDate(deal.expiryDate || '');
    setDealImages(deal.images || []);
    setIsDealModalVisible(true);
  };

  // Save Service Handler (Create or Update)
  const handleAddService = async () => {
    if (isSubmittingForm) return;

    const missingFields: string[] = [];
    if (!serviceTitle.trim()) missingFields.push('Listing Title');
    if (!serviceDescription.trim()) missingFields.push('Description');
    if (!serviceCategory.trim()) missingFields.push('Service Category');
    if (!serviceEmirate.trim()) missingFields.push('Emirate');
    if (!serviceArea.trim()) missingFields.push('Area');
    if (serviceImages.length === 0) missingFields.push('Service Image (At least 1)');

    if (missingFields.length > 0) {
      showAlert(
        'Missing Required Fields',
        `Please complete all compulsory fields before saving your service:\n\n• ${missingFields.join('\n• ')}`,
        'error'
      );
      // DO NOT reset form data, DO NOT close modal
      return;
    }

    if (!editingServiceId && services.length >= servicesLimit) {
      showAlert('Limit Reached', `Service limit of ${servicesLimit} reached.`, 'error');
      return;
    }

    setIsSubmittingForm(true);
    setSubmittingFormTitle(editingServiceId ? 'Updating Service...' : 'Creating Service...');

    try {
      const matchedCat = catalogCategories.find((c) => c.name === serviceCategory) || catalogCategories[0];
      const matchedCity = catalogCities.find((c) => c.name === serviceArea) || catalogCities[0];

      const payload = {
        category_id: matchedCat?.id || 1,
        city_id: matchedCity?.id || 1,
        title: serviceTitle.trim(),
        description: serviceDescription.trim(),
        images: serviceImages,
        emergency_service: serviceAvailability,
        provider_type: serviceProviderType,
      };

      const res = editingServiceId
        ? await api.put<any>(`/partner/services/${editingServiceId}`, payload)
        : await api.post<any>('/partner/services', payload);

      if (res.error) {
        showAlert(editingServiceId ? 'Error Updating Service' : 'Error Creating Service', res.error, 'error');
        return;
      }

      showAlert('Success', editingServiceId ? 'Service updated successfully!' : 'Service created successfully!', 'success');
      resetServiceForm();
      setIsServiceModalVisible(false);
      fetchDashboardData();
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to save service', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setServiceTitle('');
    setServiceDescription('');
    setServiceCategory('');
    setServiceEmirate('');
    setServiceArea('');
    setServiceAvailability('Available 24/7');
    setServiceProviderType('Licensed Company');
    setServiceImages([]);
    setServiceEmirateObj(null);
    setServiceAreaObj(null);
    setServiceCategoryObj(null);
  };

  // Save Deal Handler (Create or Update)
  const handleAddDeal = async () => {
    if (isSubmittingForm) return;

    const missingFields: string[] = [];
    if (!dealTitle.trim()) missingFields.push('Deal Title');
    if (!dealDescription.trim()) missingFields.push('Deal Description');
    if (!dealCategory.trim()) missingFields.push('Service Category');
    if (!dealEmirate.trim()) missingFields.push('Emirate');
    if (!dealArea.trim()) missingFields.push('Area');
    if (!dealDiscountDesc.trim()) missingFields.push('Discount Description');
    if (!dealExpiryDate.trim()) missingFields.push('Expiry Date');
    if (dealImages.length === 0) missingFields.push('Deal Image (At least 1)');

    if (missingFields.length > 0) {
      showAlert(
        'Missing Required Fields',
        `Please complete all compulsory fields before publishing your deal:\n\n• ${missingFields.join('\n• ')}`,
        'error'
      );
      // DO NOT reset form data, DO NOT close modal
      return;
    }

    if (!editingDealId && deals.length >= dealsLimit) {
      showAlert('Limit Reached', `Deal limit of ${dealsLimit} reached.`, 'error');
      return;
    }

    setIsSubmittingForm(true);
    setSubmittingFormTitle(editingDealId ? 'Updating Deal...' : 'Publishing Deal...');

    try {
      let formattedExpiry = new Date('2026-12-31T23:59:59Z').toISOString();
      if (dealExpiryDate.trim()) {
        const parsed = new Date(dealExpiryDate);
        if (!isNaN(parsed.getTime())) {
          formattedExpiry = parsed.toISOString();
        }
      }

      const matchedCat = catalogCategories.find((c) => c.name === dealCategory) || catalogCategories[0];
      const matchedCity = catalogCities.find((c) => c.name === dealArea) || catalogCities[0];

      const payload = {
        category_id: matchedCat?.id || 1,
        city_id: matchedCity?.id || 1,
        title: dealTitle.trim(),
        description: dealDescription.trim(),
        images: dealImages,
        discount_desc: dealDiscountDesc.trim(),
        expiry_date: formattedExpiry,
      };

      const res = editingDealId
        ? await api.put<any>(`/partner/deals/${editingDealId}`, payload)
        : await api.post<any>('/partner/deals', payload);

      if (res.error) {
        showAlert(editingDealId ? 'Error Updating Deal' : 'Error Creating Deal', res.error, 'error');
        return;
      }

      showAlert('Success', editingDealId ? 'Deal updated successfully!' : 'Deal published successfully!', 'success');
      resetDealForm();
      setIsDealModalVisible(false);
      fetchDashboardData();
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to save deal', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const resetDealForm = () => {
    setEditingDealId(null);
    setDealTitle('');
    setDealDescription('');
    setDealCategory('');
    setDealEmirate('');
    setDealArea('');
    setDealDiscountDesc('');
    setDealExpiryDate('');
    setDealImages([]);
  };

  // Delete Service with loading feedback & custom alert
  const handleDeleteService = async (id: string) => {
    if (isSubmittingForm) return;
    setIsSubmittingForm(true);
    setSubmittingFormTitle('Deleting Service...');

    try {
      const res = await api.delete<any>(`/partner/services/${id}`);
      if (res.error) {
        showAlert('Error Deleting Service', res.error, 'error');
        return;
      }
      showAlert('Service Deleted', 'The service listing has been removed successfully.', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to delete service', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Delete Deal with loading feedback & custom alert
  const handleDeleteDeal = async (id: string) => {
    if (isSubmittingForm) return;
    setIsSubmittingForm(true);
    setSubmittingFormTitle('Deleting Deal...');

    try {
      const res = await api.delete<any>(`/partner/deals/${id}`);
      if (res.error) {
        showAlert('Error Deleting Deal', res.error, 'error');
        return;
      }
      showAlert('Deal Deleted', 'The exclusive deal offer has been removed successfully.', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to delete deal', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const serviceProgressPercent = Math.min((services.length / servicesLimit) * 100, 100);
  const dealProgressPercent = Math.min((deals.length / dealsLimit) * 100, 100);

  // Dropdown options (Sorted Alphabetically A-Z)
  const categoryOptions = (
    catalogCategories.length > 0
      ? catalogCategories.map((c) => c.name)
      : [
        'AC & Cooling Services',
        'Deep Cleaning & Maid',
        'Plumbing & Leak Repair',
        'Electrical & Wiring',
        'Painting & Handyman',
        'Carpentry & Fitouts',
        'Pest Control',
      ]
  ).sort((a, b) => a.localeCompare(b));

  const emirateOptions = (
    catalogEmirates.length > 0
      ? catalogEmirates.map((e) => e.name)
      : [
        'Dubai',
        'Abu Dhabi',
        'Sharjah',
        'Ajman',
        'Ras Al Khaimah',
        'Fujairah',
        'Umm Al Quwain',
      ]
  ).sort((a, b) => a.localeCompare(b));

  const areaOptions = (
    catalogCities.length > 0
      ? catalogCities.map((c) => c.name)
      : [
        'Downtown Dubai',
        'Dubai Marina',
        'Business Bay',
        'Jumeirah',
        'Palm Jumeirah',
      ]
  ).sort((a, b) => a.localeCompare(b));

  const availabilityOptions = ['Available 24/7', 'Standard Hours', 'On Demand'];

  const providerTypeOptions = [
    'Licensed Company',
    'Freelancer / Individual',
    'Registered Business',
  ];

  const openPicker = (title: string, options: string[], onSelect: (val: string) => void) => {
    setPickerSearchQuery('');
    setPickerConfig({
      visible: true,
      title,
      options: [...options].sort((a, b) => a.localeCompare(b)),
      onSelect: (selectedVal: string) => {
        onSelect(selectedVal);
        setPickerConfig((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  if (isLoading || partnerStatus === null) {
    return (
      <View style={styles.contentWrapper}>
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/landing')}
            activeOpacity={0.8}
          >
            <BackArrowIcon color="#FFFFFF" size={16} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <DashboardSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (!isVerified || partnerStatus !== 'VERIFIED') {
    return (
      <View style={styles.contentWrapper}>
        <ApplicationReceivedModal
          visible={true}
          onClose={() => router.replace('/landing')}
        />
      </View>
    );
  }

  return (
    <View style={styles.contentWrapper}>
      {/* Top Header Navigation Bar with Back Action */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/landing')}
          activeOpacity={0.8}
        >
          <BackArrowIcon color="#FFFFFF" size={16} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Header & Stat Cards Area */}
        <View style={styles.headerSection}>
          <View style={styles.titleTextGroup}>
            <Text style={styles.pageTitleSerif}>
              My <Text style={styles.pageTitleGold}>Services</Text>
            </Text>
            <Text style={styles.pageSubtitle}>
              Manage, update or remove the services you have posted.
            </Text>
          </View>

          {/* Top Right / Row Stat Cards */}
          <View style={styles.statsRow}>
            {/* Stat Card 1: Services Posted */}
            <View style={styles.statCard}>
              <View style={styles.statTopRow}>
                <View style={styles.iconBadge}>
                  <BriefcaseIcon color={colors.primary} size={20} />
                </View>
                <View style={styles.statCountGroup}>
                  <Text style={styles.statCountText}>
                    {services.length}{' '}
                    <Text style={styles.statLimitText}>/ {servicesLimit}</Text>
                  </Text>
                  <Text style={styles.statLabelText}>SERVICES POSTED</Text>
                </View>
              </View>
              {/* Progress Line */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${serviceProgressPercent}%` }]} />
              </View>
            </View>

            {/* Stat Card 2: Deals Posted */}
            <View style={styles.statCard}>
              <View style={styles.statTopRow}>
                <View style={styles.iconBadge}>
                  <TagCouponIcon color={colors.primary} size={20} />
                </View>
                <View style={styles.statCountGroup}>
                  <Text style={styles.statCountText}>
                    {deals.length}{' '}
                    <Text style={styles.statLimitText}>/ {dealsLimit}</Text>
                  </Text>
                  <Text style={styles.statLabelText}>DEALS POSTED</Text>
                </View>
              </View>
              {/* Progress Line */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${dealProgressPercent}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 1: Exclusive Deals */}
        <View style={styles.sectionContainer}>
          {/* Header Row */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <View style={styles.sectionHeaderLeft}>
                <TagCouponIcon color={colors.primary} size={20} />
                <Text style={styles.sectionTitle}>
                  Exclusive Deals ({deals.length}/{dealsLimit})
                </Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Promote your best services with exclusive offers.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.addGoldBtn,
                deals.length >= dealsLimit && styles.disabledBtn,
              ]}
              onPress={() => setIsDealModalVisible(true)}
              disabled={deals.length >= dealsLimit}
              activeOpacity={0.8}
            >
              <PlusIcon color="#FFFFFF" size={13} />
              <Text style={styles.addGoldBtnText}>Add a new deal</Text>
            </TouchableOpacity>
          </View>

          {/* Deals Card Container */}
          <View style={styles.cardBox}>
            {deals.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBadge}>
                  <TagCouponIcon color="#666672" size={26} />
                </View>
                <Text style={styles.emptyText}>No deals posted yet.</Text>
                <Text style={styles.emptySubtext}>
                  Create your first limited-time offer to attract more clients.
                </Text>
              </View>
            ) : (
              deals.map((deal) => (
                <View key={deal.id} style={styles.itemCard}>
                  <View style={styles.itemCardLeft}>
                    <Image
                      source={{
                        uri:
                          deal.images && deal.images.length > 0
                            ? deal.images[0]
                            : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500',
                      }}
                      style={styles.cardThumbnail}
                    />
                    <View style={styles.itemTextGroup}>
                      <View style={styles.titleWithBadgeRow}>
                        <Text style={styles.itemTitle}>{deal.title}</Text>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>{deal.discount}</Text>
                        </View>
                      </View>

                      <Text style={styles.serviceSubDetails}>
                        {deal.category || 'Technical Services'} • {deal.emirate || 'Dubai'} {deal.area ? `(${deal.area})` : ''}
                      </Text>

                      {deal.description ? (
                        <Text style={styles.itemDescription} numberOfLines={2}>
                          {deal.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.cardActionsColumn}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => handleEditDeal(deal)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteDeal(deal.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* SECTION 2: All Services */}
        <View style={styles.sectionContainer}>
          {/* Header Row */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <View style={styles.sectionHeaderLeft}>
                <BriefcaseIcon color={colors.primary} size={20} />
                <Text style={styles.sectionTitle}>
                  All Services ({services.length})
                </Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Manage your active listings and offerings.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.addGoldBtn,
                services.length >= servicesLimit && styles.disabledBtn,
              ]}
              onPress={() => {
                resetServiceForm();
                setIsServiceModalVisible(true);
              }}
              disabled={services.length >= servicesLimit}
              activeOpacity={0.8}
            >
              <PlusIcon color="#FFFFFF" size={13} />
              <Text style={styles.addGoldBtnText}>Add Service</Text>
            </TouchableOpacity>
          </View>

          {/* Services Card Container */}
          <View style={styles.cardBox}>
            {services.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBadge}>
                  <BriefcaseIcon color="#666672" size={26} />
                </View>
                <Text style={styles.emptyText}>No services posted yet.</Text>
                <Text style={styles.emptySubtext}>
                  Add the services you offer to start receiving booking requests.
                </Text>
              </View>
            ) : (
              services.map((service) => (
                <View key={service.id} style={styles.itemCard}>
                  <View style={styles.itemCardLeft}>
                    <Image
                      source={{
                        uri:
                          service.images && service.images.length > 0
                            ? service.images[0]
                            : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500',
                      }}
                      style={styles.cardThumbnail}
                    />
                    <View style={styles.itemTextGroup}>
                      <View style={styles.titleWithBadgeRow}>
                        <Text style={styles.itemTitle}>{service.title}</Text>
                        <View style={styles.activePill}>
                          <GreenCheckCircleIcon size={12} />
                          <Text style={styles.activePillText}>{service.status}</Text>
                        </View>
                      </View>

                      <Text style={styles.serviceSubDetails}>
                        {service.category} • {service.emirate || 'Dubai'} {service.area ? `(${service.area})` : ''}
                      </Text>

                      {service.description ? (
                        <Text style={styles.itemDescription} numberOfLines={2}>
                          {service.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.cardActionsColumn}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => handleEditService(service)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteService(service.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* MODAL 1: Add Exclusive Deal */}
      <Modal
        visible={isDealModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDealModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerLarge}>
            {/* Header with Title, Subtitle, and Close '✕' Button */}
            <View style={styles.formHeaderRow}>
              <View style={styles.formHeaderLeft}>
                <Text style={styles.formModalTitleSerif}>
                  Add <Text style={styles.formModalTitleGold}>Exclusive Deal</Text>
                </Text>
                <Text style={styles.formModalSub}>
                  Provide a special discount or offer to attract clients.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeCrossBtn}
                onPress={() => setIsDealModalVisible(false)}
                activeOpacity={0.7}
              >
                <CloseCrossIcon color="#8E8E98" size={16} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.formScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 1. DEAL TITLE */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DEAL TITLE</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 50% Off AC Deep Cleaning & Disinfection"
                  placeholderTextColor="#666670"
                  value={dealTitle}
                  onChangeText={setDealTitle}
                />
              </View>

              {/* 2. DEAL DESCRIPTION */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DEAL DESCRIPTION</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput]}
                  placeholder="Specify what the special discount covers and any terms..."
                  placeholderTextColor="#666670"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={dealDescription}
                  onChangeText={setDealDescription}
                />
              </View>

              {/* 3. SERVICE CATEGORY */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>SERVICE CATEGORY</Text>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() =>
                    openPicker('Select Service Category', categoryOptions, (val) =>
                      setDealCategory(val)
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !dealCategory && styles.dropdownPlaceholder,
                    ]}
                  >
                    {dealCategory || 'Select Service Category...'}
                  </Text>
                  <Text style={styles.dropdownArrowIcon}>⌄</Text>
                </TouchableOpacity>
              </View>

              {/* 4. EMIRATE & AREA (Two-Column Row) */}
              <View style={styles.twoColumnRow}>
                {/* Left: EMIRATE */}
                <View style={styles.flexColumn}>
                  <Text style={styles.formLabel}>EMIRATE</Text>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() =>
                      openPicker('Select Emirate', emirateOptions, (val) =>
                        handleEmirateSelectForDeal(val)
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !dealEmirate && styles.dropdownPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {dealEmirate || 'Select Emirate...'}
                    </Text>
                    <Text style={styles.dropdownArrowIcon}>⌄</Text>
                  </TouchableOpacity>
                </View>

                {/* Right: AREA */}
                <View style={styles.flexColumn}>
                  <Text style={styles.formLabel}>AREA</Text>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() =>
                      openPicker('Select Area', areaOptions, (val) => setDealArea(val))
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !dealArea && styles.dropdownPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {dealArea || 'Select Area...'}
                    </Text>
                    <Text style={styles.dropdownArrowIcon}>⌄</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 5. DEAL IMAGES (MAX 4) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DEAL IMAGES (MAX 4)</Text>

                <TouchableOpacity
                  style={styles.uploadDashedContainer}
                  onPress={handleUploadDealImage}
                  activeOpacity={0.8}
                >
                  <UploadTrayIcon color="#8E8E98" size={28} />
                  <Text style={styles.uploadText}>UPLOAD IMAGES</Text>
                </TouchableOpacity>

                {/* Uploaded Thumbnails Preview Row */}
                {dealImages.length > 0 && (
                  <View style={styles.thumbnailRow}>
                    {dealImages.map((uri, index) => (
                      <View key={index} style={styles.thumbnailWrapper}>
                        <Image source={{ uri }} style={styles.thumbnailImage} />
                        <TouchableOpacity
                          style={styles.removeThumbnailBtn}
                          onPress={() => handleRemoveDealImage(index)}
                        >
                          <Text style={styles.removeThumbnailText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* 6. DISCOUNT DESCRIPTION */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DISCOUNT DESCRIPTION</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 25% Flat Discount on all bookings this weekend"
                  placeholderTextColor="#666670"
                  value={dealDiscountDesc}
                  onChangeText={setDealDiscountDesc}
                />
              </View>

              {/* 7. EXPIRY DATE */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>EXPIRY DATE</Text>
                <TouchableOpacity
                  style={styles.dateInputWrapper}
                  onPress={() => setIsDatePickerVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !dealExpiryDate && styles.dropdownPlaceholder,
                    ]}
                  >
                    {dealExpiryDate || 'Select Expiry Date...'}
                  </Text>
                  <CalendarIcon color={colors.primary} size={18} />
                </TouchableOpacity>
              </View>

              {/* 8. Publish Deal Button */}
              <Button
                title="Publish Deal"
                onPress={handleAddDeal}
                style={styles.createServiceSubmitBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Add New Service */}
      <Modal
        visible={isServiceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsServiceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerLarge}>
            {/* Header with Title, Subtitle, and Close '✕' Button */}
            <View style={styles.formHeaderRow}>
              <View style={styles.formHeaderLeft}>
                <Text style={styles.formModalTitleSerif}>
                  Add New <Text style={styles.formModalTitleGold}>Service</Text>
                </Text>
                <Text style={styles.formModalSub}>
                  Create a service listing to attract clients.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeCrossBtn}
                onPress={() => setIsServiceModalVisible(false)}
                activeOpacity={0.7}
              >
                <CloseCrossIcon color="#8E8E98" size={16} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.formScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 1. LISTING TITLE */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>LISTING TITLE</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Premium Bedroom AC Deep Cleaning"
                  placeholderTextColor="#666670"
                  value={serviceTitle}
                  onChangeText={setServiceTitle}
                />
              </View>

              {/* 2. DESCRIPTION */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DESCRIPTION</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput]}
                  placeholder="Outline the service scope, tools, warranty, and pricing details..."
                  placeholderTextColor="#666670"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={serviceDescription}
                  onChangeText={setServiceDescription}
                />
              </View>

              {/* 3. GLOBAL SERVICE CATEGORY */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>GLOBAL SERVICE CATEGORY</Text>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() =>
                    openPicker('Select Global Service Category', categoryOptions, (val) =>
                      setServiceCategory(val)
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !serviceCategory && styles.dropdownPlaceholder,
                    ]}
                  >
                    {serviceCategory || 'Select Service Category...'}
                  </Text>
                  <Text style={styles.dropdownArrowIcon}>⌄</Text>
                </TouchableOpacity>
              </View>

              {/* 4. EMIRATE & AREA (Two-Column Row) */}
              <View style={styles.twoColumnRow}>
                {/* Left: EMIRATE */}
                <View style={styles.flexColumn}>
                  <Text style={styles.formLabel}>EMIRATE</Text>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() =>
                      openPicker('Select Emirate', emirateOptions, (val) =>
                        handleEmirateSelectForService(val)
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !serviceEmirate && styles.dropdownPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {serviceEmirate || 'Select Emirate...'}
                    </Text>
                    <Text style={styles.dropdownArrowIcon}>⌄</Text>
                  </TouchableOpacity>
                </View>

                {/* Right: AREA */}
                <View style={styles.flexColumn}>
                  <Text style={styles.formLabel}>AREA</Text>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() =>
                      openPicker('Select Area', areaOptions, (val) => setServiceArea(val))
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !serviceArea && styles.dropdownPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {serviceArea || 'Select Area...'}
                    </Text>
                    <Text style={styles.dropdownArrowIcon}>⌄</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 5. EMERGENCY AVAILABILITY & PROVIDER TYPE (Two-Column Row) */}
              <View style={styles.twoColumnRow}>
                {/* Left: EMERGENCY AVAILABILITY */}
                <View style={styles.flexColumn}>
                  <Text style={styles.formLabel}>EMERGENCY AVAILABILITY</Text>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() =>
                      openPicker('Emergency Availability', availabilityOptions, (val) =>
                        setServiceAvailability(val)
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownText} numberOfLines={1}>
                      {serviceAvailability}
                    </Text>
                    <Text style={styles.dropdownArrowIcon}>⌄</Text>
                  </TouchableOpacity>
                </View>

                {/* Right: PROVIDER TYPE */}
                <View style={styles.flexColumn}>
                  <Text style={styles.formLabel}>PROVIDER TYPE</Text>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() =>
                      openPicker('Provider Type', providerTypeOptions, (val) =>
                        setServiceProviderType(val)
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownText} numberOfLines={1}>
                      {serviceProviderType}
                    </Text>
                    <Text style={styles.dropdownArrowIcon}>⌄</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 6. SERVICE IMAGES (MAX 4) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>SERVICE IMAGES (MAX 4)</Text>

                <TouchableOpacity
                  style={styles.uploadDashedContainer}
                  onPress={handleUploadServiceImage}
                  activeOpacity={0.8}
                >
                  <UploadTrayIcon color="#8E8E98" size={28} />
                  <Text style={styles.uploadText}>UPLOAD IMAGES</Text>
                </TouchableOpacity>

                {/* Uploaded Thumbnails Preview Row */}
                {serviceImages.length > 0 && (
                  <View style={styles.thumbnailRow}>
                    {serviceImages.map((uri, index) => (
                      <View key={index} style={styles.thumbnailWrapper}>
                        <Image source={{ uri }} style={styles.thumbnailImage} />
                        <TouchableOpacity
                          style={styles.removeThumbnailBtn}
                          onPress={() => handleRemoveServiceImage(index)}
                        >
                          <Text style={styles.removeThumbnailText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* 7. Bottom Full Width Gold Action Button */}
              <Button
                title="Create Service"
                onPress={handleAddService}
                style={styles.createServiceSubmitBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DROPDOWN OPTIONS SELECTION MODAL WITH LIVE SEARCH & A-Z SORT */}
      <Modal
        visible={pickerConfig.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerConfig((prev) => ({ ...prev, visible: false }))}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{pickerConfig.title}</Text>
              <TouchableOpacity
                onPress={() => setPickerConfig((prev) => ({ ...prev, visible: false }))}
              >
                <Text style={styles.pickerDoneText}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input Filter */}
            <View style={styles.pickerSearchContainer}>
              <TextInput
                style={styles.pickerSearchInput}
                placeholder={`Search ${pickerConfig.title.toLowerCase()}...`}
                placeholderTextColor="#666670"
                value={pickerSearchQuery}
                onChangeText={setPickerSearchQuery}
                autoCorrect={false}
              />
            </View>

            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {pickerConfig.options
                .filter((opt) => opt.toLowerCase().includes(pickerSearchQuery.toLowerCase()))
                .map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.pickerOptionItem}
                    onPress={() => pickerConfig.onSelect(opt)}
                  >
                    <Text style={styles.pickerOptionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              {pickerConfig.options.filter((opt) => opt.toLowerCase().includes(pickerSearchQuery.toLowerCase())).length === 0 && (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#666670', fontSize: 13 }}>No matching options found.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CUSTOM DARK GOLD IMAGE SOURCE SELECTION MODAL */}
      <ImageSourceModal
        visible={sourceModalTarget !== null}
        onClose={() => setSourceModalTarget(null)}
        onSelectCamera={async () => {
          const uri = await takePhotoWithCamera();
          if (uri) {
            if (sourceModalTarget === 'service') {
              setServiceImages((prev) => [...prev, uri]);
            } else if (sourceModalTarget === 'deal') {
              setDealImages((prev) => [...prev, uri]);
            }
          }
        }}
        onSelectLibrary={async () => {
          const uri = await pickImageFromLibrary();
          if (uri) {
            if (sourceModalTarget === 'service') {
              setServiceImages((prev) => [...prev, uri]);
            } else if (sourceModalTarget === 'deal') {
              setDealImages((prev) => [...prev, uri]);
            }
          }
        }}
      />

      {/* FORM SUBMISSION & DELETION LOADING MODAL */}
      <LoadingModal visible={isSubmittingForm} title={submittingFormTitle} />

      {/* DATE PICKER MODAL FOR DEALS */}
      <DatePickerModal
        visible={isDatePickerVisible}
        onClose={() => setIsDatePickerVisible(false)}
        onSelectDate={(date) => setDealExpiryDate(date)}
      />

      {/* CUSTOM APP STYLED ALERT MODAL */}
      <CustomAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />

    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();

  const handleTabSelect = (tab: TabType) => {
    switch (tab) {
      case 'home':
        router.replace('/landing');
        break;
      case 'services':
        router.replace('/services');
        break;
      case 'deals':
        router.replace('/deals');
        break;
      case 'profile':
        router.replace('/profile');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DashboardContent />
      <FloatingNavBar currentTab="home" onSelectTab={handleTabSelect} />
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
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 44 : 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161619',
    borderWidth: 1,
    borderColor: '#2A2A30',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  headerSection: {
    marginBottom: 30,
  },
  titleTextGroup: {
    marginBottom: 20,
  },
  pageTitleSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 34,
    fontWeight: '300',
    color: '#FFFFFF',
    lineHeight: 42,
    letterSpacing: 0.2,
  },
  pageTitleGold: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 34,
    fontWeight: '600',
    color: colors.primary,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#9E9EA8',
    marginTop: 6,
    lineHeight: 18,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#151518',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#26262B',
    padding: 18,
    justifyContent: 'space-between',
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(209, 139, 50, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(209, 139, 50, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statCountGroup: {
    flex: 1,
  },
  statCountText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  statLimitText: {
    fontSize: 13,
    color: '#666672',
    fontWeight: '400',
  },
  statLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E98',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#242429',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  // Section Styles
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleGroup: {
    flex: 1,
    marginRight: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8E8E98',
    marginTop: 4,
    lineHeight: 16,
  },
  addGoldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  addGoldBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Cards Container
  cardBox: {
    backgroundColor: '#141417',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#242429',
    padding: 18,
    minHeight: 120,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1C1C20',
    borderWidth: 1,
    borderColor: '#28282E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: '#A0A0A8',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  emptySubtext: {
    color: '#666672',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
    maxWidth: '85%',
  },

  // Item Card
  itemCard: {
    backgroundColor: '#1B1B1E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2C2C32',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  cardThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#26262B',
    marginRight: 12,
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  discountBadge: {
    backgroundColor: 'rgba(209, 139, 50, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  serviceCategoryIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(209, 139, 50, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(209, 139, 50, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemTextGroup: {
    flex: 1,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 19,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  activePillText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '700',
  },
  serviceSubDetails: {
    color: '#8E8E98',
    fontSize: 11,
    marginTop: 3,
  },
  goldText: {
    color: colors.primary,
    fontWeight: '700',
  },
  itemDescription: {
    color: '#666670',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
  },
  cardActionsColumn: {
    flexDirection: 'column',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  editBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    minWidth: 62,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    minWidth: 62,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#FF453A',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  // Large Modal Specs for Add New Service & Add Exclusive Deal
  modalContainerLarge: {
    width: '100%',
    maxHeight: '94%',
    backgroundColor: '#121215',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#24242A',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.65,
    shadowRadius: 28,
    elevation: 14,
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  formHeaderLeft: {
    flex: 1,
  },
  formModalTitleSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 26,
    fontWeight: '300',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  formModalTitleGold: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 26,
    fontWeight: '600',
    color: colors.primary,
  },
  formModalSub: {
    fontSize: 13,
    color: '#8E8E98',
    marginTop: 6,
    lineHeight: 18,
  },
  closeCrossBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C20',
    borderWidth: 1,
    borderColor: '#28282E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  formScrollContent: {
    paddingBottom: 24,
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E98',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#2A2A2F',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 56,
    color: '#FFFFFF',
    fontSize: 14,
  },
  multilineInput: {
    height: 110,
    paddingVertical: 14,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#2A2A2F',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 56,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#5E5E68',
  },
  dropdownArrowIcon: {
    color: '#666670',
    fontSize: 14,
    marginLeft: 6,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  flexColumn: {
    flex: 1,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#2A2A2F',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 56,
  },
  dateInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },

  // Images Upload Styling
  uploadDashedContainer: {
    borderWidth: 1.5,
    borderColor: '#3A3A42',
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: '#161619',
    paddingVertical: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: '#8E8E98',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginTop: 10,
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  thumbnailWrapper: {
    width: 68,
    height: 68,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  removeThumbnailBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeThumbnailText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  createServiceSubmitBtn: {
    height: 56,
    borderRadius: 18,
    marginTop: 16,
  },

  // Picker Bottom Sheet
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '50%',
    paddingBottom: 24,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#28282D',
  },
  pickerTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  pickerDoneText: {
    color: '#8E8E98',
    fontSize: 14,
    fontWeight: '600',
  },
  pickerList: {
    paddingHorizontal: 20,
  },
  pickerOptionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222226',
  },
  pickerOptionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  pickerSearchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  pickerSearchInput: {
    backgroundColor: '#222226',
    borderColor: '#333338',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13.5,
  },

  // Verified Notification Banner Styles
  verifiedNotificationBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  verifiedBannerIconCol: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  verifiedBannerTextCol: {
    flex: 1,
  },
  verifiedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  verifiedBannerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  verifiedPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedPillText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  verifiedBannerSubtitle: {
    color: '#A0A0AA',
    fontSize: 12,
    lineHeight: 17,
  },
});
