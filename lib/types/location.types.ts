import type * as Location from 'expo-location';

export interface LocationTrackingOptions {
  /** Distance in meters before firing an update. Default: 5m */
  distanceInterval?: number;
  /** Minimum time interval between updates in ms. Default: 5000ms */
  timeInterval?: number;
  /** Accuracy tier */
  accuracy?: Location.Accuracy;
}

export type LocationPermission = 'granted' | 'denied' | 'undetermined';

export interface PermissionResult {
  status: LocationPermission;
  canAskAgain: boolean;
}

/** Minimal handle returned by watchCoords; call remove() to stop updates. */
export interface LocationSubscription {
  remove: () => void;
}

export interface LocationTrackingResult {
  coords: Location.LocationObjectCoords | null;
  errorMsg: string | null;
  isLoading: boolean;
  permissionGranted: boolean;
  refresh: () => Promise<void>;
}
