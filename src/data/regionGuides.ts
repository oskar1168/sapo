import { REGION_GUIDES } from './region-guides';

export { REGION_GUIDES } from './region-guides';
export type { RegionGuide } from './region-guides';

export function getRegionGuide(cityCode: string, filter: string) {
  return REGION_GUIDES.find((guide) => guide.cityCode === cityCode && guide.filter === filter);
}
