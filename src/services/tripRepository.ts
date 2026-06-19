import { CITY_TEMPLATES } from '../constants/travelData';
import { buildPresetTripDays, hasItineraryPreset } from '../data/itineraryPresets';
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

const parseDateOnly = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getInclusiveTripDayCount = (startDate: string, endDate: string) => {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (!start || !end || end < start) {
    return 1;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
};

const cloneTripDays = (days: any = {}) => {
  return Object.keys(days).reduce<Record<string, any[]>>((acc, dayKey) => {
    acc[dayKey] = (days[dayKey] || []).map((item: any) => ({ ...item }));
    return acc;
  }, {});
};

const buildTripDaysForDateRange = (templateDays: any, startDate: string, endDate: string) => {
  const dayCount = getInclusiveTripDayCount(startDate, endDate);
  const clonedTemplateDays = cloneTripDays(templateDays);

  return Array.from({ length: dayCount }).reduce<Record<string, any[]>>((acc, _, index) => {
    const dayKey = `day${index + 1}`;
    acc[dayKey] = clonedTemplateDays[dayKey] || [];
    return acc;
  }, {});
};

const buildCityTripDaysForDateRange = (
  cityCode: string,
  templateDays: any,
  startDate: string,
  endDate: string,
) => {
  const dayCount = getInclusiveTripDayCount(startDate, endDate);

  if (hasItineraryPreset(cityCode)) {
    return buildPresetTripDays(cityCode, dayCount);
  }

  return buildTripDaysForDateRange(templateDays, startDate, endDate);
};

const ensureTripDaysForDateRange = (days: any, startDate: string, endDate: string) => {
  const dayCount = getInclusiveTripDayCount(startDate, endDate);
  const updatedDays = cloneTripDays(days);

  for (let index = 1; index <= dayCount; index += 1) {
    const dayKey = `day${index}`;
    if (!updatedDays[dayKey]) {
      updatedDays[dayKey] = [];
    }
  }

  return updatedDays;
};

const normalizeTripDetailDays = (detail: any) => ({
  ...detail,
  days: ensureTripDaysForDateRange(detail.days, detail.startDate, detail.endDate),
});

export async function loadInitialTripSnapshot(): Promise<AppTripSnapshot> {
  const tripsList = await loadTripsList();
  const likedSpots = await loadLikedSpots();
  let activeTripId = await loadActiveTripId();
  let travelData: TripDetail | null = null;

  if (tripsList.length === 0) {
    if (activeTripId) {
      await clearActiveTripId();
      activeTripId = '';
    }
  } else {
    const activeTripExists = tripsList.some((trip) => trip.id === activeTripId);
    if (!activeTripExists) {
      activeTripId = tripsList[0].id;
      await saveActiveTripId(activeTripId);
    }

    travelData = await loadTripDetail(activeTripId);

    if (!travelData) {
      travelData = CITY_TEMPLATES.sapporo;
      await saveTripDetail(activeTripId, travelData, { remoteSync: 'immediate' });
    } else {
      travelData = normalizeTripDetailDays(travelData);
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
    cityCode: newTripMeta.cityCode,
    title: newTripMeta.title,
    startDate: newTripMeta.startDate,
    endDate: newTripMeta.endDate,
    memberCount: newTripMeta.memberCount,
    days: buildCityTripDaysForDateRange(
      newTripMeta.cityCode,
      template.days,
      newTripMeta.startDate,
      newTripMeta.endDate,
    ),
    checklist: template.checklist.map((item) => ({ ...item })),
    shoppingList: template.shoppingList.map((item) => ({ ...item })),
  };

  await saveTripDetail(newId, travelData, { remoteSync: 'immediate' });
  await saveActiveTripId(newId);
  await saveTripsList(tripsList, { includeDetails: false });

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

  const detail = await loadTripDetail<any>(updatedMeta.id);
  if (detail) {
    const updatedDetail = {
      ...detail,
      title: updatedMeta.title,
      startDate: updatedMeta.startDate,
      endDate: updatedMeta.endDate,
      memberCount: updatedMeta.memberCount,
      days: ensureTripDaysForDateRange(detail.days, updatedMeta.startDate, updatedMeta.endDate),
    };

    await saveTripDetail(updatedMeta.id, updatedDetail, { remoteSync: 'immediate' });
    await saveTripsList(tripsList, { includeDetails: false });
    return { tripsList, travelData: updatedDetail };
  }

  await saveTripsList(tripsList);
  return { tripsList, travelData: null };
}

export async function deleteTrip(
  currentTrips: TripMetadata[],
  tripId: string,
  activeTripId: string,
) {
  const tripsList = currentTrips.filter((trip) => trip.id !== tripId);
  await deleteTripDetail(tripId);
  await saveTripsList(tripsList, { includeDetails: false });

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

  await saveTripsList(updatedTripsList, { includeDetails: false });
  return updatedTripsList;
}

export async function selectTrip(tripId: string) {
  await saveActiveTripId(tripId);
  const detail = await loadTripDetail(tripId);

  if (!detail) {
    return detail;
  }

  const normalizedDetail = normalizeTripDetailDays(detail);
  await saveTripDetail(tripId, normalizedDetail);
  return normalizedDetail;
}
