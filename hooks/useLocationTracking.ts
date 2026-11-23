import { useState, useEffect, useCallback, useRef } from 'react';
import type * as Location from 'expo-location';
import { getCurrentCoords, requestLocationPermission, watchCoords } from '../lib/actions/location.actions';
import {
  calculateDistance,
  calculateHaversineDistance,
  formatDistance,
  isWithinRadius,
  isDuplicateCandidate,
} from '../lib/actions/geo.actions';
import type { Coordinates } from '../lib/types/geo.types';
import type {
  LocationSubscription,
  LocationTrackingOptions,
  LocationTrackingResult,
} from '../lib/types/location.types';

export {
  calculateDistance,
  calculateHaversineDistance,
  formatDistance,
  isWithinRadius,
  isDuplicateCandidate,
};

export interface ExtendedLocationTrackingResult extends LocationTrackingResult {
  /** Hitung jarak dari posisi user saat ini ke koordinat target (meter) */
  getDistanceTo: (target: Coordinates) => number | null;
  /** Format jarak dari posisi user saat ini ke koordinat target (contoh: "25 m", "1.2 km") */
  formatDistanceTo: (target: Coordinates) => string;
}

export { type LocationTrackingOptions, type LocationTrackingResult };

/**
 * React Hook utama untuk melacak lokasi dan kalkulasi jarak spasial Haversine di frontend.
 * Memenuhi spesifikasi Pertemuan 9 & PRD F-02, F-11.
 * Mencegah kebocoran memori (Zero Memory Leak) dengan pembersihan listener otomatis saat unmount.
 */
export function useLocationTracking(
  options: LocationTrackingOptions = {}
): ExtendedLocationTrackingResult {
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  const subscriptionRef = useRef<LocationSubscription | null>(null);
  const { distanceInterval, timeInterval, accuracy } = options;

  const startTracking = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const permission = await requestLocationPermission();
      if (permission.status !== 'granted') {
        setErrorMsg('Izin akses lokasi ditolak');
        setPermissionGranted(false);
        setIsLoading(false);
        return;
      }

      setPermissionGranted(true);
      setCoords(await getCurrentCoords(accuracy));
      setIsLoading(false);

      subscriptionRef.current?.remove();
      subscriptionRef.current = await watchCoords(
        { distanceInterval, timeInterval, accuracy },
        setCoords
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengakses GPS');
      setIsLoading(false);
    }
  }, [accuracy, distanceInterval, timeInterval]);

  useEffect(() => {
    startTracking();

    return () => {
      // zero memory leak cleanup on unmount
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [startTracking]);

  const getDistanceTo = useCallback(
    (target: Coordinates): number | null => {
      if (!coords) return null;
      return calculateDistance(
        { latitude: coords.latitude, longitude: coords.longitude },
        target
      );
    },
    [coords]
  );

  const formatDistanceTo = useCallback(
    (target: Coordinates): string => {
      const dist = getDistanceTo(target);
      return formatDistance(dist);
    },
    [getDistanceTo]
  );

  return {
    coords,
    errorMsg,
    isLoading,
    permissionGranted,
    refresh: startTracking,
    getDistanceTo,
    formatDistanceTo,
  };
}
