import type { Coordinates } from '../types/geo.types';

const EARTH_RADIUS_METERS = 6371000;

/**
 * Menghitung jarak lurus dua koordinat (meter) menggunakan rumus Haversine.
 * Memenuhi PRD F-11 & Pertemuan 9.
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const toRad = (value: number): number => (value * Math.PI) / 180;

  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_METERS * c);
}

/** Alias untuk calculateDistance */
export const calculateHaversineDistance = calculateDistance;

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
 * Memeriksa apakah dua koordinat berada dalam radius tertentu (default 25 m untuk deteksi duplikat per PRD F-11).
 */
export function isWithinRadius(
  coord1: Coordinates,
  coord2: Coordinates,
  radiusInMeters: number = 25
): boolean {
  return calculateDistance(coord1, coord2) <= radiusInMeters;
}

/** Alias untuk isWithinRadius */
export const isDuplicateCandidate = isWithinRadius;
