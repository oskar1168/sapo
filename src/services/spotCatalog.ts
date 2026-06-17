import {
  OSAKA_FOOD_LIST,
  OTARU_FOOD_LIST,
  SAPPORO_FOOD_LIST,
  TOKYO_FOOD_LIST,
} from '../data/spots';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getSpotImageKey, getSpotThumbnailKey } from './imageStorage';
import { CityCode, SpotRef } from '../types/spot';
import { SpotItem } from '../types/travelData';

export type SpotWithSource = SpotItem & SpotRef;

type SpotCatalogRow = {
  id: string;
  city_code: string;
  category: string;
  name: string;
  rating: string | null;
  menu: string | null;
  tips: string | null;
  address: string | null;
  open_time: string | null;
  close_time: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  image_blurhash: string | null;
};

const LOCAL_SPOT_LISTS: Record<CityCode, SpotItem[]> = {
  sapporo: withImageKeys('sapporo', SAPPORO_FOOD_LIST),
  otaru: withImageKeys('otaru', OTARU_FOOD_LIST),
  tokyo: withImageKeys('tokyo', TOKYO_FOOD_LIST),
  osaka: withImageKeys('osaka', OSAKA_FOOD_LIST),
};

let activeSpotLists: Record<CityCode, SpotItem[]> = LOCAL_SPOT_LISTS;

function withImageKeys(city: CityCode, spots: SpotItem[]): SpotItem[] {
  return spots.map((spot) => ({
    ...spot,
    thumbnailKey: getSpotThumbnailKey(spot, city),
    imageKey: getSpotImageKey(spot, city),
  }));
}

function emptySpotLists(): Record<CityCode, SpotItem[]> {
  return {
    sapporo: [],
    otaru: [],
    tokyo: [],
    osaka: [],
  };
}

function spotFromSupabaseRow(row: SpotCatalogRow): SpotItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    rating: row.rating || '',
    menu: row.menu || '',
    tips: row.tips || '',
    address: row.address || '',
    openTime: row.open_time || '',
    closeTime: row.close_time || '',
    thumbnailUrl: row.thumbnail_url || undefined,
    imageUrl: row.image_url || undefined,
    imageBlurhash: row.image_blurhash || undefined,
  };
}

function setActiveSpotLists(rows: SpotCatalogRow[]) {
  const nextSpotLists = emptySpotLists();

  rows.forEach((row) => {
    if (!isCityCode(row.city_code)) return;
    nextSpotLists[row.city_code].push(spotFromSupabaseRow(row));
  });

  activeSpotLists = {
    sapporo: nextSpotLists.sapporo.length > 0 ? nextSpotLists.sapporo : LOCAL_SPOT_LISTS.sapporo,
    otaru: nextSpotLists.otaru.length > 0 ? nextSpotLists.otaru : LOCAL_SPOT_LISTS.otaru,
    tokyo: nextSpotLists.tokyo.length > 0 ? nextSpotLists.tokyo : LOCAL_SPOT_LISTS.tokyo,
    osaka: nextSpotLists.osaka.length > 0 ? nextSpotLists.osaka : LOCAL_SPOT_LISTS.osaka,
  };
}

export async function loadSpotCatalog() {
  if (!isSupabaseConfigured || !supabase) {
    activeSpotLists = LOCAL_SPOT_LISTS;
    return activeSpotLists;
  }

  try {
    const { data, error } = await supabase
      .from('spots')
      .select(
        'id, city_code, category, name, rating, menu, tips, address, open_time, close_time, thumbnail_url, image_url, image_blurhash',
      )
      .eq('is_active', true)
      .order('city_code', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return activeSpotLists;

    setActiveSpotLists(data as SpotCatalogRow[]);
    return activeSpotLists;
  } catch (error) {
    console.warn('Supabase spot catalog load failed, using bundled catalog:', error);
    activeSpotLists = LOCAL_SPOT_LISTS;
    return activeSpotLists;
  }
}

export function getSpotDetail(city: string, originalIndex: number): SpotWithSource | null {
  if (!isCityCode(city)) return null;

  const item = activeSpotLists[city][originalIndex];
  if (!item) return null;

  return { ...item, city, spotId: item.id, originalIndex };
}

export function getSpotDetailById(city: string, spotId: string): SpotWithSource | null {
  if (!isCityCode(city)) return null;

  const originalIndex = activeSpotLists[city].findIndex((item) => item.id === spotId);
  if (originalIndex < 0) return null;

  const item = activeSpotLists[city][originalIndex];
  return { ...item, city, spotId: item.id, originalIndex };
}

export function getSpotSource(spot: SpotItem, fallbackCity = 'sapporo'): SpotRef {
  for (const city of Object.keys(activeSpotLists) as CityCode[]) {
    const originalIndex = activeSpotLists[city].findIndex((item) => item.id === spot.id);
    if (originalIndex > -1) {
      return { city, spotId: activeSpotLists[city][originalIndex].id, originalIndex };
    }
  }

  const city = isCityCode(fallbackCity) ? fallbackCity : 'sapporo';
  return { city, spotId: activeSpotLists[city][0]?.id, originalIndex: 0 };
}

export function isSameSpotRef(left: SpotRef, right: SpotRef) {
  if (left.city !== right.city) return false;
  if (left.spotId && right.spotId) return left.spotId === right.spotId;
  return left.originalIndex === right.originalIndex;
}

export function getRecommendedSpots(cityCode: string, subCityFilter = 'all'): SpotItem[] {
  if (cityCode === 'tokyo') return activeSpotLists.tokyo;
  if (cityCode === 'osaka') return activeSpotLists.osaka;

  if (subCityFilter === 'sapporo') return activeSpotLists.sapporo;
  if (subCityFilter === 'otaru') return activeSpotLists.otaru;

  return [...activeSpotLists.sapporo, ...activeSpotLists.otaru];
}

function isCityCode(value: string): value is CityCode {
  return value in LOCAL_SPOT_LISTS;
}
