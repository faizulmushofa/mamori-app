import type { Coordinates } from './types/haversine.types';

const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates great-circle distance between two coordinates using Haversine formula.
 * @returns Distance in meters.
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

  return EARTH_RADIUS_METERS * c;
}

/**
 * Checks whether coord2 is within radius (default 25m for duplicate detection per PRD F-11).
 */
export function isWithinRadius(
  coord1: Coordinates,
  coord2: Coordinates,
  radiusInMeters: number = 25
): boolean {
  return calculateDistance(coord1, coord2) <= radiusInMeters;
}
