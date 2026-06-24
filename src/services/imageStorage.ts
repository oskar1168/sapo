import { DEFAULT_SPOT_IMAGE, DEFAULT_SPOT_THUMBNAIL, SPOT_CATEGORY_THUMBNAILS } from '../constants/images';
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

type SpotImageSourceOptions = {
  preferSpotImage?: boolean;
};

export function getSpotCategoryThumbnailSource(spot: SpotItem) {
  if (spot.contentSources?.length) {
    return SPOT_CATEGORY_THUMBNAILS.content;
  }

  if (['meat', 'seafood', 'noodle'].includes(spot.category)) {
    return SPOT_CATEGORY_THUMBNAILS.food;
  }

  if (['dessert', 'cafe'].includes(spot.category)) {
    return SPOT_CATEGORY_THUMBNAILS.cafe;
  }

  return SPOT_CATEGORY_THUMBNAILS[spot.category] || DEFAULT_SPOT_THUMBNAIL;
}

export function getSpotThumbnailSource(spot: SpotItem, options: SpotImageSourceOptions = {}) {
  if (options.preferSpotImage && spot.thumbnailUrl) {
    return spot.thumbnailUrl;
  }

  return getSpotCategoryThumbnailSource(spot);
}

export function getSpotImageSource(spot: SpotItem) {
  return spot.imageUrl || spot.thumbnailUrl || DEFAULT_SPOT_IMAGE;
}

function getCityFromSpotId(spotId: string) {
  return spotId.split('-')[0] || 'sapporo';
}
