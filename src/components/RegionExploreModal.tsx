import React from 'react';
import {
  Alert,
  Linking,
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
import { PartnerProduct } from '../data/partnerProducts';
import { RegionGuide } from '../data/regionGuides';
import { recordPartnerProductClick } from '../services/partnerTracking';

type RegionExploreModalProps = {
  visible: boolean;
  guide: RegionGuide | null;
  products: PartnerProduct[];
  onClose: () => void;
};

export default function RegionExploreModal({ visible, guide, products, onClose }: RegionExploreModalProps) {
  if (!guide) {
    return null;
  }

  const bookingProducts = guide.bookingProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is PartnerProduct => Boolean(product));

  const handleRouteAdd = () => {
    const message = '지역 코스를 일정에 한 번에 추가하는 기능을 준비 중입니다.';
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert('일정 추가', message);
    }
  };

  const handleProductPress = async (product: PartnerProduct) => {
    await recordPartnerProductClick(product);
    await Linking.openURL(product.targetUrl);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerEyebrow}>취향별 지역 탐색</Text>
            <Text style={styles.headerTitle}>{guide.title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.btnClose}>
            <Ionicons name="close-circle" size={28} color="#b0b4ba" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>{guide.subtitle}</Text>
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#4a90e2" />
                <Text style={styles.metaLabel}>소요</Text>
                <Text style={styles.metaValue}>{guide.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="walk-outline" size={16} color="#2ecc71" />
                <Text style={styles.metaLabel}>난이도</Text>
                <Text style={styles.metaValue}>{guide.difficulty}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="sunny-outline" size={16} color="#f39c12" />
                <Text style={styles.metaLabel}>추천 시간</Text>
                <Text style={styles.metaValue}>{guide.bestTime}</Text>
              </View>
            </View>
            <View style={styles.tagRow}>
              {guide.tags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>이 지역에서 뭐 하지?</Text>
            <View style={styles.highlightGrid}>
              {guide.highlights.map((highlight) => (
                <View key={highlight} style={styles.highlightItem}>
                  <Ionicons name="location-outline" size={15} color="#6c5ce7" />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>추천 동선</Text>
              <TouchableOpacity onPress={handleRouteAdd} style={styles.routeButton}>
                <Ionicons name="add" size={14} color="#ffffff" />
                <Text style={styles.routeButtonText}>일정에 추가</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.routeCard}>
              {guide.route.map((step, index) => (
                <View key={`${step}-${index}`} style={styles.routeStep}>
                  <View style={styles.routeMarker}>
                    <Text style={styles.routeMarkerText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.routeStepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          {bookingProducts.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>이 지역에서 필요한 예약</Text>
              <Text style={styles.sectionDesc}>동선이 복잡하거나 미리 준비하면 편한 상품만 골랐어요.</Text>
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
                      <Text style={styles.bookingProvider}>MYREALTRIP</Text>
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
            <Text style={styles.sectionTitle}>가기 전에 알면 좋은 팁</Text>
            <View style={styles.tipList}>
              {guide.tips.map((tip) => (
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
    padding: 18,
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 23,
    marginBottom: 14,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metaItem: {
    flex: 1,
    minHeight: 78,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    gap: 3,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#334155',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  tagChip: {
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.18)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6c5ce7',
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
  highlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    gap: 5,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
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
    letterSpacing: 0,
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
