import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TripScheduleMode } from '../../types/trip';

type ScheduleModeSelectorProps = {
  value: TripScheduleMode;
  onChange: (value: TripScheduleMode) => void;
};

const scheduleModeOptions = [
  {
    value: 'recommended' as TripScheduleMode,
    icon: 'sparkles-outline' as const,
    title: '추천 일정으로 시작',
    desc: '도시와 여행 기간에 맞춰 기본 코스를 자동으로 채워드려요.',
  },
  {
    value: 'blank' as TripScheduleMode,
    icon: 'calendar-clear-outline' as const,
    title: '빈 일정으로 시작',
    desc: '날짜만 만들고 장소는 직접 하나씩 추가해요.',
  },
];

export default function ScheduleModeSelector({ value, onChange }: ScheduleModeSelectorProps) {
  return (
    <View style={styles.scheduleModeGroup}>
      {scheduleModeOptions.map((option) => {
        const isActive = value === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.scheduleModeCard, isActive && styles.scheduleModeCardActive]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
          >
            <View style={[styles.scheduleModeIcon, isActive && styles.scheduleModeIconActive]}>
              <Ionicons
                name={option.icon}
                size={18}
                color={isActive ? '#6c5ce7' : '#64748b'}
              />
            </View>
            <View style={styles.scheduleModeCopy}>
              <Text style={[styles.scheduleModeTitle, isActive && styles.scheduleModeTitleActive]}>
                {option.title}
              </Text>
              <Text style={styles.scheduleModeDesc}>{option.desc}</Text>
            </View>
            <View style={[styles.scheduleModeRadio, isActive && styles.scheduleModeRadioActive]}>
              {isActive && <View style={styles.scheduleModeRadioDot} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  scheduleModeGroup: {
    gap: 8,
  },
  scheduleModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  scheduleModeCardActive: {
    borderColor: '#6c5ce7',
    backgroundColor: 'rgba(108, 92, 231, 0.06)',
  },
  scheduleModeIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleModeIconActive: {
    backgroundColor: '#ffffff',
  },
  scheduleModeCopy: {
    flex: 1,
    gap: 2,
  },
  scheduleModeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  scheduleModeTitleActive: {
    color: '#5b4bd6',
  },
  scheduleModeDesc: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 16,
  },
  scheduleModeRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleModeRadioActive: {
    borderColor: '#6c5ce7',
  },
  scheduleModeRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6c5ce7',
  },
});
