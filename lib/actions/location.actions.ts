import * as Location from 'expo-location';
import type {
  LocationPermission,
  LocationSubscription,
  LocationTrackingOptions,
  PermissionResult,
} from '../types/location.types';

const DEFAULTS = {
  distanceInterval: 5,
  timeInterval: 5000,
  accuracy: Location.Accuracy.Balanced,
} as const;

export async function requestLocationPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
  return { status: status as LocationPermission, canAskAgain };
}

export async function getCurrentCoords(
  accuracy: Location.Accuracy = DEFAULTS.accuracy
): Promise<Location.LocationObjectCoords> {
  const position = await Location.getCurrentPositionAsync({ accuracy });
  return position.coords;
}

/**
 * Subscribes to position updates. Caller owns lifecycle: always call remove().
 */
export async function watchCoords(
  options: LocationTrackingOptions,
  onUpdate: (coords: Location.LocationObjectCoords) => void
): Promise<LocationSubscription> {
  const {
    distanceInterval = DEFAULTS.distanceInterval,
    timeInterval = DEFAULTS.timeInterval,
    accuracy = DEFAULTS.accuracy,
  } = options;

  const subscription = await Location.watchPositionAsync(
    { accuracy, distanceInterval, timeInterval },
    (location) => onUpdate(location.coords)
  );

  return subscription;
}
