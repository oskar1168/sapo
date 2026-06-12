export type CityCode = 'sapporo' | 'otaru' | 'tokyo' | 'osaka';

export interface SpotRef {
  city: string;
  spotId?: string;
  originalIndex: number;
}
