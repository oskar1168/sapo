import { ActivityItem } from '../../types/travelData';

export type PresetActivity = Omit<ActivityItem, 'id'>;
export type CityPreset = PresetActivity[][];
