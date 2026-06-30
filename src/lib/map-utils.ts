export const TEHRAN_CENTER = {
  latitude: 35.6892,
  longitude: 51.389,
  zoom: 11,
} as const;

export const TEHRAN_BOUNDS = {
  minLat: 35.48,
  maxLat: 36.05,
  minLng: 51.05,
  maxLng: 51.65,
} as const;

export function isTehranArea(latitude: number, longitude: number): boolean {
  return (
    latitude >= TEHRAN_BOUNDS.minLat &&
    latitude <= TEHRAN_BOUNDS.maxLat &&
    longitude >= TEHRAN_BOUNDS.minLng &&
    longitude <= TEHRAN_BOUNDS.maxLng
  );
}

export function normalizeIranCoordinates(
  latitude: number,
  longitude: number
): { latitude: number; longitude: number } {
  const inIranLat = (v: number) => v >= 24 && v <= 40;
  const inIranLng = (v: number) => v >= 44 && v <= 64;

  if (inIranLat(latitude) && inIranLng(longitude)) {
    return { latitude, longitude };
  }

  if (inIranLat(longitude) && inIranLng(latitude)) {
    return { latitude: longitude, longitude: latitude };
  }

  return { latitude, longitude };
}

export const MAP_CAMERA_PADDING = {
  top: 140,
  bottom: 180,
  left: 48,
  right: 48,
} as const;

/** Viewport bbox [west, south, east, north] for supercluster from center + zoom. */
export function bboxFromViewState(
  longitude: number,
  latitude: number,
  zoom: number,
  widthPx = 480,
  heightPx = 720
): [number, number, number, number] {
  const scale = 360 / (256 * Math.pow(2, zoom));
  const lngSpan = (widthPx * scale) / 2;
  const latSpan =
    (heightPx * scale) / (2 * Math.cos((latitude * Math.PI) / 180));
  return [
    longitude - lngSpan,
    latitude - latSpan,
    longitude + lngSpan,
    latitude + latSpan,
  ];
}
