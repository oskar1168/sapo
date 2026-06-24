import AsyncStorage from '@react-native-async-storage/async-storage';

import { ensureSupabaseSession, isSupabaseConfigured, supabase } from '../lib/supabase';
import { SpotRef } from '../types/spot';
import { TripMetadata } from '../types/trip';
import { CityTemplate } from '../types/travelData';

const STORAGE_KEYS = {
  tripsList: 'sapo_trips_list',
  likedSpots: 'sapo_liked_spots',
  activeTripId: 'sapo_active_trip_id',
};

const tripDetailKey = (tripId: string) => `sapo_trip_detail_${tripId}`;
const REMOTE_DETAIL_SAVE_DEBOUNCE_MS = 1200;

type SaveTripDetailOptions = {
  remoteSync?: 'debounced' | 'immediate';
};

type PendingTripDetailSave = {
  detail: unknown;
  timer: ReturnType<typeof setTimeout>;
};

const pendingTripDetailSaves = new Map<string, PendingTripDetailSave>();

const metadataFromSupabaseRow = (row: any): TripMetadata => ({
  id: row.id,
  cityCode: row.city_code,
  title: row.title,
  startDate: row.start_date,
  endDate: row.end_date,
  memberCount: row.member_count,
});

const metadataToSupabaseRow = (trip: TripMetadata) => ({
  id: trip.id,
  city_code: trip.cityCode,
  title: trip.title,
  start_date: trip.startDate,
  end_date: trip.endDate,
  member_count: trip.memberCount,
  updated_at: new Date().toISOString(),
});

async function loadLocalTripsList(): Promise<TripMetadata[]> {
  const savedTrips = await AsyncStorage.getItem(STORAGE_KEYS.tripsList);
  return savedTrips ? JSON.parse(savedTrips) : [];
}

async function saveLocalTripsList(trips: TripMetadata[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.tripsList, JSON.stringify(trips));
}

async function loadLocalLikedSpots(): Promise<SpotRef[]> {
  const savedLiked = await AsyncStorage.getItem(STORAGE_KEYS.likedSpots);
  return savedLiked ? JSON.parse(savedLiked) : [];
}

async function saveLocalLikedSpots(likedSpots: SpotRef[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.likedSpots, JSON.stringify(likedSpots));
}

async function loadLocalTripDetail<T = CityTemplate>(tripId: string): Promise<T | null> {
  const savedDetail = await AsyncStorage.getItem(tripDetailKey(tripId));
  return savedDetail ? JSON.parse(savedDetail) : null;
}

async function saveLocalTripDetail(tripId: string, detail: unknown) {
  await AsyncStorage.setItem(tripDetailKey(tripId), JSON.stringify(detail));
}

async function deleteLocalTripDetail(tripId: string) {
  await AsyncStorage.removeItem(tripDetailKey(tripId));
}

async function syncTripDetailToSupabase(tripId: string, detail: unknown) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const user = await ensureSupabaseSession();
    if (!user) return;

    const typedDetail = detail as Partial<CityTemplate>;
    const { error } = await supabase.from('trips').upsert({
      id: tripId,
      user_id: user.id,
      city_code: typedDetail.cityCode || 'sapporo',
      title: typedDetail.title || 'SAPO Trip',
      start_date: typedDetail.startDate || '',
      end_date: typedDetail.endDate || '',
      member_count: typedDetail.memberCount || 1,
      detail,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (error) {
    console.warn('Supabase trip detail save failed, local copy kept:', error);
  }
}

function cancelPendingTripDetailSave(tripId: string) {
  const pendingSave = pendingTripDetailSaves.get(tripId);
  if (!pendingSave) return;

  clearTimeout(pendingSave.timer);
  pendingTripDetailSaves.delete(tripId);
}

function queueTripDetailSupabaseSync(tripId: string, detail: unknown) {
  cancelPendingTripDetailSave(tripId);

  const timer = setTimeout(() => {
    const pendingSave = pendingTripDetailSaves.get(tripId);
    if (!pendingSave) return;

    pendingTripDetailSaves.delete(tripId);
    void syncTripDetailToSupabase(tripId, pendingSave.detail);
  }, REMOTE_DETAIL_SAVE_DEBOUNCE_MS);

  pendingTripDetailSaves.set(tripId, { detail, timer });
}

async function migrateLocalTripsToSupabase(userId: string) {
  if (!supabase) return false;

  const localTrips = await loadLocalTripsList();
  if (localTrips.length === 0) return false;

  const rows = await Promise.all(
    localTrips.map(async (trip) => ({
      ...metadataToSupabaseRow(trip),
      user_id: userId,
      detail: (await loadLocalTripDetail(trip.id)) || {},
    })),
  );

  const { error } = await supabase.from('trips').upsert(rows);
  if (error) throw error;
  return true;
}

export async function syncLocalTripDataToSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    return { skipped: true, trips: 0, likedSpots: 0 };
  }

  const user = await ensureSupabaseSession();
  if (!user) {
    return { skipped: true, trips: 0, likedSpots: 0 };
  }

  const localTrips = await loadLocalTripsList();
  const localLikedSpots = await loadLocalLikedSpots();

  if (localTrips.length > 0) {
    await migrateLocalTripsToSupabase(user.id);
  }

  if (localLikedSpots.length > 0) {
    const { error } = await supabase.from('liked_spots').upsert({
      user_id: user.id,
      spots: localLikedSpots,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  return {
    skipped: false,
    trips: localTrips.length,
    likedSpots: localLikedSpots.length,
  };
}

export async function loadTripsList(): Promise<TripMetadata[]> {
  if (!isSupabaseConfigured || !supabase) {
    return loadLocalTripsList();
  }

  try {
    const user = await ensureSupabaseSession();
    if (!user) return loadLocalTripsList();

    const { data, error } = await supabase
      .from('trips')
      .select('id, city_code, title, start_date, end_date, member_count, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    if (data.length === 0 && (await migrateLocalTripsToSupabase(user.id))) {
      return loadTripsList();
    }

    const trips = data.map(metadataFromSupabaseRow);
    await saveLocalTripsList(trips);
    return trips;
  } catch (error) {
    console.warn('Supabase trips load failed, using local storage:', error);
    return loadLocalTripsList();
  }
}

type SaveTripsListOptions = {
  includeDetails?: boolean;
};

export async function saveTripsList(trips: TripMetadata[], options: SaveTripsListOptions = {}) {
  const { includeDetails = true } = options;

  await saveLocalTripsList(trips);

  if (!isSupabaseConfigured || !supabase) return;

  try {
    const user = await ensureSupabaseSession();
    if (!user) return;

    if (trips.length > 0) {
      const rows = await Promise.all(
        trips.map(async (trip) => {
          const row = {
            ...metadataToSupabaseRow(trip),
            user_id: user.id,
          };

          return includeDetails
            ? {
                ...row,
                detail: (await loadLocalTripDetail(trip.id)) || {},
              }
            : row;
        }),
      );
      const { error } = await supabase.from('trips').upsert(rows);
      if (error) throw error;
    }

    const tripIds = trips.map((trip) => trip.id);
    const staleTripsQuery = supabase.from('trips').delete().eq('user_id', user.id);
    const { error: deleteError } =
      tripIds.length > 0
        ? await staleTripsQuery.not('id', 'in', `(${tripIds.join(',')})`)
        : await staleTripsQuery;

    if (deleteError) throw deleteError;
  } catch (error) {
    console.warn('Supabase trips save failed, local copy kept:', error);
  }
}

export async function loadLikedSpots(): Promise<SpotRef[]> {
  if (!isSupabaseConfigured || !supabase) {
    return loadLocalLikedSpots();
  }

  try {
    const user = await ensureSupabaseSession();
    if (!user) return loadLocalLikedSpots();

    const { data, error } = await supabase
      .from('liked_spots')
      .select('spots')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    const spots = (data?.spots as SpotRef[] | null) || (await loadLocalLikedSpots());
    await saveLocalLikedSpots(spots);
    return spots;
  } catch (error) {
    console.warn('Supabase liked spots load failed, using local storage:', error);
    return loadLocalLikedSpots();
  }
}

export async function saveLikedSpots(likedSpots: SpotRef[]) {
  await saveLocalLikedSpots(likedSpots);

  if (!isSupabaseConfigured || !supabase) return;

  try {
    const user = await ensureSupabaseSession();
    if (!user) return;

    const { error } = await supabase.from('liked_spots').upsert({
      user_id: user.id,
      spots: likedSpots,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (error) {
    console.warn('Supabase liked spots save failed, local copy kept:', error);
  }
}

export async function loadActiveTripId(): Promise<string> {
  return (await AsyncStorage.getItem(STORAGE_KEYS.activeTripId)) || '';
}

export async function saveActiveTripId(tripId: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.activeTripId, tripId);
}

export async function clearActiveTripId() {
  await AsyncStorage.removeItem(STORAGE_KEYS.activeTripId);
}

export async function loadTripDetail<T = CityTemplate>(tripId: string): Promise<T | null> {
  if (!isSupabaseConfigured || !supabase) {
    return loadLocalTripDetail(tripId);
  }

  try {
    const user = await ensureSupabaseSession();
    if (!user) return loadLocalTripDetail(tripId);

    const { data, error } = await supabase
      .from('trips')
      .select('detail')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data?.detail) return loadLocalTripDetail(tripId);

    await saveLocalTripDetail(tripId, data.detail);
    return data.detail as T;
  } catch (error) {
    console.warn('Supabase trip detail load failed, using local storage:', error);
    return loadLocalTripDetail(tripId);
  }
}

export async function saveTripDetail(
  tripId: string,
  detail: unknown,
  options: SaveTripDetailOptions = {},
) {
  await saveLocalTripDetail(tripId, detail);

  if (!isSupabaseConfigured || !supabase) return;

  if (options.remoteSync === 'immediate') {
    cancelPendingTripDetailSave(tripId);
    await syncTripDetailToSupabase(tripId, detail);
    return;
  }

  queueTripDetailSupabaseSync(tripId, detail);
}

export async function deleteTripDetail(tripId: string) {
  await deleteLocalTripDetail(tripId);
  cancelPendingTripDetailSave(tripId);

  if (!isSupabaseConfigured || !supabase) return;

  try {
    const user = await ensureSupabaseSession();
    if (!user) return;

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', user.id);
    if (error) throw error;
  } catch (error) {
    console.warn('Supabase trip delete failed:', error);
  }
}
