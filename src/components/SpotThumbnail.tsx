import { Image, ImageStyle } from 'expo-image';
import { StyleProp } from 'react-native';

import { getSpotThumbnailSource } from '../services/imageStorage';
import { SpotItem } from '../types/travelData';

interface SpotThumbnailProps {
  spot: SpotItem;
  style: StyleProp<ImageStyle>;
  preferSpotImage?: boolean;
}

export default function SpotThumbnail({ spot, style, preferSpotImage = false }: SpotThumbnailProps) {
  return (
    <Image
      source={getSpotThumbnailSource(spot, { preferSpotImage })}
      style={style}
      cachePolicy="memory-disk"
      contentFit="cover"
      transition={120}
      accessibilityLabel={spot.name}
    />
  );
}
