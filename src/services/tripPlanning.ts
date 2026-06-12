import { ActivityItem, ChecklistItem, ShoppingItem, SpotItem } from '../types/travelData';

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
