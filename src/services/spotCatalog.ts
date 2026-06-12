import {
  OSAKA_FOOD_LIST,
  OTARU_FOOD_LIST,
  SAPPORO_FOOD_LIST,
  TOKYO_FOOD_LIST,
} from '../data/spots';
import { getSpotImageKey, getSpotThumbnailKey } from './imageStorage';
import { CityCode, SpotRef } from '../types/spot';
import { SpotItem } from '../types/travelData';

export type SpotWithSource = SpotItem & SpotRef;

const SPOT_LISTS: Record<CityCode, SpotItem[]> = {
  sapporo: withImageKeys('sapporo', SAPPORO_FOOD_LIST),
  otaru: withImageKeys('otaru', OTARU_FOOD_LIST),
  tokyo: withImageKeys('tokyo', TOKYO_FOOD_LIST),
  osaka: withImageKeys('osaka', OSAKA_FOOD_LIST),
};

function withImageKeys(city: CityCode, spots: SpotItem[]): SpotItem[] {
  return spots.map((spot) => ({
    ...spot,
    thumbnailKey: getSpotThumbnailKey(spot, city),
    imageKey: getSpotImageKey(spot, city),
  }));
}

export function getSpotDetail(city: string, originalIndex: number): SpotWithSource | null {
  if (!isCityCode(city)) return null;

  const item = SPOT_LISTS[city][originalIndex];
  if (!item) return null;

  return { ...item, city, spotId: item.id, originalIndex };
}

export function getSpotDetailById(city: string, spotId: string): SpotWithSource | null {
  if (!isCityCode(city)) return null;

  const originalIndex = SPOT_LISTS[city].findIndex((item) => item.id === spotId);
  if (originalIndex < 0) return null;

  const item = SPOT_LISTS[city][originalIndex];
  return { ...item, city, spotId: item.id, originalIndex };
}

export function getSpotSource(spot: SpotItem, fallbackCity = 'sapporo'): SpotRef {
  for (const city of Object.keys(SPOT_LISTS) as CityCode[]) {
    const originalIndex = SPOT_LISTS[city].findIndex((item) => item.id === spot.id);
    if (originalIndex > -1) {
      return { city, spotId: SPOT_LISTS[city][originalIndex].id, originalIndex };
    }
  }

  const city = isCityCode(fallbackCity) ? fallbackCity : 'sapporo';
  return { city, spotId: SPOT_LISTS[city][0]?.id, originalIndex: 0 };
}

export function isSameSpotRef(left: SpotRef, right: SpotRef) {
  if (left.city !== right.city) return false;
  if (left.spotId && right.spotId) return left.spotId === right.spotId;
  return left.originalIndex === right.originalIndex;
}

export function getRecommendedSpots(cityCode: string, subCityFilter = 'all'): SpotItem[] {
  if (cityCode === 'tokyo') return SPOT_LISTS.tokyo;
  if (cityCode === 'osaka') return SPOT_LISTS.osaka;

  if (subCityFilter === 'sapporo') return SPOT_LISTS.sapporo;
  if (subCityFilter === 'otaru') return SPOT_LISTS.otaru;

  return [...SPOT_LISTS.sapporo, ...SPOT_LISTS.otaru];
}

function isCityCode(value: string): value is CityCode {
  return value in SPOT_LISTS;
}
