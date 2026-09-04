/**
 * 100% Vector Icons for SERVIZ Landing Page.
 * Renders crystal-clear vector graphics on all screen densities without blur or raster boxes.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '@/constants/colors';

// 1. Search Icon (Magnifying Glass)
export const SearchIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <View style={[styles.searchContainer, { width: size, height: size }]}>
    <View style={[styles.searchCircle, { borderColor: color }]} />
    <View style={[styles.searchHandle, { backgroundColor: color }]} />
  </View>
);

// 2. Location Pin Icon
export const LocationPinIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <View style={[styles.pinContainer, { width: size, height: size }]}>
    <View style={[styles.pinHead, { borderColor: color }]}>
      <View style={[styles.pinDot, { backgroundColor: color }]} />
    </View>
    <View style={[styles.pinTip, { borderTopColor: color }]} />
  </View>
);

// 3. Target Crosshair Icon
export const TargetCrosshairIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <View style={[styles.crosshairContainer, { width: size, height: size }]}>
    <View style={[styles.crosshairRing, { borderColor: color }]}>
      <View style={[styles.crosshairCenterDot, { backgroundColor: color }]} />
    </View>
    <View style={[styles.crosshairLineTop, { backgroundColor: color }]} />
    <View style={[styles.crosshairLineBottom, { backgroundColor: color }]} />
    <View style={[styles.crosshairLineLeft, { backgroundColor: color }]} />
    <View style={[styles.crosshairLineRight, { backgroundColor: color }]} />
  </View>
);

// 4. Partner Badge Icon (Gold Badge Circle with Vector Icon)
export const PartnerBadgeIcon = ({ size = 42, color = colors.primary }: { size?: number; color?: string }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: 'rgba(217, 142, 50, 0.14)',
      borderWidth: 1.5,
      borderColor: 'rgba(217, 142, 50, 0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    }}
  >
    <Ionicons name="briefcase" size={size * 0.52} color={color} />
  </View>
);

// 5. Shield Checkmark Icon (Verified Professionals)
export const ShieldCheckIcon = ({ color = colors.primary, size = 32 }: { color?: string; size?: number }) => (
  <View style={[styles.shieldContainer, { width: size, height: size }]}>
    <View style={[styles.shieldOuter, { borderColor: color }]}>
      <View style={[styles.checkShort, { backgroundColor: color }]} />
      <View style={[styles.checkLong, { backgroundColor: color }]} />
    </View>
  </View>
);

// 6. Fast Timer Icon (Fast & Reliable)
export const FastTimerIcon = ({ color = colors.primary, size = 32 }: { color?: string; size?: number }) => (
  <View style={[styles.timerContainer, { width: size, height: size }]}>
    <View style={[styles.timerCap, { backgroundColor: color }]} />
    <View style={[styles.timerRing, { borderColor: color }]}>
      <View style={[styles.timerHand, { backgroundColor: color }]} />
    </View>
    <View style={[styles.speedDash1, { backgroundColor: color }]} />
    <View style={[styles.speedDash2, { backgroundColor: color }]} />
    <View style={[styles.speedDash3, { backgroundColor: color }]} />
  </View>
);

// 7. Support Headset Icon (24/7 Service)
export const SupportHeadsetIcon = ({ color = colors.primary, size = 32 }: { color?: string; size?: number }) => (
  <View style={[styles.headsetContainer, { width: size, height: size }]}>
    <View style={[styles.headsetArch, { borderColor: color }]} />
    <View style={[styles.earCapLeft, { backgroundColor: color }]} />
    <View style={[styles.earCapRight, { backgroundColor: color }]} />
    <View style={[styles.micStem, { borderColor: color }]} />
    <View style={[styles.micDot, { backgroundColor: color }]} />
  </View>
);

// 8. Verified Badge Icon (Blue Gear/Scalloped Circle with Checkmark)
export const VerifiedBadgeIcon = ({ size = 18 }: { size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#007AFF',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ color: '#FFFFFF', fontSize: size * 0.65, fontWeight: '900', marginTop: Platform.OS === 'android' ? -2 : -1 }}>
      ✓
    </Text>
  </View>
);

// 9. Solid White Location Pin Icon
export const LocationPinSolidIcon = ({ color = '#FFFFFF', size = 15 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.72,
        borderRadius: (size * 0.72) / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: (size * 0.28) / 2,
          backgroundColor: '#141416',
        }}
      />
    </View>
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: size * 0.22,
        borderRightWidth: size * 0.22,
        borderTopWidth: size * 0.28,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: color,
        marginTop: -2,
      }}
    />
  </View>
);

// 10. 4-Square Category Grid Icon
export const CategoryGridIcon = ({ color = '#FFFFFF', size = 15 }: { color?: string; size?: number }) => {
  const tileSize = (size - 3) / 2;
  return (
    <View style={{ width: size, height: size, justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: tileSize, height: tileSize, borderWidth: 1.5, borderColor: color, borderRadius: 2 }} />
        <View style={{ width: tileSize, height: tileSize, borderWidth: 1.5, borderColor: color, borderRadius: 2 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: tileSize, height: tileSize, borderWidth: 1.5, borderColor: color, borderRadius: 2 }} />
        <View style={{ width: tileSize, height: tileSize, borderWidth: 1.5, borderColor: color, borderRadius: 2 }} />
      </View>
    </View>
  );
};

// 11. Filter Sliders Icon (3 Horizontal Sliders with Knobs)
export const FilterSlidersIcon = ({ color = '#FFFFFF', size = 15 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'space-around' }}>
    <View style={{ height: 2, backgroundColor: color, borderRadius: 1, position: 'relative' }}>
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, position: 'absolute', top: -1, left: size * 0.6 }} />
    </View>
    <View style={{ height: 2, backgroundColor: color, borderRadius: 1, position: 'relative' }}>
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, position: 'absolute', top: -1, left: size * 0.25 }} />
    </View>
    <View style={{ height: 2, backgroundColor: color, borderRadius: 1, position: 'relative' }}>
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, position: 'absolute', top: -1, left: size * 0.75 }} />
    </View>
  </View>
);

// 12. Green Check Circle Icon (For Deal Offers)
export const GreenCheckCircleIcon = ({ color = '#34C759', size = 16 }: { color?: string; size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 5,
    }}
  >
    <Text
      style={{
        color: '#FFFFFF',
        fontSize: size * 0.65,
        fontWeight: '900',
        marginTop: Platform.OS === 'android' ? -2 : -1,
      }}
    >
      ✓
    </Text>
  </View>
);

// 13. Mail Envelope Vector Icon
export const MailEnvelopeVectorIcon = ({ color = colors.primary, size = 18 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size * 0.75, borderWidth: 1.5, borderColor: color, borderRadius: 3, alignItems: 'center', overflow: 'hidden' }}>
    <View style={{ width: 0, height: 0, borderLeftWidth: (size - 3) / 2, borderRightWidth: (size - 3) / 2, borderTopWidth: size * 0.38, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color }} />
  </View>
);

// 14. Phone Receiver Vector Icon
export const PhoneReceiverVectorIcon = ({ color = colors.primary, size = 18 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.7, height: size * 0.7, borderWidth: 2, borderColor: color, borderTopLeftRadius: 6, borderBottomRightRadius: 6, borderTopRightRadius: 2, borderBottomLeftRadius: 2, transform: [{ rotate: '-15deg' }] }} />
  </View>
);

// 15. Clock Status Vector Icon
export const ClockStatusVectorIcon = ({ color = colors.primary, size = 18 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: color, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
    <View style={{ width: 1.5, height: size * 0.32, backgroundColor: color, position: 'absolute', top: size * 0.18 }} />
    <View style={{ width: size * 0.28, height: 1.5, backgroundColor: color, position: 'absolute', right: size * 0.18, top: size * 0.45 }} />
  </View>
);

// 16. Pencil Edit Vector Icon
export const PencilEditVectorIcon = ({ color = colors.primary, size = 14 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '45deg' }] }}>
    <View style={{ width: size * 0.35, height: size * 0.7, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.2, borderRightWidth: size * 0.2, borderTopWidth: size * 0.35, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color, marginTop: -1 }} />
  </View>
);

// 17. Shield Info Vector Icon
export const ShieldInfoVectorIcon = ({ color = colors.primary, size = 20 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size * 1.1, borderWidth: 1.8, borderColor: color, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottomLeftRadius: size / 2, borderBottomRightRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, backgroundColor: color }} />
  </View>
);

// 18. Dashboard Layout Icon (Sleek vector 4-tile grid)
export const DashboardIcon = ({ color = colors.primary, size = 18 }: { color?: string; size?: number }) => (
  <Ionicons name="grid-outline" size={size} color={color} />
);

// 19. Briefcase Icon (For Services Posted Stat & All Services)
export const BriefcaseIcon = ({ color = colors.primary, size = 18 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size * 0.85, alignItems: 'center', justifyContent: 'flex-end' }}>
    <View style={{ width: size * 0.45, height: size * 0.25, borderWidth: 1.5, borderColor: color, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomWidth: 0, marginBottom: -1 }} />
    <View style={{ width: size, height: size * 0.65, borderWidth: 1.5, borderColor: color, borderRadius: 3, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: '100%', height: 1.5, backgroundColor: color }} />
    </View>
  </View>
);

// 20. Tag/Coupon Icon (For Deals Posted Stat & Exclusive Deals)
export const TagCouponIcon = ({ color = colors.primary, size = 18 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-45deg' }] }}>
    <View style={{ width: size * 0.85, height: size * 0.55, borderWidth: 1.5, borderColor: color, borderRadius: 3, flexDirection: 'row', alignItems: 'center', paddingLeft: 3 }}>
      <View style={{ width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09, backgroundColor: color }} />
    </View>
  </View>
);

// 21. Plus Vector Icon
export const PlusIcon = ({ color = '#FFFFFF', size = 14 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size, height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 2, height: size, backgroundColor: color, borderRadius: 1, position: 'absolute' }} />
  </View>
);

// 22. Upload Tray Icon (For Service Images Upload Area)
export const UploadTrayIcon = ({ color = '#8E8E98', size = 24 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Arrow Up */}
    <View style={{ width: 2, height: size * 0.45, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: size * 0.3, height: size * 0.3, borderLeftWidth: 2, borderTopWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }], position: 'absolute', top: size * 0.12 }} />
    {/* Tray Line */}
    <View style={{ width: size * 0.75, height: 2, backgroundColor: color, borderRadius: 1, position: 'absolute', bottom: size * 0.15 }} />
  </View>
);

// 23. Close Cross Icon
export const CloseCrossIcon = ({ color = '#8E8E98', size = 16 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '45deg' }] }}>
    <View style={{ width: size, height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 2, height: size, backgroundColor: color, borderRadius: 1, position: 'absolute' }} />
  </View>
);

// 24. Calendar Icon
export const CalendarIcon = ({ color = '#8E8E98', size = 18 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size * 0.9, borderWidth: 1.5, borderColor: color, borderRadius: 3, padding: 2, justifyContent: 'space-between' }}>
    <View style={{ width: '100%', height: 2, backgroundColor: color, borderRadius: 1, marginBottom: 2 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      <View style={{ width: 2, height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 2, height: 2, backgroundColor: color, borderRadius: 1 }} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      <View style={{ width: 2, height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 2, height: 2, backgroundColor: color, borderRadius: 1 }} />
    </View>
  </View>
);

// 25. Back Arrow Icon
export const BackArrowIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.75, height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: size * 0.4, height: size * 0.4, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }], position: 'absolute', left: 1 }} />
  </View>
);

// 26. Lock Shield Icon (For Partner Signup Security Box)
export const LockShieldIcon = ({ color = colors.primary, size = 18 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.5, height: size * 0.4, borderWidth: 1.5, borderColor: color, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottomWidth: 0, marginBottom: -1 }} />
    <View style={{ width: size * 0.7, height: size * 0.5, borderWidth: 1.5, borderColor: color, borderRadius: 3, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
    </View>
  </View>
);

// 27. Official WhatsApp Icon Component
export const WhatsAppIcon = ({ color = '#25D366', size = 20 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PhoneReceiverVectorIcon color="#FFFFFF" size={size * 0.55} />
    </View>
  </View>
);

// 27. Image Add Icon (For Upload in PNG/JPEG Format)
export const ImageAddIcon = ({ color = '#8E8E98', size = 24 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size * 0.8, borderWidth: 1.5, borderColor: color, borderRadius: 4, padding: 3, justifyContent: 'space-between', position: 'relative' }}>
    <View style={{ width: size * 0.25, height: size * 0.25, borderRadius: size * 0.125, borderWidth: 1.2, borderColor: color }} />
    <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.2, borderRightWidth: size * 0.2, borderBottomWidth: size * 0.25, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color, alignSelf: 'flex-end' }} />
    {/* Plus Badge */}
    <View style={{ position: 'absolute', top: -3, right: -3, backgroundColor: colors.primary, borderRadius: 6, width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900', lineHeight: 12 }}>+</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  // Search Icon Styles
  searchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  searchCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  searchHandle: {
    width: 2,
    height: 6,
    borderRadius: 1,
    position: 'absolute',
    bottom: 0,
    right: 1,
    transform: [{ rotate: '-45deg' }],
  },

  // Location Pin Styles
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  pinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },

  // Target Crosshair Styles
  crosshairContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairCenterDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  crosshairLineTop: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 3,
  },
  crosshairLineBottom: {
    position: 'absolute',
    bottom: 0,
    width: 2,
    height: 3,
  },
  crosshairLineLeft: {
    position: 'absolute',
    left: 0,
    width: 3,
    height: 2,
  },
  crosshairLineRight: {
    position: 'absolute',
    right: 0,
    width: 3,
    height: 2,
  },

  // Partner Circle Badge
  partnerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peopleGroup: {
    width: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peopleHeadsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  personHeadMain: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginHorizontal: -1,
    zIndex: 2,
  },
  personHeadSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  peopleBodiesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: -1,
  },
  personBodyCenter: {
    width: 14,
    height: 9,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: colors.primary,
    zIndex: 2,
  },
  personBodySide: {
    width: 11,
    height: 7,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginHorizontal: -3,
  },

  // Shield Check Icon
  shieldContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldOuter: {
    width: 26,
    height: 30,
    borderWidth: 2.5,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkShort: {
    width: 6,
    height: 3,
    borderRadius: 1.5,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    left: 6,
    bottom: 11,
  },
  checkLong: {
    width: 11,
    height: 3,
    borderRadius: 1.5,
    transform: [{ rotate: '-45deg' }],
    position: 'absolute',
    right: 5,
    bottom: 12,
  },

  // Fast Timer Icon
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timerCap: {
    width: 8,
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
    top: 1,
  },
  timerRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  timerHand: {
    width: 2.5,
    height: 7,
    borderRadius: 1,
    position: 'absolute',
    top: 4,
  },
  speedDash1: {
    width: 6,
    height: 2,
    borderRadius: 1,
    position: 'absolute',
    left: 1,
    top: 12,
  },
  speedDash2: {
    width: 8,
    height: 2,
    borderRadius: 1,
    position: 'absolute',
    left: 2,
    top: 16,
  },
  speedDash3: {
    width: 10,
    height: 2,
    borderRadius: 1,
    position: 'absolute',
    left: 4,
    top: 20,
  },

  // Support Headset Icon
  headsetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headsetArch: {
    width: 24,
    height: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 2.5,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  earCapLeft: {
    width: 5,
    height: 10,
    borderRadius: 2.5,
    position: 'absolute',
    left: 2,
    top: 10,
  },
  earCapRight: {
    width: 5,
    height: 10,
    borderRadius: 2.5,
    position: 'absolute',
    right: 2,
    top: 10,
  },
  micStem: {
    width: 10,
    height: 8,
    borderBottomRightRadius: 6,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    position: 'absolute',
    right: 5,
    bottom: 2,
  },
  micDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    left: 10,
    bottom: 0,
  },
});
