import { sapporoItineraryPreset } from './sapporo';
import { tokyoItineraryPreset } from './tokyo';
import { osakaItineraryPreset } from './osaka';
import { fukuokaItineraryPreset } from './fukuoka';
import { okinawaItineraryPreset } from './okinawa';
import { nagoyaItineraryPreset } from './nagoya';
import { CityPreset } from './types';

export type { CityPreset, PresetActivity } from './types';

export const itineraryPresets: Record<string, CityPreset> = {
  sapporo: sapporoItineraryPreset,
  tokyo: tokyoItineraryPreset,
  osaka: osakaItineraryPreset,
  fukuoka: fukuokaItineraryPreset,
  okinawa: okinawaItineraryPreset,
  nagoya: nagoyaItineraryPreset,
};
