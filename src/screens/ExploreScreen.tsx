import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  LayoutChangeEvent,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CITY_TEMPLATES, DETAILED_CATEGORIES } from '../constants/travelData';
import BookingSection from '../components/explore/BookingSection';
import RegionExploreModal from '../components/RegionExploreModal';
import TravelMagazineModal from '../components/TravelMagazineModal';
import SpotThumbnail from '../components/SpotThumbnail';
import { SUPPORTED_CITIES, getSupportedCity } from '../data/supportedCities';
import { getPartnerProductsForCity, type PartnerProduct } from '../data/partnerProducts';
import { getRegionGuide, getRegionGuidesForCity, type RegionGuide } from '../data/regionGuides';
import { getTravelMagazinesForCity, type TravelMagazine } from '../data/travelMagazines';
import { getGoogleMapsUrl } from '../services/mapLinks';
import { getRecommendedSpots, getSpotDetail, getSpotDetailById, getSpotSource } from '../services/spotCatalog';
import type { DayOption } from '../services/tripPlanning';
import type { AddRegionRouteResult } from '../components/RegionExploreModal';
import { SpotRef } from '../types/spot';
import { AffiliateDealItem, CityExploreItem, SpotItem } from '../types/travelData';

const GRID_GAP = 12;
const FEATURED_SPOT_LIMIT = 6;

const contentSourceTypeLabels: Record<string, string> = {
  tv: '방송 소개',
  youtube: '유튜브 소개',
  sns: 'SNS 화제',
  blog: '블로그 소개',
  magazine: '매체 소개',
};

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

const getFeaturedSourceLabel = (spot: SpotItem) => {
  const source = spot.contentSources?.[0];
  if (!source) return '추천 스팟';
  return source.title || contentSourceTypeLabels[source.type] || '콘텐츠 소개';
};

const getFeaturedSpots = (cityCode: string) => {
  const spots = getRecommendedSpots(cityCode);
  const contentSpots = spots.filter((spot) => spot.contentSources?.length);
  const fallbackSpots = spots.filter((spot) => !spot.contentSources?.length);
  const sourceSpots = [...contentSpots, ...fallbackSpots];

  if (sourceSpots.length > 0) {
    return sourceSpots.slice(0, FEATURED_SPOT_LIMIT);
  }

  return getRegionGuidesForCity(cityCode)
    .flatMap((guide) =>
      guide.route.slice(0, 1).map<SpotItem>((routeName) => ({
        id: `${guide.cityCode}-${guide.filter}-featured`,
        name: routeName,
        category: 'spot',
        rating: '추천',
        menu: guide.subtitle,
        tips: guide.tips[0] || guide.subtitle,
        address: routeName,
        openTime: '',
        closeTime: '',
        sourceName: `region-guide:${guide.filter}`,
        contentSources: [
          {
            type: 'blog',
            title: `${guide.title} 추천 동선`,
            note: guide.subtitle,
            verified: true,
          },
        ],
      })),
    )
    .slice(0, FEATURED_SPOT_LIMIT);
};

const getExploreDealIcon = (product: PartnerProduct) => {
  if (product.id.includes('coupon')) return 'coupon';
  if (product.category === 'transport' || product.category === 'pass') return 'train';
  if (product.category === 'restaurant') return 'restaurant';
  return 'ticket';
};

const getFallbackExploreDeals = (products: PartnerProduct[]): AffiliateDealItem[] => {
  return products.slice(0, 3).map((product) => ({
    emoji: getExploreDealIcon(product),
    color: product.color,
    title: product.title,
    desc: product.desc,
  }));
};

interface ExploreScreenProps {
  likedSpots: SpotRef[];
  onToggleLike: (city: string, originalIndex: number) => void;
  onAddSpotToTimeline: (city: string, originalIndex: number) => void;
  onNavigateToMyTrips: () => void;
  onStartTripPlanning: (cityCode: string) => void;
  dayOptions?: DayOption[];
  onAddRegionRouteToDay?: (guide: RegionGuide, dayKey: string) => AddRegionRouteResult | null;
  cityCode?: string;
}

export default function ExploreScreen({
  likedSpots,
  onToggleLike,
  onAddSpotToTimeline,
  onNavigateToMyTrips,
  onStartTripPlanning,
  dayOptions = [],
  onAddRegionRouteToDay,
  cityCode,
}: ExploreScreenProps) {
  const [selectedRegionGuide, setSelectedRegionGuide] = useState<RegionGuide | null>(null);
  const [selectedMagazine, setSelectedMagazine] = useState<TravelMagazine | null>(null);
  const [regionGridWidth, setRegionGridWidth] = useState(0);
  const [showAllRegions, setShowAllRegions] = useState(false);

  const hasActiveTrip = Boolean(cityCode);
  const activeCity = cityCode || SUPPORTED_CITIES[0].code;
  const cityMeta = getSupportedCity(activeCity);
  const hasCityTemplate = Object.prototype.hasOwnProperty.call(CITY_TEMPLATES, activeCity);
  const template = hasCityTemplate ? CITY_TEMPLATES[activeCity] : null;
  const partnerProducts = getPartnerProductsForCity(activeCity);
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
    deals: getFallbackExploreDeals(partnerProducts),
    guidebook: [],
  };
  const regionGridColumns = getRegionGridColumns(regionGridWidth);
  const regionGridCardWidth =
    regionGridWidth > 0
      ? (regionGridWidth - GRID_GAP * (regionGridColumns - 1)) / regionGridColumns
      : undefined;
  const visibleRegions = showAllRegions ? exp.cities : exp.cities.slice(0, 4);
  const hasMoreRegions = exp.cities.length > 4;
  const featuredSpots = getFeaturedSpots(activeCity);
  const travelMagazines = getTravelMagazinesForCity(activeCity);

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


  const handleFeaturedSpotMapOpen = async (spot: SpotItem) => {
    await Linking.openURL(getGoogleMapsUrl(spot));
  };

  const handleFeaturedSpotAdd = (spot: SpotItem) => {
    if (spot.sourceName?.startsWith('region-guide:')) {
      const guideFilter = spot.sourceName.replace('region-guide:', '');
      const regionGuide = getRegionGuide(activeCity, guideFilter);
      if (regionGuide) {
        setSelectedRegionGuide(regionGuide);
        return;
      }
    }

    const source = getSpotSource(spot, activeCity);
    onAddSpotToTimeline(source.city, source.originalIndex);
  };

  const handleMagazineRouteAdd = (magazine: TravelMagazine, dayKey: string) => {
    const guideLikeMagazine: RegionGuide = {
      cityCode: magazine.cityCode,
      filter: magazine.id,
      title: magazine.title,
      subtitle: magazine.subtitle,
      duration: magazine.seasonLabel,
      difficulty: '추천',
      bestTime: magazine.seasonLabel,
      tags: magazine.tags,
      highlights: magazine.enjoyments.map((item) => item.title),
      route: magazine.route,
      itineraryItems: magazine.itineraryItems,
      tips: magazine.tips,
      bookingProductIds: magazine.bookingProductIds,
    };

    return onAddRegionRouteToDay?.(guideLikeMagazine, dayKey) || null;
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

      {featuredSpots.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeaderBetween}>
            <View style={styles.sectionTitleGroup}>
              <Text style={[styles.sectionTitleOnly, styles.sectionTitleInline]}>
                📺 요즘 화제 스팟
              </Text>
              <Text style={styles.sectionDesc}>
                방송·유튜브 소개 장소와 많이 찾는 추천 스팟을 먼저 보여드려요.
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredSpotSliderContent}
          >
            {featuredSpots.map((spot) => (
              <View key={spot.id} style={styles.featuredSpotCard}>
                <SpotThumbnail spot={spot} style={styles.featuredSpotThumb} preferSpotImage />
                <View style={styles.featuredSpotBody}>
                  <View style={styles.featuredSpotBadge}>
                    <Ionicons
                      name={spot.contentSources?.length ? 'play-circle' : 'sparkles-outline'}
                      size={12}
                      color="#b45309"
                    />
                    <Text style={styles.featuredSpotBadgeText} numberOfLines={1}>
                      {getFeaturedSourceLabel(spot)}
                    </Text>
                  </View>
                  <Text style={styles.featuredSpotName} numberOfLines={1}>
                    {spot.name}
                  </Text>
                  <Text style={styles.featuredSpotMeta} numberOfLines={1}>
                    {DETAILED_CATEGORIES[spot.category]?.label || '추천 스팟'} · {spot.rating}
                  </Text>
                  <Text style={styles.featuredSpotMenu} numberOfLines={2}>
                    {spot.menu}
                  </Text>
                  <View style={styles.featuredSpotActions}>
                    <TouchableOpacity
                      style={styles.featuredSpotActionPrimary}
                      onPress={() => handleFeaturedSpotAdd(spot)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={14} color="#ffffff" />
                      <Text style={styles.featuredSpotActionPrimaryText}>일정추가</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.featuredSpotActionSecondary}
                      onPress={() => handleFeaturedSpotMapOpen(spot)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="map-outline" size={14} color="#6c5ce7" />
                      <Text style={styles.featuredSpotActionSecondaryText}>지도</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {travelMagazines.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeaderBetween}>
            <View style={styles.sectionTitleGroup}>
              <Text style={[styles.sectionTitleOnly, styles.sectionTitleInline]}>여행 매거진</Text>
              <Text style={styles.sectionDesc}>
                시즌 축제, 추천 코스, 예약 링크까지 한 번에 볼 수 있는 콘텐츠예요.
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.magazineSliderContent}
          >
            {travelMagazines.map((magazine) => (
              <TouchableOpacity
                key={magazine.id}
                style={styles.magazineCard}
                activeOpacity={0.84}
                onPress={() => setSelectedMagazine(magazine)}
              >
                <Image source={{ uri: magazine.coverImageUrl }} style={styles.magazineImage} />
                <View style={styles.magazineBody}>
                  <View style={styles.magazineMetaRow}>
                    <View style={styles.magazineBadge}>
                      <Ionicons name="book-outline" size={12} color="#6c5ce7" />
                      <Text style={styles.magazineBadgeText}>{magazine.seasonLabel}</Text>
                    </View>
                    <Text style={styles.magazineReadTime}>{magazine.readTime}</Text>
                  </View>
                  <Text style={styles.magazineTitle} numberOfLines={2}>
                    {magazine.title}
                  </Text>
                  <Text style={styles.magazineSubtitle} numberOfLines={2}>
                    {magazine.subtitle}
                  </Text>
                  <View style={styles.magazineTagRow}>
                    {magazine.tags.slice(0, 3).map((tag) => (
                      <Text key={tag} style={styles.magazineTag}>
                        #{tag}
                      </Text>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

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

      <RegionExploreModal
        visible={Boolean(selectedRegionGuide)}
        guide={selectedRegionGuide}
        products={partnerProducts}
        dayOptions={dayOptions}
        onAddRouteToDay={(guide, dayKey) => onAddRegionRouteToDay?.(guide, dayKey) || null}
        onClose={() => setSelectedRegionGuide(null)}
      />
      <TravelMagazineModal
        visible={Boolean(selectedMagazine)}
        magazine={selectedMagazine}
        products={partnerProducts}
        dayOptions={dayOptions}
        onAddMagazineToDay={handleMagazineRouteAdd}
        onClose={() => setSelectedMagazine(null)}
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
  sectionTitleGroup: {
    flex: 1,
    gap: 4,
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
  featuredSpotSliderContent: {
    gap: 12,
    paddingRight: 20,
  },
  featuredSpotCard: {
    width: 238,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredSpotThumb: {
    width: '100%',
    height: 112,
  },
  featuredSpotBody: {
    padding: 12,
    gap: 6,
  },
  featuredSpotBadge: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: 22,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredSpotBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#b45309',
  },
  featuredSpotName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  featuredSpotMeta: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
  },
  featuredSpotMenu: {
    minHeight: 32,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
    color: '#475569',
  },
  featuredSpotActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  featuredSpotActionPrimary: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#6c5ce7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  featuredSpotActionPrimaryText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#ffffff',
  },
  featuredSpotActionSecondary: {
    width: 72,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  featuredSpotActionSecondaryText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#6c5ce7',
  },
  magazineSliderContent: {
    gap: 12,
    paddingRight: 20,
  },
  magazineCard: {
    width: 268,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  magazineImage: {
    width: '100%',
    height: 126,
    backgroundColor: '#e2e8f0',
  },
  magazineBody: {
    padding: 12,
    gap: 7,
  },
  magazineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  magazineBadge: {
    flexShrink: 1,
    minHeight: 23,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  magazineBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#6c5ce7',
  },
  magazineReadTime: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94a3b8',
  },
  magazineTitle: {
    minHeight: 36,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  magazineSubtitle: {
    minHeight: 34,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '600',
    color: '#64748b',
  },
  magazineTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  magazineTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#6c5ce7',
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
