import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ActivityItem } from '../../constants/travelData';
import { getGoogleMapsUrl } from '../../services/mapLinks';
import { TripWarning } from '../../services/tripPlanning';

interface DayOption {
  label: string;
  value: string;
}

interface TimelineTabProps {
  activeDay: string;
  dayOptions: DayOption[];
  items: ActivityItem[];
  warnings: TripWarning[];
  exchangeRate: number;
  onSelectDay: (dayKey: string) => void;
  onAddPlace: () => void;
  onEditPlace: (item: ActivityItem) => void;
  onDeletePlace: (dayKey: string, itemId: number) => void;
  getDayDateString: (dayIndex: string) => string;
}

export default function TimelineTab({
  activeDay,
  dayOptions,
  items,
  warnings,
  exchangeRate,
  onSelectDay,
  onAddPlace,
  onEditPlace,
  onDeletePlace,
  getDayDateString,
}: TimelineTabProps) {
  const openDirections = async (item: ActivityItem) => {
    await Linking.openURL(getGoogleMapsUrl(item));
  };

  return (
    <View style={styles.container}>
      <View style={styles.dayTabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
          {dayOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.dayTabBtn, activeDay === opt.value && styles.dayTabBtnActive]}
              onPress={() => onSelectDay(opt.value)}
            >
              <Text style={[styles.dayTabLabel, activeDay === opt.value && styles.dayTabLabelActive]}>
                {opt.label.split(' (')[0]}
              </Text>
              <Text style={[styles.dayTabDate, activeDay === opt.value && styles.dayTabDateActive]}>
                {opt.label.split(' (')[1]?.slice(0, -1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.timelineScroll}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>
            Day {activeDay.replace('day', '')} 일정 ({getDayDateString(activeDay.replace('day', ''))})
          </Text>
          <TouchableOpacity style={styles.btnAddPlace} onPress={onAddPlace}>
            <Ionicons name="add-circle" size={16} color="#ffffff" />
            <Text style={styles.btnAddPlaceText}>장소 추가</Text>
          </TouchableOpacity>
        </View>

        {warnings.length > 0 ? (
          <View style={styles.warningList}>
            {warnings.map((warning) => (
              <View
                key={warning.id}
                style={[
                  styles.warningCard,
                  warning.level === 'warning' ? styles.warningCardStrong : styles.warningCardInfo,
                ]}
              >
                <Ionicons
                  name={warning.level === 'warning' ? 'alert-circle' : 'information-circle'}
                  size={17}
                  color={warning.level === 'warning' ? '#d97706' : '#2563eb'}
                />
                <View style={styles.warningContent}>
                  <Text
                    style={[
                      styles.warningTitle,
                      warning.level === 'warning' ? styles.warningTitleStrong : styles.warningTitleInfo,
                    ]}
                  >
                    {warning.title}
                  </Text>
                  <Text style={styles.warningMessage}>{warning.message}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {items.length === 0 ? (
          <View style={styles.emptyTimeline}>
            <Ionicons name="map-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTimelineText}>등록된 일정이 없습니다.</Text>
            <Text style={styles.emptyTimelineSub}>첫 번째 장소를 등록해볼까요?</Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {items.map((item, index) => (
              <View key={item.id} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <Text style={styles.timelineTime}>{item.time}</Text>
                  <View style={styles.timelineDotLineContainer}>
                    <View style={styles.timelineDot} />
                    {index < items.length - 1 ? <View style={styles.timelineLine} /> : null}
                  </View>
                </View>

                <View style={styles.timelineCard}>
                  <View style={styles.timelineCardHeader}>
                    <View style={styles.timelineCardTitleRow}>
                      <Ionicons name={getActivityIcon(item.type)} size={15} color="#6c5ce7" />
                      <Text style={styles.timelineCardName}>{item.name}</Text>
                    </View>
                    <View style={styles.timelineCardActions}>
                      <TouchableOpacity onPress={() => onEditPlace(item)}>
                        <Ionicons name="pencil-outline" size={16} color="#64748b" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onDeletePlace(activeDay, item.id)}>
                        <Ionicons name="trash-outline" size={16} color="#ff7675" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {item.memo ? <Text style={styles.timelineCardMemo}>{item.memo}</Text> : null}

                  <TouchableOpacity
                    style={styles.directionButton}
                    onPress={() => openDirections(item)}
                    activeOpacity={0.82}
                  >
                    <Ionicons name="navigate-outline" size={14} color="#6c5ce7" />
                    <Text style={styles.directionButtonText}>길찾기</Text>
                  </TouchableOpacity>

                  {item.cost ? (
                    <View style={styles.costBadge}>
                      <Text style={styles.costBadgeText}>
                        {item.cost.toLocaleString()}
                        {item.currency === 'JPY' ? ' JPY' : ' KRW'}
                      </Text>
                      {item.currency === 'JPY' ? (
                        <Text style={styles.costConversionSmall}>
                          ({Math.round(item.cost * exchangeRate).toLocaleString()}원)
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getActivityIcon(type: string) {
  if (type === 'flight') return 'airplane';
  if (type === 'meal') return 'restaurant';
  if (type === 'cafe') return 'cafe';
  if (type === 'sightseeing') return 'image';
  if (type === 'shopping') return 'bag-handle';
  if (type === 'lodging') return 'home';
  if (type === 'transport') return 'bus';
  return 'location';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayTabsWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    height: 56,
  },
  dayScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  dayTabBtn: {
    height: 40,
    minWidth: 84,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dayTabBtnActive: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  dayTabLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  dayTabLabelActive: {
    color: '#ffffff',
  },
  dayTabDate: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
  },
  dayTabDateActive: {
    color: '#ede9fe',
  },
  timelineScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  btnAddPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    height: 34,
    paddingHorizontal: 10,
    gap: 4,
  },
  btnAddPlaceText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  warningList: {
    gap: 8,
    marginTop: -6,
    marginBottom: 14,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
    gap: 8,
  },
  warningCardStrong: {
    backgroundColor: '#fffbeb',
    borderColor: '#fed7aa',
  },
  warningCardInfo: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  warningContent: {
    flex: 1,
    gap: 2,
  },
  warningTitle: {
    fontSize: 12.5,
    fontWeight: '900',
  },
  warningTitleStrong: {
    color: '#92400e',
  },
  warningTitleInfo: {
    color: '#1d4ed8',
  },
  warningMessage: {
    fontSize: 11.5,
    fontWeight: '700',
    lineHeight: 16,
    color: '#475569',
  },
  emptyTimeline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTimelineText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
  },
  emptyTimelineSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  timelineContainer: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 82,
  },
  timelineLeft: {
    width: 50,
    alignItems: 'center',
  },
  timelineTime: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 4,
  },
  timelineDotLineContainer: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6c5ce7',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingRight: 6,
  },
  timelineCardName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
  },
  timelineCardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  timelineCardMemo: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16,
    marginTop: 6,
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.18)',
    gap: 4,
    marginTop: 8,
  },
  directionButtonText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#6c5ce7',
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 8,
    gap: 4,
  },
  costBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#27ae60',
  },
  costConversionSmall: {
    fontSize: 9.5,
    color: '#64748b',
  },
});
