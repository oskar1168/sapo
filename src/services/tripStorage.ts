import AsyncStorage from '@react-native-async-storage/async-storage';

import { SpotRef } from '../types/spot';
import { TripMetadata } from '../types/trip';
import { CityTemplate } from '../types/travelData';

const STORAGE_KEYS = {
  tripsList: 'sapo_trips_list',
  likedSpots: 'sapo_liked_spots',
  activeTripId: 'sapo_active_trip_id',
};

const tripDetailKey = (tripId: string) => `sapo_trip_detail_${tripId}`;

export async function loadTripsList(): Promise<TripMetadata[]> {
  const savedTrips = await AsyncStorage.getItem(STORAGE_KEYS.tripsList);
  return savedTrips ? JSON.parse(savedTrips) : [];
}

export async function saveTripsList(trips: TripMetadata[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.tripsList, JSON.stringify(trips));
}

export async function loadLikedSpots(): Promise<SpotRef[]> {
  const savedLiked = await AsyncStorage.getItem(STORAGE_KEYS.likedSpots);
  return savedLiked ? JSON.parse(savedLiked) : [];
}

export async function saveLikedSpots(likedSpots: SpotRef[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.likedSpots, JSON.stringify(likedSpots));
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
  const savedDetail = await AsyncStorage.getItem(tripDetailKey(tripId));
  return savedDetail ? JSON.parse(savedDetail) : null;
}

export async function saveTripDetail(tripId: string, detail: unknown) {
  await AsyncStorage.setItem(tripDetailKey(tripId), JSON.stringify(detail));
}

export async function deleteTripDetail(tripId: string) {
  await AsyncStorage.removeItem(tripDetailKey(tripId));
}
