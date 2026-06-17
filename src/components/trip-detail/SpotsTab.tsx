import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import SpotThumbnail from '../SpotThumbnail';
import { FOOD_CATEGORIES, SpotItem } from '../../constants/travelData';
import { getRecommendedSpots, getSpotSource, isSameSpotRef } from '../../services/spotCatalog';
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
}

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
}: SpotsTabProps) {
  const filteredSpots = getRecommendedSpots(cityCode, cityFilter).filter((spot) => {
    const normalizedQuery = spotSearchQuery.toLowerCase();
    const searchText = [
      spot.name,
      spot.nameKo,
      spot.nameJa,
      spot.nameEn,
      ...(spot.searchKeywords || []),
      spot.menu,
      spot.tips,
      spot.address,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesSearch =
      normalizedQuery.length === 0 || searchText.includes(normalizedQuery);
    const matchesCategory = spotCategoryFilter === 'all' || spot.category === spotCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const renderSpot = ({ item: spot, index }: { item: SpotItem; index: number }) => {
    const isExpanded = !!expandedSpots[index];
    const spotSource = getSpotSource(spot, cityCode || 'sapporo');
    const isLiked = likedSpots.some((likedSpot) => isSameSpotRef(likedSpot, spotSource));

    return (
      <View style={styles.spotCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onToggleSpotAccordion(index)}
          style={styles.spotHeader}
        >
          <SpotThumbnail spot={spot} style={styles.spotThumb} />
          <View style={styles.spotInfo}>
            <View style={styles.spotTitleRow}>
              <Text style={styles.spotName}>{spot.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#f1c40f" />
                <Text style={styles.ratingText}>{spot.rating}</Text>
              </View>
            </View>
            <Text style={styles.spotMenu} numberOfLines={1}>
              {spot.menu}
            </Text>
            <View style={styles.spotCardBadgeRow}>
              <View style={styles.spotBadge}>
                <Text style={styles.spotBadgeText}>
                  {FOOD_CATEGORIES[spot.category]?.label || '추천 스팟'}
                </Text>
              </View>
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
            <Text style={styles.spotTipsTitle}>현지 꿀팁</Text>
            <Text style={styles.spotTips}>{spot.tips}</Text>
            <Text style={styles.spotTimeText}>
              운영: {spot.openTime} ~ {spot.closeTime}
            </Text>

            <View style={styles.spotActionRow}>
              <TouchableOpacity
                style={styles.btnSpotSchedule}
                onPress={() => onAddSpotToTimeline(spot)}
              >
                <Ionicons name="calendar" size={16} color="#ffffff" />
                <Text style={styles.btnSpotScheduleText}>일정에 추가</Text>
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
          placeholder="스팟 이름, 추천 메뉴, 꿀팁 검색..."
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
          {Object.keys(FOOD_CATEGORIES).map((catKey) => (
            <TouchableOpacity
              key={catKey}
              style={[styles.filterChip, spotCategoryFilter === catKey && styles.filterChipActive]}
              onPress={() => onSetSpotCategoryFilter(catKey)}
            >
              <Text style={[styles.filterChipText, spotCategoryFilter === catKey && styles.filterChipTextActive]}>
                {FOOD_CATEGORIES[catKey].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredSpots}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={renderSpot}
        contentContainerStyle={styles.spotsScroll}
        ListEmptyComponent={
          <Text style={styles.emptySpotsText}>검색 조건에 맞는 추천 스팟이 없습니다.</Text>
        }
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
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
  spotActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  btnSpotSchedule: {
    flex: 1.2,
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
  btnSpotLike: {
    flex: 1,
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
});
