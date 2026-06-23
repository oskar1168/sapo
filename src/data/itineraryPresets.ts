import { ActivityItem } from '../types/travelData';
import { itineraryPresets } from './itinerary-presets';

export function buildPresetTripDays(cityCode: string, dayCount: number) {
  const preset = itineraryPresets[cityCode] || [];
  const finalDayActivities = preset[preset.length - 1] || [];
  const regularDays = preset.slice(0, -1);

  return Array.from({ length: dayCount }).reduce<Record<string, ActivityItem[]>>((days, _, index) => {
    const dayKey = `day${index + 1}`;
    const isFinalTripDay = index === dayCount - 1;
    const activities = isFinalTripDay ? finalDayActivities : regularDays[index] || [];
    days[dayKey] = activities.map((activity, activityIndex) => ({
      id: (index + 1) * 100 + activityIndex + 1,
      ...activity,
    }));
    return days;
  }, {});
}

export function hasItineraryPreset(cityCode: string) {
  return Boolean(itineraryPresets[cityCode]);
}
