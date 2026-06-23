import { sapporoRegionGuides } from './sapporo';
import { tokyoRegionGuides } from './tokyo';
import { osakaRegionGuides } from './osaka';
import { fukuokaRegionGuides } from './fukuoka';
import { okinawaRegionGuides } from './okinawa';
import { nagoyaRegionGuides } from './nagoya';

export type { RegionGuide } from './types';

export const REGION_GUIDES = [
  ...sapporoRegionGuides,
  ...tokyoRegionGuides,
  ...osakaRegionGuides,
  ...fukuokaRegionGuides,
  ...okinawaRegionGuides,
  ...nagoyaRegionGuides,
];
