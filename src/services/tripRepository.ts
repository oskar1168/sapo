import { CITY_TEMPLATES } from '../constants/travelData';
import { SpotRef } from '../types/spot';
import { TripDetail, TripMetadata } from '../types/trip';
import {
  clearActiveTripId,
  deleteTripDetail,
  loadActiveTripId,
  loadLikedSpots,
  loadTripDetail,
  loadTripsList,
  saveActiveTripId,
  saveLikedSpots,
  saveTripDetail,
  saveTripsList,
} from './tripStorage';

export type AppTripSnapshot = {
  tripsList: TripMetadata[];
  likedSpots: SpotRef[];
  activeTripId: string;
  travelData: TripDetail | null;
};

const createTripId = () => `trip-${Date.now()}`;

const metadataFromDetail = (id: string, detail: any): TripMetadata => ({
  id,
  cityCode: detail.cityCode,
  title: detail.title,
  startDate: detail.startDate,
  endDate: detail.endDate,
  memberCount: detail.memberCount,
});

export async function loadInitialTripSnapshot(): Promise<AppTripSnapshot> {
  let tripsList = await loadTripsList();
  const likedSpots = await loadLikedSpots();
  let activeTripId = await loadActiveTripId();
  let travelData: TripDetail | null = null;

  if (tripsList.length === 0) {
    const defaultDetail = CITY_TEMPLATES.sapporo;
    const defaultTripId = createTripId();

    tripsList = [metadataFromDetail(defaultTripId, defaultDetail)];
    activeTripId = defaultTripId;
    travelData = defaultDetail;

    await saveTripDetail(defaultTripId, defaultDetail);
    await saveTripsList(tripsList);
    await saveActiveTripId(defaultTripId);
  } else if (activeTripId) {
    travelData = await loadTripDetail(activeTripId);

    if (!travelData) {
      travelData = CITY_TEMPLATES.sapporo;
      await saveTripDetail(activeTripId, travelData);
    }
  }

  return {
    tripsList,
    likedSpots,
    activeTripId,
    travelData,
  };
}

export async function persistTripsList(tripsList: TripMetadata[]) {
  await saveTripsList(tripsList);
}

export async function persistLikedSpots(likedSpots: SpotRef[]) {
  await saveLikedSpots(likedSpots);
}

export async function createTrip(
  currentTrips: TripMetadata[],
  newTripMeta: Omit<TripMetadata, 'id'>,
) {
  const newId = createTripId();
  const tripMeta: TripMetadata = { id: newId, ...newTripMeta };
  const tripsList = [tripMeta, ...currentTrips];
  const template = CITY_TEMPLATES[newTripMeta.cityCode] || CITY_TEMPLATES.sapporo;
  const travelData = {
    ...template,
    title: newTripMeta.title,
    startDate: newTripMeta.startDate,
    endDate: newTripMeta.endDate,
    memberCount: newTripMeta.memberCount,
  };

  await saveTripDetail(newId, travelData);
  await saveActiveTripId(newId);
  await saveTripsList(tripsList);

  return {
    tripId: newId,
    tripsList,
    travelData,
  };
}

export async function updateTripMetadata(
  currentTrips: TripMetadata[],
  updatedMeta: TripMetadata,
) {
  const tripsList = currentTrips.map((trip) => (trip.id === updatedMeta.id ? updatedMeta : trip));
  await saveTripsList(tripsList);

  const detail = await loadTripDetail<any>(updatedMeta.id);
  if (detail) {
    const updatedDetail = {
      ...detail,
      title: updatedMeta.title,
      startDate: updatedMeta.startDate,
      endDate: updatedMeta.endDate,
      memberCount: updatedMeta.memberCount,
    };

    await saveTripDetail(updatedMeta.id, updatedDetail);
    return { tripsList, travelData: updatedDetail };
  }

  return { tripsList, travelData: null };
}

export async function deleteTrip(
  currentTrips: TripMetadata[],
  tripId: string,
  activeTripId: string,
) {
  const tripsList = currentTrips.filter((trip) => trip.id !== tripId);
  await saveTripsList(tripsList);
  await deleteTripDetail(tripId);

  if (tripId !== activeTripId) {
    return {
      tripsList,
      activeTripId,
      travelData: null,
    };
  }

  if (tripsList.length === 0) {
    await clearActiveTripId();
    return {
      tripsList,
      activeTripId: '',
      travelData: null,
    };
  }

  const nextActiveTripId = tripsList[0].id;
  await saveActiveTripId(nextActiveTripId);

  return {
    tripsList,
    activeTripId: nextActiveTripId,
    travelData: await loadTripDetail(nextActiveTripId),
  };
}

export async function updateActiveTripDetail(
  tripsList: TripMetadata[],
  activeTripId: string,
  updatedDetail: any,
) {
  await saveTripDetail(activeTripId, updatedDetail);

  const updatedTripsList = tripsList.map((trip) => {
    if (trip.id === activeTripId) {
      return {
        ...trip,
        title: updatedDetail.title,
        startDate: updatedDetail.startDate,
        endDate: updatedDetail.endDate,
        memberCount: updatedDetail.memberCount,
      };
    }
    return trip;
  });

  await saveTripsList(updatedTripsList);
  return updatedTripsList;
}

export async function selectTrip(tripId: string) {
  await saveActiveTripId(tripId);
  return loadTripDetail(tripId);
}
