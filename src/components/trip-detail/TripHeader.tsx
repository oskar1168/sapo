import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TripStats } from '../../services/tripPlanning';

type TripHeaderProps = {
  title: string;
  startDate: string;
  endDate: string;
  dayCount: number;
  stats: TripStats;
  onBack: () => void;
  onShare: () => void;
};

export default function TripHeader({
  title,
  startDate,
  endDate,
  dayCount,
  stats,
  onBack,
  onShare,
}: TripHeaderProps) {
  return (
    <View style={styles.headerCard}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.btnBackIcon}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {stats.nights} · {startDate} ~ {endDate}
          </Text>
        </View>
        <TouchableOpacity onPress={onShare} style={styles.btnShare}>
          <Ionicons name="share-social-outline" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={16} color="#ffffff" />
          <Text style={styles.statLabel}>여행일정</Text>
          <Text style={styles.statValue}>{dayCount}일</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={16} color="#ffffff" />
          <Text style={styles.statLabel}>총 예산</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            {Math.round(stats.totalBudgetKRW / 10000).toLocaleString()}만원
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="pin-outline" size={16} color="#ffffff" />
          <Text style={styles.statLabel}>방문지</Text>
          <Text style={styles.statValue}>{stats.totalPlaces}곳</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#6c5ce7',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  btnBackIcon: {
    padding: 2,
  },
  headerInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#e0e0ff',
    fontWeight: '600',
    marginTop: 2,
  },
  btnShare: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    gap: 3,
  },
  statLabel: {
    fontSize: 10,
    color: '#e0e0ff',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});
