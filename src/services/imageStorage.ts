import { DEFAULT_SPOT_IMAGE, DEFAULT_SPOT_THUMBNAIL } from '../constants/images';
import { SpotItem } from '../types/travelData';

export type SpotImageKind = 'thumb' | 'main';

const SPOT_IMAGE_BASE_PATH = 'spots';

export function getSpotImagePath(city: string, spotId: string, kind: SpotImageKind) {
  const fileName = kind === 'thumb' ? 'thumb.webp' : 'main.webp';
  return `${SPOT_IMAGE_BASE_PATH}/${city}/${spotId}/${fileName}`;
}

export function getSpotThumbnailKey(spot: SpotItem, city?: string) {
  return spot.thumbnailKey || getSpotImagePath(city || getCityFromSpotId(spot.id), spot.id, 'thumb');
}

export function getSpotImageKey(spot: SpotItem, city?: string) {
  return spot.imageKey || getSpotImagePath(city || getCityFromSpotId(spot.id), spot.id, 'main');
}

export function getSpotThumbnailSource(spot: SpotItem) {
  return spot.thumbnailUrl || DEFAULT_SPOT_THUMBNAIL;
}

export function getSpotImageSource(spot: SpotItem) {
  return spot.imageUrl || spot.thumbnailUrl || DEFAULT_SPOT_IMAGE;
}

function getCityFromSpotId(spotId: string) {
  return spotId.split('-')[0] || 'sapporo';
}
