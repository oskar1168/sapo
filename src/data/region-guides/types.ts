import type { ActivityItem } from '../../types/travelData';

export type RegionItineraryItem = Omit<ActivityItem, 'id'>;

export type RegionGuide = {
  cityCode: string;
  filter: string;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: string;
  bestTime: string;
  tags: string[];
  highlights: string[];
  route: string[];
  itineraryItems?: RegionItineraryItem[];
  tips: string[];
  bookingProductIds: string[];
};
