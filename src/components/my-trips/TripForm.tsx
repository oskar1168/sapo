import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import DateField, { getMinEndDate } from './DateField';
import MemberCounter from './MemberCounter';
import ScheduleModeSelector from './ScheduleModeSelector';
import { TripFormValues } from './types';

type TripFormProps = {
  values: TripFormValues;
  onChange: (values: TripFormValues | ((prev: TripFormValues) => TripFormValues)) => void;
  showScheduleMode?: boolean;
  footer: React.ReactNode;
};

export default function TripForm({
  values,
  onChange,
  showScheduleMode = false,
  footer,
}: TripFormProps) {
  const minEndDate = getMinEndDate(values.startDate);

  const handleStartDateChange = (startDate: string) => {
    onChange((prev) => {
      const nextMinEndDate = getMinEndDate(startDate);
      const shouldMoveEndDate =
        nextMinEndDate && (!prev.endDate || prev.endDate <= startDate);

      return {
        ...prev,
        startDate,
        endDate: shouldMoveEndDate ? nextMinEndDate : prev.endDate,
      };
    });
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>여행 제목 *</Text>
        <TextInput
          style={styles.input}
          value={values.title}
          onChangeText={(title) => onChange((prev) => ({ ...prev, title }))}
          placeholder="예: 삿포로 여름 휴가"
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, styles.formColumn]}>
          <Text style={styles.label}>출발일 *</Text>
          <DateField
            value={values.startDate}
            onChangeText={handleStartDateChange}
          />
        </View>
        <View style={[styles.formGroup, styles.formColumn]}>
          <Text style={styles.label}>도착일 *</Text>
          <DateField
            value={values.endDate}
            min={minEndDate || undefined}
            onChangeText={(endDate) => onChange((prev) => ({ ...prev, endDate }))}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>동행 인원 *</Text>
        <MemberCounter
          value={values.memberCount}
          onChange={(memberCount) => onChange((prev) => ({ ...prev, memberCount }))}
        />
      </View>

      {showScheduleMode && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>일정 시작 방식</Text>
          <ScheduleModeSelector
            value={values.scheduleMode}
            onChange={(scheduleMode) => onChange((prev) => ({ ...prev, scheduleMode }))}
          />
        </View>
      )}

      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    gap: 14,
  },
  formGroup: {
    gap: 6,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formColumn: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
});
