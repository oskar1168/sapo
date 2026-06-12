export interface ActivityItem {
  id: number;
  type: string;
  name: string;
  time: string;
  memo: string;
  cost?: number;
  currency?: string;
  address?: string;
}

export interface ChecklistItem {
  id: number;
  text: string;
  checked: boolean;
}

export interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  qty: number;
  cost: number;
  currency: string;
  memo: string;
  checked: boolean;
}

export interface CityExploreItem {
  emoji: string;
  name: string;
  desc: string;
  filter: string;
}

export interface AffiliateDealItem {
  emoji: string;
  color: string;
  title: string;
  desc: string;
}

export interface GuidebookItem {
  emoji: string;
  title: string;
  content: string;
}

export interface CityTemplate {
  cityCode: string;
  title: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  mapCenter: [number, number];
  mapZoom: number;
  days: {
    [key: string]: ActivityItem[];
  };
  checklist: ChecklistItem[];
  shoppingList: ShoppingItem[];
  explore: {
    welcomeSubtitle: string;
    bannerTitle: string;
    bannerDesc: string;
    cities: CityExploreItem[];
    deals: AffiliateDealItem[];
    guidebook: GuidebookItem[];
  };
}

export interface SpotItem {
  id: string;
  name: string;
  category: string;
  rating: string;
  menu: string;
  tips: string;
  address: string;
  openTime: string;
  closeTime: string;
  thumbnailKey?: string;
  imageKey?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  imageBlurhash?: string;
}
