import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import {
  HomeNavIcon,
  ServicesNavIcon,
  DealsNavIcon,
  ProfileNavIcon,
} from '@/components/NavBarIcons';

export type TabType = 'home' | 'services' | 'deals' | 'profile' | 'dashboard';

interface FloatingNavBarProps {
  currentTab: TabType;
  onSelectTab?: (tab: TabType) => void;
}

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({ currentTab, onSelectTab }) => {
  const router = useRouter();

  const handlePress = (tab: TabType) => {
    if (onSelectTab) {
      onSelectTab(tab);
      return;
    }

    if (tab === currentTab) return;

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
      case 'dashboard':
        router.replace('/dashboard');
        break;
    }
  };

  return (
    <View style={styles.floatingNavContainer}>
      <View style={styles.floatingNavBar}>
        {/* Home Tab */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => handlePress('home')}
          activeOpacity={0.7}
        >
          <HomeNavIcon active={currentTab === 'home'} />
          <Text style={[styles.navLabel, currentTab === 'home' && styles.activeNavColor]}>
            Home
          </Text>
          {currentTab === 'home' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Services Tab */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => handlePress('services')}
          activeOpacity={0.7}
        >
          <ServicesNavIcon active={currentTab === 'services'} />
          <Text style={[styles.navLabel, currentTab === 'services' && styles.activeNavColor]}>
            Services
          </Text>
          {currentTab === 'services' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Deals Tab */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => handlePress('deals')}
          activeOpacity={0.7}
        >
          <DealsNavIcon active={currentTab === 'deals'} />
          <Text style={[styles.navLabel, currentTab === 'deals' && styles.activeNavColor]}>
            Deals
          </Text>
          {currentTab === 'deals' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Profile Tab */}
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => handlePress('profile')}
          activeOpacity={0.7}
        >
          <ProfileNavIcon active={currentTab === 'profile'} />
          <Text style={[styles.navLabel, currentTab === 'profile' && styles.activeNavColor]}>
            Profile
          </Text>
          {currentTab === 'profile' && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingNavContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: 16,
  },
  floatingNavBar: {
    width: '100%',
    maxWidth: 380,
    height: 64,
    backgroundColor: '#121215',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#2A2A30',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 3,
  },
  activeNavColor: {
    color: colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
});

export default FloatingNavBar;
