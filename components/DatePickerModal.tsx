import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import colors from '@/constants/colors';
import { CalendarIcon, CloseCrossIcon } from '@/components/LandingIcons';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (formattedDate: string) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({ visible, onClose, onSelectDate }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);

  if (!visible) return null;

  const yearsList = Array.from({ length: 6 }, (_, i) => currentYear + i);

  const monthsList = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const handleSelectPreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedYear(yyyy);
    setSelectedMonth(d.getMonth() + 1);
    setSelectedDay(d.getDate());
    onSelectDate(`${yyyy}-${mm}-${dd}`);
    onClose();
  };

  const handleConfirmCustomDate = () => {
    const mm = String(selectedMonth).padStart(2, '0');
    const dd = String(selectedDay).padStart(2, '0');
    onSelectDate(`${selectedYear}-${mm}-${dd}`);
    onClose();
  };

  // Generate days in month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <CalendarIcon color={colors.primary} size={20} />
              <Text style={styles.headerTitle}>Select Expiry Date</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <CloseCrossIcon size={18} color="#8E8E98" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
            {/* Quick Presets */}
            <Text style={styles.sectionLabel}>QUICK PRESETS</Text>
            <View style={styles.presetsRow}>
              <TouchableOpacity style={styles.presetChip} onPress={() => handleSelectPreset(7)}>
                <Text style={styles.presetChipText}>+7 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetChip} onPress={() => handleSelectPreset(30)}>
                <Text style={styles.presetChipText}>+30 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetChip} onPress={() => handleSelectPreset(90)}>
                <Text style={styles.presetChipText}>+90 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChipGold}
                onPress={() => {
                  setSelectedMonth(12);
                  setSelectedDay(31);
                  onSelectDate(`${selectedYear}-12-31`);
                  onClose();
                }}
              >
                <Text style={styles.presetChipGoldText}>End of {selectedYear}</Text>
              </TouchableOpacity>
            </View>

            {/* Year Selector */}
            <Text style={styles.sectionLabel}>YEAR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {yearsList.map((y) => {
                const isSelected = selectedYear === y;
                return (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearChip, isSelected && styles.selectedYearChip]}
                    onPress={() => setSelectedYear(y)}
                  >
                    <Text style={[styles.yearText, isSelected && styles.selectedYearText]}>{y}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Month Selector */}
            <Text style={styles.sectionLabel}>MONTH ({selectedYear})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {monthsList.map((m, idx) => {
                const monthNum = idx + 1;
                const isSelected = selectedMonth === monthNum;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.monthChip, isSelected && styles.selectedMonthChip]}
                    onPress={() => {
                      setSelectedMonth(monthNum);
                      if (selectedDay > new Date(selectedYear, monthNum, 0).getDate()) {
                        setSelectedDay(new Date(selectedYear, monthNum, 0).getDate());
                      }
                    }}
                  >
                    <Text style={[styles.monthText, isSelected && styles.selectedMonthText]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Day Grid */}
            <Text style={styles.sectionLabel}>DAY</Text>
            <View style={styles.daysGrid}>
              {daysArray.map((day) => {
                const isSelected = selectedDay === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmCustomDate} activeOpacity={0.8}>
            <Text style={styles.confirmBtnText}>
              Set Expiry Date ({selectedYear}-{String(selectedMonth).padStart(2, '0')}-{String(selectedDay).padStart(2, '0')})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#161619',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderColor: '#26262B',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  mainScroll: {
    maxHeight: 420,
  },
  sectionLabel: {
    color: '#8E8E98',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetChip: {
    backgroundColor: '#202025',
    borderColor: '#2D2D35',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetChipText: {
    color: '#E6E6EB',
    fontSize: 12,
    fontWeight: '600',
  },
  presetChipGold: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetChipGoldText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  horizontalScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  yearChip: {
    backgroundColor: '#202025',
    borderColor: '#2C2C32',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  selectedYearChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yearText: {
    color: '#8E8E98',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedYearText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  monthChip: {
    backgroundColor: '#202025',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 6,
  },
  selectedMonthChip: {
    backgroundColor: colors.primary,
  },
  monthText: {
    color: '#8E8E98',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedMonthText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 10,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#202025',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayCell: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: '#E6E6EB',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default DatePickerModal;
