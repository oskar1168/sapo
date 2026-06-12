import { Image, ImageStyle } from 'expo-image';
import { StyleProp } from 'react-native';

import { getSpotThumbnailSource } from '../services/imageStorage';
import { SpotItem } from '../types/travelData';

interface SpotThumbnailProps {
  spot: SpotItem;
  style: StyleProp<ImageStyle>;
}

export default function SpotThumbnail({ spot, style }: SpotThumbnailProps) {
  return (
    <Image
      source={getSpotThumbnailSource(spot)}
      style={style}
      cachePolicy="memory-disk"
      contentFit="cover"
      transition={120}
      accessibilityLabel={spot.name}
    />
  );
}
