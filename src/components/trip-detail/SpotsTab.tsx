import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import SpotThumbnail from '../SpotThumbnail';
import { DETAILED_CATEGORIES, SPOT_CATEGORIES, SpotItem } from '../../constants/travelData';
import { getGoogleMapsUrl } from '../../services/mapLinks';
import {
  getRecommendedSpots,
  getSpotSource,
  isSameSpotRef,
  loadSpotDetailById,
} from '../../services/spotCatalog';
import { SpotRef } from '../../types/spot';

interface SpotsTabProps {
  cityCode: string;
  cityFilter: string;
  spotCategoryFilter: string;
  spotSearchQuery: string;
  expandedSpots: { [key: number]: boolean };
  likedSpots: SpotRef[];
  onSetCityFilter: (value: string) => void;
  onSetSpotCategoryFilter: (value: string) => void;
  onSetSpotSearchQuery: (value: string) => void;
  onToggleSpotAccordion: (index: number) => void;
  onToggleLike: (city: string, originalIndex: number) => void;
  onAddSpotToTimeline: (spot: SpotItem) => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
}

const COMPANION_TAGS = [
  { value: 'all', label: '전체' },
  { value: '가족', label: '가족과 함께' },
  { value: '연인', label: '연인과 함께' },
  { value: '혼자', label: '혼자 여행' },
];

export default function SpotsTab({
  cityCode,
  cityFilter,
  spotCategoryFilter,
  spotSearchQuery,
  expandedSpots,
  likedSpots,
  onSetCityFilter,
  onSetSpotCategoryFilter,
  onSetSpotSearchQuery,
  onToggleSpotAccordion,
  onToggleLike,
  onAddSpotToTimeline,
  onRefresh,
  refreshing,
}: SpotsTabProps) {
  const [spotCompanionFilter, setSpotCompanionFilter] = useState<string>('all');
  const [hydratedSpots, setHydratedSpots] = useState<Record<string, SpotItem>>({});
  const [loadingSpotDetails, setLoadingSpotDetails] = useState<Record<string, boolean>>({});

  const handleMapOpen = async (spot: SpotItem) => {
    await Linking.openURL(getGoogleMapsUrl(spot));
  };

  const hydrateSpotDetail = async (source: SpotRef) => {
    if (!source.spotId || hydratedSpots[source.spotId] || loadingSpotDetails[source.spotId]) {
      return;
    }

    const spotId = source.spotId;
    setLoadingSpotDetails((prev) => ({ ...prev, [spotId]: true }));

    try {
      const detail = await loadSpotDetailById(source.city, spotId);
      if (detail) {
        setHydratedSpots((prev) => ({ ...prev, [detail.id]: detail }));
      }
    } catch (error) {
      console.warn(`[SpotCatalog] Failed to hydrate spot detail for ${source.city}/${spotId}:`, error);
    } finally {
      setLoadingSpotDetails((prev) => ({ ...prev, [spotId]: false }));
    }
  };

  const handleToggleSpot = (index: number, source: SpotRef, isExpanded: boolean) => {
    onToggleSpotAccordion(index);

    if (!isExpanded) {
      hydrateSpotDetail(source);
    }
  };

  const filteredSpots = getRecommendedSpots(cityCode, cityFilter).filter((spot) => {
    const normalizedQuery = spotSearchQuery.toLowerCase();
    const hydratedSpot = hydratedSpots[spot.id] || spot;
    const searchText = [
      hydratedSpot.name,
      hydratedSpot.nameKo,
      hydratedSpot.nameJa,
      hydratedSpot.nameEn,
      ...(hydratedSpot.searchKeywords || []),
      hydratedSpot.menu,
      hydratedSpot.tips,
      hydratedSpot.address,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesSearch = normalizedQuery.length === 0 || searchText.includes(normalizedQuery);
    const categoryMeta = SPOT_CATEGORIES[spotCategoryFilter];
    const matchesCategory =
      spotCategoryFilter === 'all' ||
      (categoryMeta && categoryMeta.dbCategories?.includes(hydratedSpot.category));
    const matchesCompanion =
      spotCompanionFilter === 'all' ||
      (hydratedSpot.tags && hydratedSpot.tags.includes(spotCompanionFilter));

    return matchesSearch && matchesCategory && matchesCompanion;
  });

  const renderSpot = ({ item: spot, index }: { item: SpotItem; index: number }) => {
    const isExpanded = !!expandedSpots[index];
    const spotSource = getSpotSource(spot, cityCode || 'sapporo');
    const detailSpot = spotSource.spotId ? hydratedSpots[spotSource.spotId] || spot : spot;
    const isDetailLoading = !!(spotSource.spotId && loadingSpotDetails[spotSource.spotId]);
    const isLiked = likedSpots.some((likedSpot) => isSameSpotRef(likedSpot, spotSource));

    return (
      <View style={styles.spotCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleToggleSpot(index, spotSource, isExpanded)}
          style={styles.spotHeader}
        >
          <SpotThumbnail spot={detailSpot} style={styles.spotThumb} />
          <View style={styles.spotInfo}>
            <View style={styles.spotTitleRow}>
              <Text style={styles.spotName}>{detailSpot.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#f1c40f" />
                <Text style={styles.ratingText}>{detailSpot.rating}</Text>
              </View>
            </View>
            <Text style={styles.spotMenu} numberOfLines={1}>
              {detailSpot.menu}
            </Text>
            <View style={styles.spotCardBadgeRow}>
              <View style={styles.spotBadge}>
                <Text style={styles.spotBadgeText}>
                  {DETAILED_CATEGORIES[detailSpot.category]?.label || '추천 스팟'}
                </Text>
              </View>
              {detailSpot.tags?.map((tag, idx) => (
                <View key={`${tag}-${idx}`} style={[styles.spotBadge, styles.tagBadge]}>
                  <Text style={styles.tagBadgeText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#64748b"
            style={styles.chevron}
          />
        </TouchableOpacity>

        {isExpanded ? (
          <View style={styles.spotDetails}>
            {isDetailLoading ? (
              <View style={styles.spotLoadingRow}>
                <ActivityIndicator size="small" color="#6c5ce7" />
                <Text style={styles.spotLoadingText}>상세 정보를 불러오는 중...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.spotTipsTitle}>추천 포인트</Text>
                <Text style={styles.spotTips}>{detailSpot.tips || '등록된 상세 설명이 없습니다.'}</Text>
                <Text style={styles.spotTimeText}>
                  운영: {detailSpot.openTime || '-'} ~ {detailSpot.closeTime || '-'}
                </Text>
              </>
            )}

            <View style={styles.spotActionRow}>
              <TouchableOpacity
                style={styles.btnSpotSchedule}
                onPress={() => onAddSpotToTimeline(detailSpot)}
                disabled={isDetailLoading}
              >
                <Ionicons name="calendar" size={16} color="#ffffff" />
                <Text style={styles.btnSpotScheduleText}>일정에 추가</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSpotMap}
                onPress={() => handleMapOpen(detailSpot)}
                disabled={isDetailLoading}
              >
                <Ionicons name="map-outline" size={17} color="#6c5ce7" />
                <Text style={styles.btnSpotMapText}>지도보기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSpotLike, isLiked && styles.btnSpotLikeActive]}
                onPress={() => onToggleLike(spotSource.city, spotSource.originalIndex)}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isLiked ? '#ffffff' : '#ff7675'}
                />
                <Text style={[styles.btnSpotLikeText, isLiked && styles.btnSpotLikeTextActive]}>
                  {isLiked ? '찜 완료' : '찜하기'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={spotSearchQuery}
          onChangeText={onSetSpotSearchQuery}
          placeholder="스팟 이름, 추천 메뉴, 키워드 검색..."
        />
        {spotSearchQuery ? (
          <TouchableOpacity onPress={() => onSetSpotSearchQuery('')}>
            <Ionicons name="close" size={18} color="#64748b" />
          </TouchableOpacity>
        ) : null}
      </View>

      {cityCode === 'sapporo' ? (
        <View style={styles.subCityChips}>
          {[
            { value: 'all', label: '전체보기' },
            { value: 'sapporo', label: '삿포로' },
            { value: 'otaru', label: '오타루' },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.value}
              style={[styles.filterChip, cityFilter === chip.value && styles.filterChipActive]}
              onPress={() => onSetCityFilter(chip.value)}
            >
              <Text style={[styles.filterChipText, cityFilter === chip.value && styles.filterChipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <View style={styles.companionChipsWrapper}>
        <Text style={styles.companionTitle}>누구와 함께 가세요?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.companionScroll}>
          {COMPANION_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.value}
              style={[styles.companionChip, spotCompanionFilter === tag.value && styles.companionChipActive]}
              onPress={() => setSpotCompanionFilter(tag.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.companionChipText, spotCompanionFilter === tag.value && styles.companionChipTextActive]}>
                {tag.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.categoryChipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          <TouchableOpacity
            style={[styles.filterChip, spotCategoryFilter === 'all' && styles.filterChipActive]}
            onPress={() => onSetSpotCategoryFilter('all')}
          >
            <Text style={[styles.filterChipText, spotCategoryFilter === 'all' && styles.filterChipTextActive]}>
              전체
            </Text>
          </TouchableOpacity>
          {Object.keys(SPOT_CATEGORIES).map((catKey) => (
            <TouchableOpacity
              key={catKey}
              style={[styles.filterChip, spotCategoryFilter === catKey && styles.filterChipActive]}
              onPress={() => onSetSpotCategoryFilter(catKey)}
            >
              <Text style={[styles.filterChipText, spotCategoryFilter === catKey && styles.filterChipTextActive]}>
                {SPOT_CATEGORIES[catKey].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredSpots}
        keyExtractor={(item) => item.id}
        renderItem={renderSpot}
        contentContainerStyle={styles.spotsScroll}
        ListEmptyComponent={
          <Text style={styles.emptySpotsText}>검색 조건에 맞는 추천 스팟이 없습니다.</Text>
        }
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    margin: 16,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0f172a',
  },
  subCityChips: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  categoryChipsWrapper: {
    height: 40,
    marginBottom: 10,
  },
  catScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  spotsScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  emptySpotsText: {
    textAlign: 'center',
    color: '#64748b',
    marginVertical: 40,
    fontSize: 13,
  },
  spotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  spotThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  spotInfo: {
    flex: 1,
    gap: 2,
    paddingRight: 6,
  },
  spotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spotName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
  spotMenu: {
    fontSize: 11,
    color: '#64748b',
  },
  spotCardBadgeRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  spotBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  spotBadgeText: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 6,
  },
  spotDetails: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fafafb',
    gap: 6,
  },
  spotTipsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6c5ce7',
  },
  spotTips: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  spotTimeText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  spotLoadingRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spotLoadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  spotActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  btnSpotSchedule: {
    flex: 1.2,
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
    height: 38,
    gap: 4,
  },
  btnSpotScheduleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  btnSpotMap: {
    flex: 1,
    minWidth: 104,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.32)',
    borderRadius: 8,
    height: 38,
    gap: 4,
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
  },
  btnSpotMapText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6c5ce7',
  },
  btnSpotLike: {
    flex: 1,
    minWidth: 104,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ff7675',
    borderRadius: 8,
    height: 38,
    gap: 4,
    backgroundColor: '#ffffff',
  },
  btnSpotLikeActive: {
    backgroundColor: '#ff7675',
  },
  btnSpotLikeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff7675',
  },
  btnSpotLikeTextActive: {
    color: '#ffffff',
  },
  companionChipsWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 6,
  },
  companionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    marginLeft: 4,
  },
  companionScroll: {
    gap: 8,
    alignItems: 'center',
  },
  companionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  companionChipActive: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  companionChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  companionChipTextActive: {
    color: '#ffffff',
  },
  tagBadge: {
    backgroundColor: '#f1f2f6',
    marginLeft: 6,
  },
  tagBadgeText: {
    fontSize: 9.5,
    color: '#57606f',
    fontWeight: '700',
  },
});
