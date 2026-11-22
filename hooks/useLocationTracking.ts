import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import type { LocationTrackingOptions, UseLocationTrackingResult } from './types/useLocationTracking.types';

export { type LocationTrackingOptions, type UseLocationTrackingResult };

/**
 * Custom hook for Location-Based Services (LBS) with adaptive distanceInterval.
 * Adheres to Zero Memory Leak (cleans up watchPosition on unmount).
 */
export function useLocationTracking(
  options: LocationTrackingOptions = {}
): UseLocationTrackingResult {
  const {
    distanceInterval = 5,
    timeInterval = 5000,
    accuracy = Location.Accuracy.Balanced,
  } = options;

  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const startTracking = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setErrorMsg('Izin akses lokasi ditolak');
        setPermissionGranted(false);
        setIsLoading(false);
        return;
      }

      setPermissionGranted(true);

      const initialPos = await Location.getCurrentPositionAsync({ accuracy });
      setCoords(initialPos.coords);
      setIsLoading(false);

      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy,
          distanceInterval,
          timeInterval,
        },
        (newLocation) => {
          setCoords(newLocation.coords);
        }
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengakses GPS');
      setIsLoading(false);
    }
  }, [accuracy, distanceInterval, timeInterval]);

  useEffect(() => {
    startTracking();

    return () => {
      // ponytail: zero memory leak cleanup on unmount
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
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
