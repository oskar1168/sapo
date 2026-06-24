import {
  OSAKA_FOOD_LIST,
  OTARU_FOOD_LIST,
  SAPPORO_FOOD_LIST,
  TOKYO_FOOD_LIST,
} from '../data/spots';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getSpotImageKey, getSpotThumbnailKey } from './imageStorage';
import { CityCode, SpotRef } from '../types/spot';
import { SpotContentSource, SpotItem } from '../types/travelData';
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
  wikidata_id?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  source_license?: string | null;
  content_sources?: SpotContentSource[] | null;
  rating: string | null;
  menu: string | null;
  tips?: string | null;
  address?: string | null;
  open_time?: string | null;
  close_time?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  google_place_id?: string | null;
  google_maps_url?: string | null;
  thumbnail_url: string | null;
  image_url?: string | null;
  image_blurhash?: string | null;
};

type SpotCachePayload = {
  timestamp: number;
  version?: number;
  data: SpotItem[];
};

const LOCAL_SPOT_LISTS: Record<CityCode, SpotItem[]> = {
  sapporo: withImageKeys('sapporo', SAPPORO_FOOD_LIST),
  otaru: withImageKeys('otaru', OTARU_FOOD_LIST),
  tokyo: withImageKeys('tokyo', TOKYO_FOOD_LIST),
  osaka: withImageKeys('osaka', OSAKA_FOOD_LIST),
  fukuoka: [],
  okinawa: [],
  nagoya: [],
};

let activeSpotLists: Record<CityCode, SpotItem[]> = LOCAL_SPOT_LISTS;

function withImageKeys(city: CityCode, spots: SpotItem[]): SpotItem[] {
  return spots.map((spot) => ({
    ...spot,
    thumbnailKey: getSpotThumbnailKey(spot, city),
    imageKey: getSpotImageKey(spot, city),
  }));
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
    contentSources: Array.isArray(row.content_sources) ? row.content_sources : undefined,
    thumbnailUrl: row.thumbnail_url || undefined,
    imageUrl: row.image_url || undefined,
    imageBlurhash: row.image_blurhash || undefined,
  };
}

const CACHE_PREFIX = 'sapo_cache_spots_';
const CACHE_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const SPOT_LIST_FIELDS = [
  'id',
  'city_code',
  'category',
  'name',
  'name_ko',
  'name_ja',
  'name_en',
  'name_ko_auto',
  'name_ko_status',
  'search_keywords',
  'tags',
  'content_sources',
  'rating',
  'menu',
  'thumbnail_url',
];
const SPOT_DETAIL_FIELDS = [
  ...SPOT_LIST_FIELDS,
  'tips',
  'address',
  'open_time',
  'close_time',
  'latitude',
  'longitude',
  'google_maps_url',
  'wikidata_id',
  'source_name',
  'source_url',
  'source_license',
  'google_place_id',
  'image_url',
  'image_blurhash',
];
const SPOT_LIST_SELECT = SPOT_LIST_FIELDS.join(', ');
const SPOT_DETAIL_SELECT = SPOT_DETAIL_FIELDS.join(', ');
const spotDetailCache = new Map<string, SpotItem>();

function getSpotDetailCacheKey(cityCode: CityCode, spotId: string) {
  return `${cityCode}:${spotId}`;
}

function clearSpotDetailCacheForCity(cityCode: CityCode) {
  const prefix = `${cityCode}:`;
  for (const key of spotDetailCache.keys()) {
    if (key.startsWith(prefix)) {
      spotDetailCache.delete(key);
    }
  }
}

async function loadSpotCatalogVersion(cityCode: CityCode) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('spot_catalog_versions')
      .select('version')
      .eq('city_code', cityCode)
      .maybeSingle();

    if (error) throw error;
    return typeof data?.version === 'number' ? data.version : null;
  } catch (error) {
    console.warn(`[Supabase] Failed to load spot catalog version for ${cityCode}:`, error);
    return null;
  }
}

export async function loadCitySpots(cityCode: CityCode, forceRefresh = false): Promise<SpotItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    activeSpotLists[cityCode] = LOCAL_SPOT_LISTS[cityCode];
    return activeSpotLists[cityCode];
  }

  const cacheKey = `${CACHE_PREFIX}${cityCode}`;

  try {
    const remoteVersion = forceRefresh ? null : await loadSpotCatalogVersion(cityCode);

    if (!forceRefresh) {
      const cachedDataStr = await AsyncStorage.getItem(cacheKey);
      if (cachedDataStr) {
        const { timestamp, version, data } = JSON.parse(cachedDataStr) as SpotCachePayload;
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
        const isSameVersion = remoteVersion !== null && version === remoteVersion;
        const canUseCache = Array.isArray(data) && data.length > 0 && (isSameVersion || (!remoteVersion && !isExpired));

        if (canUseCache) {
          console.log(`[Cache] Using cached spots for ${cityCode}${isSameVersion ? ' by version' : ''}`);
          activeSpotLists[cityCode] = data;
          return data;
        }
      }
    }

    console.log(`[Supabase] Fetching spots for ${cityCode} from database...`);
    const { data, error } = await supabase
      .from('spots')
      .select(SPOT_LIST_SELECT)
      .eq('city_code', cityCode)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      const parsedSpots = data.map((row) => spotFromSupabaseRow(row as unknown as SpotCatalogRow));
      activeSpotLists[cityCode] = parsedSpots;
      clearSpotDetailCacheForCity(cityCode);

      const cacheObj = {
        timestamp: Date.now(),
        version: remoteVersion ?? undefined,
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

  const cachedDetail = spotDetailCache.get(getSpotDetailCacheKey(city, spotId));
  if (cachedDetail) {
    const cachedIndex = activeSpotLists[city].findIndex((item) => item.id === spotId);
    return { ...cachedDetail, city, spotId: cachedDetail.id, originalIndex: Math.max(cachedIndex, 0) };
  }

  const originalIndex = activeSpotLists[city].findIndex((item) => item.id === spotId);
  if (originalIndex < 0) return null;

  const item = activeSpotLists[city][originalIndex];
  return { ...item, city, spotId: item.id, originalIndex };
}

export async function loadSpotDetailById(city: string, spotId: string): Promise<SpotWithSource | null> {
  if (!isCityCode(city)) return null;

  const cacheKey = getSpotDetailCacheKey(city, spotId);
  const cachedDetail = spotDetailCache.get(cacheKey);
  if (cachedDetail) {
    const cachedIndex = activeSpotLists[city].findIndex((item) => item.id === spotId);
    return { ...cachedDetail, city, spotId: cachedDetail.id, originalIndex: Math.max(cachedIndex, 0) };
  }

  if (!isSupabaseConfigured || !supabase) {
    return getSpotDetailById(city, spotId);
  }

  try {
    const { data, error } = await supabase
      .from('spots')
      .select(SPOT_DETAIL_SELECT)
      .eq('city_code', city)
      .eq('id', spotId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return getSpotDetailById(city, spotId);

    const parsedSpot = spotFromSupabaseRow(data as unknown as SpotCatalogRow);
    const originalIndex = activeSpotLists[city].findIndex((item) => item.id === parsedSpot.id);

    if (originalIndex > -1) {
      activeSpotLists[city][originalIndex] = { ...activeSpotLists[city][originalIndex], ...parsedSpot };
    } else {
      activeSpotLists[city] = [...activeSpotLists[city], parsedSpot];
    }

    spotDetailCache.set(cacheKey, parsedSpot);
    return {
      ...parsedSpot,
      city,
      spotId: parsedSpot.id,
      originalIndex: originalIndex > -1 ? originalIndex : activeSpotLists[city].length - 1,
    };
  } catch (error) {
    console.warn(`[Supabase] Failed to load spot detail for ${city}/${spotId}:`, error);
    return getSpotDetailById(city, spotId);
  }
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
  if (cityCode === 'fukuoka') return activeSpotLists.fukuoka;
  if (cityCode === 'okinawa') return activeSpotLists.okinawa;
  if (cityCode === 'nagoya') return activeSpotLists.nagoya;

  if (subCityFilter === 'sapporo') return activeSpotLists.sapporo;
  if (subCityFilter === 'otaru') return activeSpotLists.otaru;

  return [...activeSpotLists.sapporo, ...activeSpotLists.otaru];
}

function isCityCode(value: string): value is CityCode {
  return value in LOCAL_SPOT_LISTS;
}
