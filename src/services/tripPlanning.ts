import { ActivityItem, ChecklistItem, ShoppingItem, SpotItem } from '../types/travelData';
import type { RegionGuide } from '../data/regionGuides';

export type DayOption = {
  label: string;
  value: string;
};

export type TripStats = {
  totalPlaces: number;
  totalBudgetKRW: number;
  shoppingTotalCostKRW: number;
  nights: string;
};

export type TripWarningLevel = 'info' | 'warning';

export type TripWarning = {
  id: string;
  level: TripWarningLevel;
  title: string;
  message: string;
};

export const getTripDayKeys = (travelData: any) => {
  return Object.keys(travelData.days || {}).sort((a, b) => {
    return parseInt(a.replace('day', '')) - parseInt(b.replace('day', ''));
  });
};

export const getTripDayDateString = (startDate: string, dayIndex: string) => {
  const start = new Date(startDate);
  const dayOffset = parseInt(dayIndex) - 1;
  start.setDate(start.getDate() + dayOffset);
  const mm = String(start.getMonth() + 1).padStart(2, '0');
  const dd = String(start.getDate()).padStart(2, '0');
  const dayName = start.toLocaleDateString('ko-KR', { weekday: 'short' });
  return `${mm}.${dd}(${dayName})`;
};

export const getTripDayOptions = (travelData: any): DayOption[] => {
  return getTripDayKeys(travelData).map((dayKey) => {
    const dayIndex = dayKey.replace('day', '');
    return {
      label: `Day ${dayIndex} (${getTripDayDateString(travelData.startDate, dayIndex)})`,
      value: dayKey,
    };
  });
};

export const calculateTripStats = (travelData: any, exchangeRate: number): TripStats => {
  let totalPlaces = 0;
  let totalBudgetKRW = 0;

  getTripDayKeys(travelData).forEach((dayKey) => {
    const items = travelData.days[dayKey] || [];
    totalPlaces += items.length;
    items.forEach((item: ActivityItem) => {
      if (item.cost) {
        totalBudgetKRW += item.currency === 'JPY'
          ? Math.round(item.cost * exchangeRate)
          : item.cost;
      }
    });
  });

  let shoppingTotalCostKRW = 0;
  (travelData.shoppingList || []).forEach((item: ShoppingItem) => {
    if (item.checked) {
      const itemCost = item.cost * item.qty;
      shoppingTotalCostKRW += item.currency === 'JPY'
        ? Math.round(itemCost * exchangeRate)
        : itemCost;
    }
  });

  const totalDays = getTripDayKeys(travelData).length;

  return {
    totalPlaces,
    totalBudgetKRW,
    shoppingTotalCostKRW,
    nights: totalDays > 1 ? `${totalDays - 1}박 ${totalDays}일` : '당일 일정',
  };
};

const cloneTripDays = (days: Record<string, ActivityItem[]>) => {
  const updatedDays = { ...days };
  Object.keys(updatedDays).forEach((dayKey) => {
    updatedDays[dayKey] = [...(updatedDays[dayKey] || [])];
  });
  return updatedDays;
};

const normalizePlaceName = (name: string) => name.trim().toLowerCase();

const timeToMinutes = (time?: string) => {
  if (!time) return null;
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
  const normalizedMinutes = Math.max(0, Math.min(minutes, 23 * 60 + 59));
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const hasValidTime = (time?: string) => Boolean(time && /^(\d{1,2}):(\d{2})$/.test(time));

const getCityDistanceThresholdKm = (cityCode?: string) => {
  if (cityCode === 'sapporo' || cityCode === 'okinawa') return 25;
  if (cityCode === 'fukuoka') return 6;
  return 8;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const getDistanceKm = (from: ActivityItem, to: ActivityItem) => {
  if (
    typeof from.latitude !== 'number' ||
    typeof from.longitude !== 'number' ||
    typeof to.latitude !== 'number' ||
    typeof to.longitude !== 'number'
  ) {
    return null;
  }

  const earthRadiusKm = 6371;
  const latDelta = toRadians(to.latitude - from.latitude);
  const lonDelta = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getSortedItemsForRouteCheck = (items: ActivityItem[]) => {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftMinutes = timeToMinutes(left.item.time);
      const rightMinutes = timeToMinutes(right.item.time);
      if (leftMinutes === null && rightMinutes === null) return left.index - right.index;
      if (leftMinutes === null) return 1;
      if (rightMinutes === null) return -1;
      return leftMinutes - rightMinutes;
    })
    .map(({ item }) => item);
};

const AIRPORT_KEYWORDS = [
  '공항',
  'airport',
  '신치토세',
  '하네다',
  '나리타',
  '간사이',
  '이타미',
  '후쿠오카공항',
  '나하',
  '센트레아',
  '중부국제',
  'new chitose',
  'haneda',
  'narita',
  'kansai',
  'itami',
  'fukuoka airport',
  'naha airport',
  'centrair',
];

const includesAirportKeyword = (item: ActivityItem) => {
  const text = [item.name, item.address, item.memo].filter(Boolean).join(' ').toLowerCase();
  return AIRPORT_KEYWORDS.some((keyword) => text.includes(keyword.toLowerCase()));
};

export const getTripWarningsForDay = (travelData: any, dayKey: string): TripWarning[] => {
  const warnings: TripWarning[] = [];
  const dayItems = (travelData.days?.[dayKey] || []) as ActivityItem[];
  const timeGroups = new Map<string, ActivityItem[]>();

  dayItems.forEach((item) => {
    if (!hasValidTime(item.time)) return;
    const currentItems = timeGroups.get(item.time) || [];
    timeGroups.set(item.time, [...currentItems, item]);
  });

  timeGroups.forEach((items, time) => {
    if (items.length < 2) return;
    warnings.push({
      id: `time-${dayKey}-${time}`,
      level: 'warning',
      title: `${time}에 일정이 겹쳐 있어요`,
      message: `${items.map((item) => item.name).join(', ')} 일정이 같은 시간대에 들어가 있습니다.`,
    });
  });

  const distanceThresholdKm = getCityDistanceThresholdKm(travelData.cityCode);
  const sortedItems = getSortedItemsForRouteCheck(dayItems);
  sortedItems.forEach((item, index) => {
    if (index === 0) return;
    const previousItem = sortedItems[index - 1];
    const distanceKm = getDistanceKm(previousItem, item);
    if (distanceKm === null || distanceKm < distanceThresholdKm) return;

    warnings.push({
      id: `distance-${dayKey}-${previousItem.id}-${item.id}`,
      level: 'info',
      title: '이동 거리가 길 수 있어요',
      message: `${previousItem.name} → ${item.name} 직선거리가 약 ${distanceKm.toFixed(1)}km입니다. 이동 동선을 확인해 보세요.`,
    });
  });

  const dayKeys = getTripDayKeys(travelData);
  const isLastDay = dayKey === dayKeys[dayKeys.length - 1];
  if (isLastDay && dayItems.length > 0 && !dayItems.some(includesAirportKeyword)) {
    warnings.push({
      id: `airport-${dayKey}`,
      level: 'warning',
      title: '마지막 날 공항 이동 일정이 없어요',
      message: '출국일에는 공항 이동이나 공항 도착 일정을 하나 넣어두면 더 안전합니다.',
    });
  }

  return warnings;
};

const getLastScheduledMinutes = (items: ActivityItem[]) => {
  return items.reduce<number | null>((latest, item) => {
    const minutes = timeToMinutes(item.time);
    if (minutes === null) return latest;
    return latest === null ? minutes : Math.max(latest, minutes);
  }, null);
};

const getRegionItineraryItems = (guide: RegionGuide): Omit<ActivityItem, 'id'>[] => {
  if (guide.itineraryItems?.length) {
    return guide.itineraryItems;
  }

  return guide.route.map((step, index) => ({
    type: 'sightseeing',
    name: step,
    time: minutesToTime(10 * 60 + index * 90),
    memo: `${guide.title} 추천 동선`,
  }));
};

export const appendRegionGuideRouteToDay = (travelData: any, guide: RegionGuide, targetDay: string) => {
  const updatedDays = cloneTripDays(travelData.days || {});
  const currentItems = updatedDays[targetDay] || [];
  const existingNames = new Set(currentItems.map((item) => normalizePlaceName(item.name)));
  const sourceItems = getRegionItineraryItems(guide);
  const uniqueItems = sourceItems.filter((item) => !existingNames.has(normalizePlaceName(item.name)));
  const lastScheduledMinutes = getLastScheduledMinutes(currentItems);
  const shouldReflowAfterExisting = currentItems.length > 0;
  const firstMinutes = shouldReflowAfterExisting
    ? Math.min((lastScheduledMinutes ?? 10 * 60) + 90, 21 * 60)
    : null;
  const baseId = Date.now();

  const newItems = uniqueItems.map<ActivityItem>((item, index) => ({
    id: baseId + index,
    ...item,
    time: shouldReflowAfterExisting
      ? minutesToTime((firstMinutes ?? 10 * 60) + index * 90)
      : item.time || minutesToTime(10 * 60 + index * 90),
    memo: item.memo || `${guide.title} 추천 동선`,
  }));

  updatedDays[targetDay] = [...currentItems, ...newItems];

  return {
    updatedData: { ...travelData, days: updatedDays },
    addedCount: newItems.length,
    skippedCount: sourceItems.length - uniqueItems.length,
  };
};

export const upsertActivityItem = (
  travelData: any,
  place: Omit<ActivityItem, 'id'> & { id?: number },
  targetDay: string,
  fallbackDay: string,
) => {
  const dayKey = targetDay || fallbackDay;
  const updatedDays = cloneTripDays(travelData.days || {});

  if (!updatedDays[dayKey]) {
    updatedDays[dayKey] = [];
  }

  if (place.id) {
    let foundDayKey = fallbackDay;
    let foundIdx = -1;

    for (const currentDayKey of Object.keys(updatedDays)) {
      const idx = updatedDays[currentDayKey].findIndex((item) => item.id === place.id);
      if (idx > -1) {
        foundDayKey = currentDayKey;
        foundIdx = idx;
        break;
      }
    }

    if (foundIdx > -1) {
      const itemToUpdate = { ...updatedDays[foundDayKey][foundIdx], ...place } as ActivityItem;
      if (foundDayKey === dayKey) {
        updatedDays[dayKey][foundIdx] = itemToUpdate;
      } else {
        updatedDays[foundDayKey].splice(foundIdx, 1);
        updatedDays[dayKey].push(itemToUpdate);
      }
    }
  } else {
    updatedDays[dayKey].push({ id: Date.now(), ...place } as ActivityItem);
  }

  return {
    updatedData: { ...travelData, days: updatedDays },
    activeDay: dayKey,
  };
};

export const deleteActivityItem = (travelData: any, dayKey: string, itemId: number) => {
  const updatedDays = cloneTripDays(travelData.days || {});
  updatedDays[dayKey] = (updatedDays[dayKey] || []).filter((item) => item.id !== itemId);
  return { ...travelData, days: updatedDays };
};

export const createRecommendedSpotPlaceData = (spot: SpotItem) => {
  return {
    name: spot.name,
    category: spot.category,
    address: spot.address,
    latitude: spot.latitude,
    longitude: spot.longitude,
    googleMapsUrl: spot.googleMapsUrl,
    menu: spot.menu,
    tips: spot.tips,
  };
};

export const upsertShoppingItem = (
  travelData: any,
  item: Omit<ShoppingItem, 'id'> & { id?: number },
) => {
  const updatedList = [...(travelData.shoppingList || [])];

  if (item.id) {
    const idx = updatedList.findIndex((shoppingItem) => shoppingItem.id === item.id);
    if (idx > -1) {
      updatedList[idx] = { ...updatedList[idx], ...item };
    }
  } else {
    updatedList.push({ id: Date.now(), ...item });
  }

  return { ...travelData, shoppingList: updatedList };
};

export const toggleShoppingItemChecked = (travelData: any, itemId: number) => {
  const updatedList = (travelData.shoppingList || []).map((item: ShoppingItem) => {
    if (item.id === itemId) {
      return { ...item, checked: !item.checked };
    }
    return item;
  });
  return { ...travelData, shoppingList: updatedList };
};

export const deleteShoppingItem = (travelData: any, itemId: number) => {
  const updatedList = (travelData.shoppingList || []).filter((item: ShoppingItem) => item.id !== itemId);
  return { ...travelData, shoppingList: updatedList };
};

export const addChecklistItem = (travelData: any, text: string) => {
  const newItem: ChecklistItem = {
    id: Date.now(),
    text: text.trim(),
    checked: false,
  };
  return {
    ...travelData,
    checklist: [...(travelData.checklist || []), newItem],
  };
};

export const toggleChecklistItem = (travelData: any, itemId: number) => {
  const updatedChecklist = (travelData.checklist || []).map((item: ChecklistItem) => {
    if (item.id === itemId) {
      return { ...item, checked: !item.checked };
    }
    return item;
  });
  return { ...travelData, checklist: updatedChecklist };
};
