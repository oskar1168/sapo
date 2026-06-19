export type TripScheduleMode = 'recommended' | 'blank';

export interface TripMetadata {
  id: string;
  cityCode: string;
  title: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  scheduleMode?: TripScheduleMode;
}

export type TripDetail = any;
