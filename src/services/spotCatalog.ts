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
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SpotWithSource = SpotItem & SpotRef;

type SpotCatalogRow = {
  id: string;
  city_code: string;
  category: string;
  name: string;
  name_ko: string | null;
  name_ja: string | null;
  name_en: string | null;
  name_ko_auto: string | null;
  name_ko_status: 'auto' | 'reviewed' | 'rejected' | null;
  search_keywords: string[] | null;
  tags: string[] | null;
  wikidata_id: string | null;
  source_name: string | null;
  source_url: string | null;
  source_license: string | null;
  rating: string | null;
  menu: string | null;
  tips: string | null;
  address: string | null;
  open_time: string | null;
  close_time: string | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
  google_maps_url: string | null;
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
  const displayName = row.name_ko || row.name_ko_auto || row.name;

  return {
    id: row.id,
    name: displayName,
    nameKo: row.name_ko || undefined,
    nameJa: row.name_ja || undefined,
    nameEn: row.name_en || undefined,
    nameKoAuto: row.name_ko_auto || undefined,
    nameKoStatus: row.name_ko_status || undefined,
    searchKeywords: row.search_keywords || undefined,
    tags: row.tags || undefined,
    category: row.category,
    rating: row.rating || '',
    menu: row.menu || '',
    tips: row.tips || '',
    address: row.address || '',
    openTime: row.open_time || '',
    closeTime: row.close_time || '',
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    googlePlaceId: row.google_place_id || undefined,
    googleMapsUrl: row.google_maps_url || undefined,
    wikidataId: row.wikidata_id || undefined,
    sourceName: row.source_name || undefined,
    sourceUrl: row.source_url || undefined,
    sourceLicense: row.source_license || undefined,
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

const CACHE_PREFIX = 'sapo_cache_spots_';
const CACHE_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export async function loadCitySpots(cityCode: CityCode, forceRefresh = false): Promise<SpotItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    activeSpotLists[cityCode] = LOCAL_SPOT_LISTS[cityCode];
    return activeSpotLists[cityCode];
  }

  const cacheKey = `${CACHE_PREFIX}${cityCode}`;

  try {
    const isDev = typeof __DEV__ !== 'undefined' && __DEV__;
    if (!forceRefresh && !isDev) {
      const cachedDataStr = await AsyncStorage.getItem(cacheKey);
      if (cachedDataStr) {
        const { timestamp, data } = JSON.parse(cachedDataStr);
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
        if (!isExpired && Array.isArray(data) && data.length > 0) {
          console.log(`[Cache] Using cached spots for ${cityCode}`);
          activeSpotLists[cityCode] = data;
          return data;
        }
      }
    }

    console.log(`[Supabase] Fetching spots for ${cityCode} from database...`);
    const { data, error } = await supabase
      .from('spots')
      .select(
        'id, city_code, category, name, name_ko, name_ja, name_en, name_ko_auto, name_ko_status, search_keywords, tags, wikidata_id, source_name, source_url, source_license, rating, menu, tips, address, open_time, close_time, latitude, longitude, google_place_id, google_maps_url, thumbnail_url, image_url, image_blurhash',
      )
      .eq('city_code', cityCode)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      const parsedSpots = data.map((row) => spotFromSupabaseRow(row as SpotCatalogRow));
      activeSpotLists[cityCode] = parsedSpots;

      const cacheObj = {
        timestamp: Date.now(),
        data: parsedSpots,
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheObj));
      return parsedSpots;
    }
  } catch (error) {
    console.warn(`[Supabase] Failed to load spots for city ${cityCode}, falling back to bundle:`, error);
  }

  if (!activeSpotLists[cityCode] || activeSpotLists[cityCode].length === 0) {
    activeSpotLists[cityCode] = LOCAL_SPOT_LISTS[cityCode];
  }
  return activeSpotLists[cityCode];
}

export async function loadSpotCatalog(cities: CityCode[] = ['sapporo', 'otaru', 'tokyo', 'osaka']) {
  try {
    await Promise.all(cities.map((city) => loadCitySpots(city)));
  } catch (error) {
    console.warn('Failed to load spot catalog completely:', error);
  }
  return activeSpotLists;
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
