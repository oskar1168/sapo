import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getCityDetails, getDday } from '../../services/tripMetadata';
import { TripMetadata } from '../../types/trip';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

type TripCardProps = {
  trip: TripMetadata;
  isActive: boolean;
  onSelect: (tripId: string) => void;
  onEdit: (trip: TripMetadata) => void;
  onDelete: (tripId: string, title: string) => void;
};

export default function TripCard({ trip, isActive, onSelect, onEdit, onDelete }: TripCardProps) {
  const city = getCityDetails(trip.cityCode);

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={() => onSelect(trip.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.cardHeader, { backgroundColor: city.bg }]}>
        <Text style={styles.cardDday}>{getDday(trip.startDate)}</Text>
        <Text style={styles.cardEmoji}>{city.emoji}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.cardActionBtn} onPress={() => onEdit(trip)}>
            <Ionicons name="create-outline" size={16} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cardActionBtn, styles.cardDeleteBtn]}
            onPress={() => onDelete(trip.id, trip.title)}
          >
            <Ionicons name="trash-outline" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {trip.title}
        </Text>
        <Text style={styles.cardCity}>{city.name}</Text>
        <View style={styles.cardMetaRow}>
          <Ionicons name="calendar-outline" size={12} color="#64748b" />
          <Text style={styles.cardMetaText}>
            {trip.startDate} ~ {trip.endDate}
          </Text>
        </View>
        <View style={styles.cardMetaRow}>
          <Ionicons name="people-outline" size={12} color="#64748b" />
          <Text style={styles.cardMetaText}>{trip.memberCount}명 동행</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const tripCardWidth = isTablet ? (width - 56) / 2 : width - 40;

const styles = StyleSheet.create({
  card: {
    width: tripCardWidth,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardActive: {
    borderColor: '#6c5ce7',
    borderWidth: 2,
  },
  cardHeader: {
    height: 90,
    position: 'relative',
    padding: 16,
    justifyContent: 'flex-end',
  },
  cardDday: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
  },
  cardEmoji: {
    position: 'absolute',
    top: 14,
    right: 14,
    fontSize: 22,
  },
  cardActions: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
  },
  cardActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDeleteBtn: {
    backgroundColor: 'rgba(255, 76, 76, 0.65)',
  },
  cardBody: {
    padding: 16,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardCity: {
    fontSize: 12,
    color: '#6c5ce7',
    fontWeight: '700',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
});
