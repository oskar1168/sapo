import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CITY_TEMPLATES } from '../constants/travelData';
import BookingSection from '../components/explore/BookingSection';
import RegionExploreModal from '../components/RegionExploreModal';
import SpotThumbnail from '../components/SpotThumbnail';
import { SUPPORTED_CITIES, getSupportedCity } from '../data/supportedCities';
import { getPartnerProductsForCity } from '../data/partnerProducts';
import { getRegionGuide, RegionGuide } from '../data/regionGuides';
import { getSpotDetail, getSpotDetailById } from '../services/spotCatalog';
import { SpotRef } from '../types/spot';
import { CityExploreItem } from '../types/travelData';

const GRID_GAP = 12;

const getRegionGridColumns = (containerWidth: number) => {
  if (containerWidth >= 1024) {
    return 4;
  }
  if (containerWidth >= 720) {
    return 3;
  }
  if (containerWidth >= 340) {
    return 2;
  }
  return 1;
};

interface ExploreScreenProps {
  likedSpots: SpotRef[];
  onToggleLike: (city: string, originalIndex: number) => void;
  onAddSpotToTimeline: (city: string, originalIndex: number) => void;
  onNavigateToMyTrips: () => void;
  onStartTripPlanning: (cityCode: string) => void;
  cityCode?: string;
}

export default function ExploreScreen({
  likedSpots,
  onToggleLike,
  onAddSpotToTimeline,
  onNavigateToMyTrips,
  onStartTripPlanning,
  cityCode,
}: ExploreScreenProps) {
  const [selectedRegionGuide, setSelectedRegionGuide] = useState<RegionGuide | null>(null);
  const [regionGridWidth, setRegionGridWidth] = useState(0);
  const [showAllRegions, setShowAllRegions] = useState(false);

  const hasActiveTrip = Boolean(cityCode);
  const activeCity = cityCode || SUPPORTED_CITIES[0].code;
  const cityMeta = getSupportedCity(activeCity);
  const hasCityTemplate = Object.prototype.hasOwnProperty.call(CITY_TEMPLATES, activeCity);
  const template = hasCityTemplate ? CITY_TEMPLATES[activeCity] : null;
  const exp = template?.explore || {
    welcomeSubtitle: `${cityMeta.name} 여행 데이터를 준비하고 있어요.`,
    bannerTitle: `${cityMeta.name} 추천 가이드를 준비 중입니다`,
    bannerDesc: '스팟, 일정, 지역 가이드는 순차적으로 업데이트됩니다.',
    cities: cityMeta.regions.map((region) => ({
      emoji: cityMeta.emoji,
      name: region,
      desc: '추천 코스 준비 중',
      filter: region,
    })),
    deals: [],
    guidebook: [],
  };
  const partnerProducts = getPartnerProductsForCity(activeCity);
  const regionGridColumns = getRegionGridColumns(regionGridWidth);
  const regionGridCardWidth =
    regionGridWidth > 0
      ? (regionGridWidth - GRID_GAP * (regionGridColumns - 1)) / regionGridColumns
      : undefined;
  const visibleRegions = showAllRegions ? exp.cities : exp.cities.slice(0, 4);
  const hasMoreRegions = exp.cities.length > 4;

  const activeLikedSpots = likedSpots
    .map((s) => (s.spotId ? getSpotDetailById(s.city, s.spotId) : getSpotDetail(s.city, s.originalIndex)))
    .filter((s): s is Exclude<typeof s, null> => s !== null);

  const handleRegionGridLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setRegionGridWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
  };

  if (!hasActiveTrip) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.welcomeGroup}>
            <Text style={styles.welcomeTitle}>안녕하세요, 민상님!</Text>
            <Text style={styles.welcomeSubtitle}>도시를 선택하면 바로 일정 만들기가 시작돼요.</Text>
          </View>
          <TouchableOpacity onPress={onNavigateToMyTrips} style={styles.btnMyTrips} activeOpacity={0.8}>
            <Ionicons name="calendar-outline" size={22} color="#ffffff" />
            <View style={styles.badgePlus}>
              <Text style={styles.badgePlusText}>+</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyHero}>
          <View style={styles.emptyHeroIcon}>
            <Ionicons name="map-outline" size={28} color="#6c5ce7" />
          </View>
          <Text style={styles.emptyHeroTitle}>여행지부터 골라볼까요?</Text>
          <Text style={styles.emptyHeroDesc}>
            아래 도시 카드 중 하나를 누르면 날짜와 인원을 입력해 첫 일정을 만들 수 있어요.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeadingGroup}>
            <Text style={styles.sectionEyebrow}>1단계</Text>
            <Text style={styles.sectionTitleOnly}>여행지 선택</Text>
            <Text style={styles.sectionDesc}>지금은 한국인이 많이 찾는 일본 주요 도시부터 준비했어요.</Text>
          </View>
          <View style={styles.gridContainer} onLayout={handleRegionGridLayout}>
            {SUPPORTED_CITIES.map((city) => (
              <TouchableOpacity
                key={city.code}
                style={[styles.gridCard, regionGridCardWidth ? { width: regionGridCardWidth } : null]}
                onPress={() => onStartTripPlanning(city.code)}
                activeOpacity={0.78}
              >
                <Text style={styles.gridCardEmoji}>{city.emoji}</Text>
                <Text style={styles.gridCardName} numberOfLines={1}>
                  {city.name}
                </Text>
                <Text style={styles.gridCardDesc} numberOfLines={2}>
                  {city.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.emptyTripsButton} onPress={onNavigateToMyTrips} activeOpacity={0.8}>
          <Ionicons name="calendar-outline" size={18} color="#6c5ce7" />
          <Text style={styles.emptyTripsButtonText}>내 일정 화면에서 직접 만들기</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const handleCityPress = (city: CityExploreItem) => {
    const regionGuide = getRegionGuide(activeCity, city.filter);

    if (regionGuide) {
      setSelectedRegionGuide(regionGuide);
      return;
    }

    const message = `'${city.name}' 지역 가이드를 준비 중입니다.`;
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert('알림', message);
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
            안녕하세요, 민상님! {cityMeta.emoji}
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

      <BookingSection activeCity={activeCity} products={partnerProducts} />

      {/* Recommended Cities Grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderBetween}>
          <Text style={[styles.sectionTitleOnly, styles.sectionTitleInline]}>
            🗺️ {cityMeta.exploreLabel} 추천 지역 탐색
          </Text>
          {hasMoreRegions ? (
            <TouchableOpacity
              style={styles.regionToggleButton}
              onPress={() => setShowAllRegions((current) => !current)}
              activeOpacity={0.75}
            >
              <Text style={styles.regionToggleText}>{showAllRegions ? '접기' : '더보기'}</Text>
              <Ionicons
                name={showAllRegions ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#6c5ce7"
              />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.gridContainer} onLayout={handleRegionGridLayout}>
          {visibleRegions.map((city, idx) => (
            <TouchableOpacity
              key={`${city.filter}-${idx}`}
              style={[styles.gridCard, regionGridCardWidth ? { width: regionGridCardWidth } : null]}
              onPress={() => handleCityPress(city)}
              activeOpacity={0.7}
            >
              <Text style={styles.gridCardEmoji}>{city.emoji}</Text>
              <Text style={styles.gridCardName} numberOfLines={1}>
                {city.name}
              </Text>
              <Text style={styles.gridCardDesc} numberOfLines={2}>
                {city.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
                <SpotThumbnail spot={spot} style={styles.likedCardThumb} />
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

      <RegionExploreModal
        visible={Boolean(selectedRegionGuide)}
        guide={selectedRegionGuide}
        products={partnerProducts}
        onClose={() => setSelectedRegionGuide(null)}
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
    boxShadow: '0px 4px 6px rgba(108, 92, 231, 0.3)',
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
  emptyHero: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'flex-start',
    gap: 10,
  },
  emptyHeroIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHeroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  emptyHeroDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyTripsButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  emptyTripsButtonText: {
    fontSize: 14,
    color: '#6c5ce7',
    fontWeight: '800',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeadingGroup: {
    marginBottom: 12,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6c5ce7',
    marginBottom: 4,
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
  sectionDesc: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '600',
    lineHeight: 17,
  },
  sectionTitleInline: {
    flex: 1,
    marginBottom: 0,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  regionToggleButton: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  regionToggleText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#6c5ce7',
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
    gap: GRID_GAP,
  },
  gridCard: {
    width: '100%',
    minHeight: 116,
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
