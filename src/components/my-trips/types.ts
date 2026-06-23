import { TripScheduleMode } from '../../types/trip';

export type TripFormValues = {
  title: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  scheduleMode: TripScheduleMode;
};

export const emptyTripForm: TripFormValues = {
  title: '',
  startDate: '',
  endDate: '',
  memberCount: 2,
  scheduleMode: 'recommended',
};
