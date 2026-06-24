import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { partnerProviderLabels, type PartnerProduct } from '../data/partnerProducts';
import { getMagazineBookingProducts, type TravelMagazine } from '../data/travelMagazines';
import { openPartnerProduct } from '../services/partnerLinks';
import type { DayOption } from '../services/tripPlanning';
import type { AddRegionRouteResult } from './RegionExploreModal';

type TravelMagazineModalProps = {
  visible: boolean;
  magazine: TravelMagazine | null;
  products: PartnerProduct[];
  dayOptions: DayOption[];
  onClose: () => void;
  onAddMagazineToDay: (magazine: TravelMagazine, dayKey: string) => AddRegionRouteResult | null;
};

export default function TravelMagazineModal({
  visible,
  magazine,
  products,
  dayOptions,
  onClose,
  onAddMagazineToDay,
}: TravelMagazineModalProps) {
  const [isDayPickerVisible, setIsDayPickerVisible] = useState(false);
  const [selectedDayKey, setSelectedDayKey] = useState('');

  if (!magazine) {
    return null;
  }

  const bookingProducts = getMagazineBookingProducts(magazine, products);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleAddPress = () => {
    if (dayOptions.length === 0) {
      showMessage('일정 추가', '먼저 여행 일정을 만든 뒤 매거진 속 장소를 추가할 수 있어요.');
      return;
    }
    if (!selectedDayKey || !dayOptions.some((day) => day.value === selectedDayKey)) {
      setSelectedDayKey(dayOptions[0].value);
    }
    setIsDayPickerVisible((current) => !current);
  };

  const handleConfirmAdd = () => {
    const targetDayKey = dayOptions.some((day) => day.value === selectedDayKey)
      ? selectedDayKey
      : dayOptions[0]?.value || '';

    if (!targetDayKey) {
      showMessage('Day 선택', '매거진 장소를 추가할 Day를 선택해 주세요.');
      return;
    }

    const result = onAddMagazineToDay(magazine, targetDayKey);
    if (!result) {
      showMessage('일정 추가', '먼저 여행 일정을 만든 뒤 매거진 속 장소를 추가할 수 있어요.');
      return;
    }

    const selectedDayLabel = dayOptions.find((day) => day.value === targetDayKey)?.label || targetDayKey;
    const skippedText = result.skippedCount > 0 ? ` 중복된 ${result.skippedCount}개 장소는 제외했어요.` : '';
    showMessage(
      '코스 추가 완료',
      `${selectedDayLabel}에 ${magazine.title} 장소 ${result.addedCount}개를 추가했어요. 기존 일정은 그대로 유지됩니다.${skippedText}`,
    );
    setIsDayPickerVisible(false);
  };

  const handleProductPress = async (product: PartnerProduct) => {
    await openPartnerProduct(product);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerEyebrow}>여행 매거진</Text>
            <Text style={styles.headerTitle}>{magazine.title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.btnClose}>
            <Ionicons name="close-circle" size={28} color="#b0b4ba" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroCard}>
            <Image source={{ uri: magazine.coverImageUrl }} style={styles.heroImage} />
            <View style={styles.heroBody}>
              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Ionicons name="calendar-outline" size={13} color="#6c5ce7" />
                  <Text style={styles.metaPillText}>{magazine.seasonLabel}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Ionicons name="time-outline" size={13} color="#6c5ce7" />
                  <Text style={styles.metaPillText}>{magazine.readTime}</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>{magazine.subtitle}</Text>
              <Text style={styles.heroSummary}>{magazine.summary}</Text>
              <View style={styles.tagRow}>
                {magazine.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.articleLead}>{magazine.articleLead}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>이곳에서 즐길거리</Text>
            <View style={styles.contentList}>
              {magazine.enjoyments.map((item) => (
                <View key={item.title} style={styles.contentCard}>
                  <View style={styles.contentIconBox}>
                    <Ionicons name={item.icon as any} size={18} color="#6c5ce7" />
                  </View>
                  <View style={styles.contentInfo}>
                    <Text style={styles.contentTitle}>{item.title}</Text>
                    <Text style={styles.contentBody}>{item.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>알아두면 좋은 정보</Text>
            <View style={styles.infoGrid}>
              {magazine.infoBlocks.map((item) => (
                <View key={item.title} style={styles.infoCard}>
                  <Ionicons name={item.icon as any} size={18} color="#4a90e2" />
                  <Text style={styles.infoTitle}>{item.title}</Text>
                  <Text style={styles.infoBody}>{item.body}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>함께 보면 좋은 곳</Text>
            <View style={styles.nearbyList}>
              {magazine.nearbyPlaces.map((item) => (
                <View key={item.title} style={styles.nearbyItem}>
                  <Ionicons name={item.icon as any} size={16} color="#2ecc71" />
                  <View style={styles.nearbyInfo}>
                    <Text style={styles.nearbyTitle}>{item.title}</Text>
                    <Text style={styles.nearbyBody}>{item.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderTextGroup}>
                <Text style={styles.sectionTitle}>일정에 담을 핵심 장소</Text>
                <Text style={styles.sectionDesc}>읽고 마음에 들면 선택한 Day 뒤에 이어서 추가할 수 있어요.</Text>
              </View>
              <TouchableOpacity onPress={handleAddPress} style={styles.routeButton} activeOpacity={0.86}>
                <Ionicons name="add" size={14} color="#ffffff" />
                <Text style={styles.routeButtonText}>일정에 추가</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.routeCard}>
              {magazine.route.map((step, index) => (
                <View key={`${step}-${index}`} style={styles.routeStep}>
                  <View style={styles.routeMarker}>
                    <Text style={styles.routeMarkerText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.routeStepText}>{step}</Text>
                </View>
              ))}
            </View>

            {isDayPickerVisible ? (
              <View style={styles.dayPickerCard}>
                <Text style={styles.dayPickerTitle}>어느 Day에 추가할까요?</Text>
                <Text style={styles.dayPickerDesc}>
                  기존 일정은 삭제하지 않고, 선택한 Day의 마지막에 이어서 추가합니다.
                </Text>
                <View style={styles.dayChipGrid}>
                  {dayOptions.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[styles.dayChip, selectedDayKey === day.value && styles.dayChipActive]}
                      onPress={() => setSelectedDayKey(day.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.dayChipText, selectedDayKey === day.value && styles.dayChipTextActive]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.confirmRouteButton} onPress={handleConfirmAdd} activeOpacity={0.86}>
                  <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                  <Text style={styles.confirmRouteButtonText}>선택한 Day에 추가</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {bookingProducts.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>이 코스 준비하기</Text>
              <Text style={styles.sectionDesc}>
                코스와 같이 준비하면 편한 예약 링크만 모아뒀어요.
              </Text>
              <View style={styles.bookingList}>
                {bookingProducts.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.bookingCard}
                    activeOpacity={0.82}
                    onPress={() => handleProductPress(product)}
                  >
                    <View style={[styles.bookingIconBox, { backgroundColor: `${product.color}1f` }]}>
                      <Ionicons name={product.icon as any} size={19} color={product.color} />
                    </View>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingProvider}>{partnerProviderLabels[product.provider]}</Text>
                      <Text style={styles.bookingTitle} numberOfLines={1}>
                        {product.title}
                      </Text>
                      <Text style={styles.bookingDesc} numberOfLines={2}>
                        {product.desc}
                      </Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>가기 전에 알면 좋은 점</Text>
            <View style={styles.tipList}>
              {magazine.tips.map((tip) => (
                <View key={tip} style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={17} color="#2ecc71" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitleGroup: {
    flex: 1,
    paddingRight: 12,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6c5ce7',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  btnClose: {
    padding: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 18,
  },
  heroImage: {
    width: '100%',
    height: 190,
    backgroundColor: '#e2e8f0',
  },
  heroBody: {
    padding: 16,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 9,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.16)',
    gap: 4,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6c5ce7',
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 24,
  },
  heroSummary: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 19,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  tagChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  sectionHeaderTextGroup: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 10,
  },
  sectionDesc: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '600',
    lineHeight: 17,
    marginTop: -4,
    marginBottom: 10,
  },
  articleLead: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '700',
    color: '#334155',
  },
  contentList: {
    gap: 10,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 13,
    gap: 11,
  },
  contentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentInfo: {
    flex: 1,
    gap: 4,
  },
  contentTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0f172a',
  },
  contentBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoCard: {
    flexGrow: 1,
    flexBasis: 150,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 13,
    gap: 7,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  infoBody: {
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '600',
    color: '#64748b',
  },
  nearbyList: {
    gap: 9,
  },
  nearbyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 9,
  },
  nearbyInfo: {
    flex: 1,
    gap: 3,
  },
  nearbyTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0f172a',
  },
  nearbyBody: {
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '600',
    color: '#64748b',
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c5ce7',
    borderRadius: 9,
    paddingHorizontal: 10,
    height: 30,
    gap: 3,
  },
  routeButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
  dayPickerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.18)',
    padding: 12,
    marginTop: 10,
    gap: 9,
  },
  dayPickerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  dayPickerDesc: {
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '700',
    color: '#64748b',
  },
  dayChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  dayChipActive: {
    borderColor: '#6c5ce7',
    backgroundColor: '#6c5ce7',
  },
  dayChipText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
  },
  dayChipTextActive: {
    color: '#ffffff',
  },
  confirmRouteButton: {
    height: 38,
    borderRadius: 9,
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  confirmRouteButtonText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#ffffff',
  },
  routeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 8,
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  routeMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeMarkerText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6c5ce7',
  },
  routeStepText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  bookingList: {
    gap: 9,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  bookingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingInfo: {
    flex: 1,
    gap: 2,
  },
  bookingProvider: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#94a3b8',
  },
  bookingTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  bookingDesc: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 15,
  },
  tipList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 18,
  },
});
