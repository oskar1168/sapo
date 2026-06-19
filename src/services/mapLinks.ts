type MapLinkTarget = {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
};

export function getGoogleMapsUrl(target: MapLinkTarget) {
  if (target.googleMapsUrl) {
    return target.googleMapsUrl;
  }

  if (typeof target.latitude === 'number' && typeof target.longitude === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${target.latitude},${target.longitude}`;
  }

  const query = encodeURIComponent(target.address || target.name);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
