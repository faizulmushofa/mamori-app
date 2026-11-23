import { useState, useEffect, useCallback, useRef } from 'react';
import type * as Location from 'expo-location';
import { getCurrentCoords, requestLocationPermission, watchCoords } from '../lib/actions/location.actions';
import type {
  LocationSubscription,
  LocationTrackingOptions,
  LocationTrackingResult,
} from '../lib/types/location.types';

export { type LocationTrackingOptions, type LocationTrackingResult };

/**
 * Thin React wrapper over lib/actions/location.actions.
 * Adheres to Zero Memory Leak (cleans up watchPosition on unmount).
 */
export function useLocationTracking(
  options: LocationTrackingOptions = {}
): LocationTrackingResult {
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

  return {
    coords,
    errorMsg,
    isLoading,
    permissionGranted,
    refresh: startTracking,
  };
}
