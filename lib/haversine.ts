/**
 * Komputasi Spasial Haversine Formula (Sisi Klien)
 * Memenuhi PRD F-11 & Pertemuan 9: Menghitung jarak lurus dua koordinat (meter)
 * dan mendeteksi kandidat duplikat dalam radius 25 meter.
 */

const EARTH_RADIUS_METERS = 6371000;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Menghitung jarak lurus antara dua titik koordinat menggunakan rumus Haversine.
 * Hasil dalam satuan meter (integer dibulatkan).
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_METERS * c;
  return Math.round(distance);
}

/**
 * Memformat jarak dalam meter menjadi string yang ramah pengguna.
 * Contoh: 18 -> "18 m", 1250 -> "1.3 km"
 */
export function formatDistance(distanceInMeters: number | null | undefined): string {
  if (distanceInMeters == null || isNaN(distanceInMeters)) {
    return '-';
  }
  if (distanceInMeters < 1000) {
    return `${distanceInMeters} m`;
  }
  return `${(distanceInMeters / 1000).toFixed(1)} km`;
}

/**
 * Menentukan apakah dua koordinat berada dalam ambang batas duplikat (default: 25 m).
 */
export function isDuplicateCandidate(
  coord1: Coordinates,
  coord2: Coordinates,
  thresholdMeters = 25
): boolean {
  const distance = calculateHaversineDistance(coord1, coord2);
  return distance <= thresholdMeters;
}
