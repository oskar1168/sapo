export type CityCode = 'sapporo' | 'otaru' | 'tokyo' | 'osaka' | 'fukuoka' | 'okinawa' | 'nagoya';

export interface SpotRef {
  city: string;
  spotId?: string;
  originalIndex: number;
}
