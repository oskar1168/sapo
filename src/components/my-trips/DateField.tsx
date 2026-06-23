import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const formatDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateString = (dateString?: string) => {
  if (!dateString) return null;

  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getMonthTitle = (date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

const getCalendarDays = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const blanks = Array.from({ length: firstDay.getDay() }, () => null);
  const days = Array.from({ length: lastDay.getDate() }, (_, index) => new Date(year, month, index + 1));

  return [...blanks, ...days];
};

export const addDaysToDateString = (dateString: string, days: number) => {
  if (!dateString) return '';

  const date = parseDateString(dateString);
  if (!date) return '';

  date.setDate(date.getDate() + days);
  return formatDateString(date);
};

export const getMinEndDate = (startDate: string) => addDaysToDateString(startDate, 1);

type DateFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  min?: string;
};

export default function DateField({ value, onChangeText, min }: DateFieldProps) {
  const initialMonth = parseDateString(value) || parseDateString(min) || new Date();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  );
  const selectedDate = parseDateString(value);
  const minDate = parseDateString(min);
  const calendarDays = getCalendarDays(visibleMonth);

  if (Platform.OS === 'web') {
    return React.createElement('input', {
      type: 'date',
      value,
      min,
      onChange: (event: any) => onChangeText(event.target.value),
      style: webDateInputStyle,
    });
  }

  return (
    <>
      <TouchableOpacity
        style={styles.dateInputButton}
        onPress={() => setPickerVisible(true)}
        activeOpacity={0.75}
      >
        <Text style={[styles.dateInputText, !value && styles.dateInputPlaceholder]}>
          {value || '날짜 선택'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color="#64748b" />
      </TouchableOpacity>

      <Modal
        visible={pickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavBtn}
                onPress={() =>
                  setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
                }
              >
                <Ionicons name="chevron-back" size={20} color="#0f172a" />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{getMonthTitle(visibleMonth)}</Text>
              <TouchableOpacity
                style={styles.calendarNavBtn}
                onPress={() =>
                  setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
                }
              >
                <Ionicons name="chevron-forward" size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdayRow}>
              {['일', '월', '화', '수', '목', '금', '토'].map((weekday) => (
                <Text key={weekday} style={styles.weekdayText}>
                  {weekday}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <View key={`blank-${index}`} style={styles.calendarDayCell} />;
                }

                const dateString = formatDateString(day);
                const isSelected = selectedDate ? dateString === formatDateString(selectedDate) : false;
                const isDisabled = minDate ? dateString < formatDateString(minDate) : false;

                return (
                  <TouchableOpacity
                    key={dateString}
                    style={[
                      styles.calendarDayCell,
                      styles.calendarDayButton,
                      isSelected && styles.calendarDaySelected,
                      isDisabled && styles.calendarDayDisabled,
                    ]}
                    disabled={isDisabled}
                    onPress={() => {
                      onChangeText(dateString);
                      setPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && styles.calendarDayTextSelected,
                        isDisabled && styles.calendarDayTextDisabled,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.calendarCloseBtn}
              onPress={() => setPickerVisible(false)}
            >
              <Text style={styles.calendarCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const webDateInputStyle = {
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#cbd5e1',
  borderRadius: 10,
  paddingLeft: 12,
  paddingRight: 12,
  height: 44,
  fontSize: 14,
  backgroundColor: '#f8fafc',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  outline: 'none',
};

const styles = StyleSheet.create({
  dateInputButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateInputText: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
  },
  dateInputPlaceholder: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 18,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calendarNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayButton: {
    borderRadius: 8,
  },
  calendarDaySelected: {
    backgroundColor: '#6c5ce7',
  },
  calendarDayDisabled: {
    opacity: 0.35,
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  calendarDayTextSelected: {
    color: '#ffffff',
  },
  calendarDayTextDisabled: {
    color: '#94a3b8',
  },
  calendarCloseBtn: {
    height: 42,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  calendarCloseText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
});
