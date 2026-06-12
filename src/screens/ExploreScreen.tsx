import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SAPPORO_FOOD_LIST, OTARU_FOOD_LIST, SpotItem, CITY_TEMPLATES } from '../constants/travelData';
import ExploreGuideModal from '../components/ExploreGuideModal';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

interface ExploreScreenProps {
  likedSpots: { city: string; originalIndex: number }[];
  onToggleLike: (city: string, originalIndex: number) => void;
  onAddSpotToTimeline: (city: string, originalIndex: number) => void;
  onNavigateToMyTrips: () => void;
  cityCode: string;
}

export default function ExploreScreen({
  likedSpots,
  onToggleLike,
  onAddSpotToTimeline,
  onNavigateToMyTrips,
  cityCode,
}: ExploreScreenProps) {
  const [guideVisible, setGuideVisible] = useState(false);

  const activeCity = cityCode || 'sapporo';
  const template = CITY_TEMPLATES[activeCity] || CITY_TEMPLATES.sapporo;
  const exp = template.explore;

  // Retrieve spot detail using city & index
  const getSpotDetail = (city: string, index: number): (SpotItem & { city: string; originalIndex: number }) | null => {
    let list: SpotItem[] = [];
    if (city === 'sapporo') list = SAPPORO_FOOD_LIST;
    else if (city === 'otaru') list = OTARU_FOOD_LIST;
    
    const item = list[index];
    if (!item) return null;
    return { ...item, city, originalIndex: index };
  };

  const activeLikedSpots = likedSpots
    .map((s) => getSpotDetail(s.city, s.originalIndex))
    .filter((s): s is Exclude<typeof s, null> => s !== null);

  const handleCityPress = (cityName: string) => {
    if (Platform.OS === 'web') {
      alert(`🧭 '${cityName}' 가이드 서비스는 현재 삿포로/오타루 위주로 제공 중입니다!`);
    } else {
      Alert.alert('알림', `🧭 '${cityName}' 가이드 서비스는 현재 삿포로/오타루 위주로 제공 중입니다!`);
    }
  };

  const handleDealPress = (dealTitle: string) => {
    if (Platform.OS === 'web') {
      alert(`🎟️ '${dealTitle}' 제휴 페이지 연결을 준비 중입니다!`);
    } else {
      Alert.alert('안내', `🎟️ '${dealTitle}' 제휴 페이지 연결을 준비 중입니다!`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.welcomeGroup}>
          <Text style={styles.welcomeTitle}>
            안녕하세요, 민상님! {activeCity === 'sapporo' ? '❄️' : activeCity === 'tokyo' ? '🗼' : '🐙'}
          </Text>
          <Text style={styles.welcomeSubtitle}>{exp.welcomeSubtitle}</Text>
        </View>
        <TouchableOpacity onPress={onNavigateToMyTrips} style={styles.btnMyTrips} activeOpacity={0.8}>
          <Ionicons name="calendar-outline" size={22} color="#ffffff" />
          <View style={styles.badgePlus}>
            <Text style={styles.badgePlusText}>+</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main visual Promotion Banner */}
      <TouchableOpacity
        style={styles.bannerContainer}
        activeOpacity={0.9}
        onPress={() => setGuideVisible(true)}
      >
        <View style={styles.bannerOverlay}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>HOT 추천 가이드</Text>
          </View>
          <Text style={styles.bannerTitle}>{exp.bannerTitle}</Text>
          <Text style={styles.bannerDesc}>{exp.bannerDesc}</Text>
        </View>
      </TouchableOpacity>

      {/* Liked Spots horizontal slider */}
      {activeLikedSpots.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={18} color="#ff7675" />
            <Text style={styles.sectionTitle}>내가 좋아요 누른 스팟</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.likedSliderContent}
          >
            {activeLikedSpots.map((spot, i) => (
              <View key={i} style={styles.likedCard}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80' }}
                  style={styles.likedCardThumb}
                />
                <View style={styles.likedCardBody}>
                  <Text style={styles.likedCardName} numberOfLines={1}>
                    {spot.name}
                  </Text>
                  <Text style={styles.likedCardMenu} numberOfLines={1}>
                    추천: {spot.menu}
                  </Text>
                  <View style={styles.likedCardActions}>
                    <TouchableOpacity
                      style={styles.btnCardAdd}
                      onPress={() => onAddSpotToTimeline(spot.city, spot.originalIndex)}
                    >
                      <Ionicons name="add" size={14} color="#2ecc71" />
                      <Text style={styles.btnCardAddText}>일정추가</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnCardHeart}
                      onPress={() => onToggleLike(spot.city, spot.originalIndex)}
                    >
                      <Ionicons name="heart" size={16} color="#ff7675" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Recommended Cities Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitleOnly}>
          🗺️ {activeCity === 'sapporo' ? '홋카이도' : activeCity === 'tokyo' ? '도쿄' : '오사카'} 추천 지역 탐색
        </Text>
        <View style={styles.gridContainer}>
          {exp.cities.map((city, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.gridCard}
              onPress={() => handleCityPress(city.name)}
              activeOpacity={0.7}
            >
              <Text style={styles.gridCardEmoji}>{city.emoji}</Text>
              <Text style={styles.gridCardName}>{city.name}</Text>
              <Text style={styles.gridCardDesc}>{city.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Specials/Deals List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitleOnly}>🛍️ 여행 필수품 & 특가 상품</Text>
        <View style={styles.dealsList}>
          {exp.deals.map((deal, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.dealCard}
              onPress={() => handleDealPress(deal.title)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.dealIconBox,
                  { backgroundColor: deal.color ? `${deal.color}1f` : 'rgba(74, 144, 226, 0.12)' },
                ]}
              >
                <Ionicons
                  name={deal.emoji === 'coupon' ? 'pricetag' : deal.emoji === 'train' ? 'train' : 'subway'}
                  size={20}
                  color={deal.color || '#6c5ce7'}
                />
              </View>
              <View style={styles.dealInfo}>
                <Text style={styles.dealTitle}>{deal.title}</Text>
                <Text style={styles.dealDesc}>{deal.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Guidebook Modal */}
      <ExploreGuideModal
        visible={guideVisible}
        cityCode={cityCode}
        onClose={() => setGuideVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeGroup: {
    flex: 1,
    paddingRight: 15,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  btnMyTrips: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  badgePlus: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff7675',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePlusText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '900',
  },
  bannerContainer: {
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#6c5ce7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.9)',
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '800',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 20,
  },
  bannerDesc: {
    fontSize: 11,
    color: '#e0e0ff',
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  sectionTitleOnly: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  likedSliderContent: {
    gap: 12,
    paddingRight: 20,
  },
  likedCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 90,
  },
  likedCardThumb: {
    width: 80,
    height: '100%',
  },
  likedCardBody: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  likedCardName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  likedCardMenu: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
  },
  likedCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnCardAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(46, 204, 113, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  btnCardAddText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#2ecc71',
  },
  btnCardHeart: {
    padding: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: isTablet ? (width - 64) / 4 : (width - 52) / 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  gridCardEmoji: {
    fontSize: 26,
  },
  gridCardName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  gridCardDesc: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  dealsList: {
    gap: 10,
  },
  dealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  dealIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealInfo: {
    flex: 1,
    gap: 2,
  },
  dealTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  dealDesc: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
  },
});
