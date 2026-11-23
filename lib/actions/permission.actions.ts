export type PermissionTarget = 'location' | 'camera';

export type PermissionState = 'undetermined' | 'granted' | 'denied' | 'blocked';

export interface PermissionPromptInfo {
  target: PermissionTarget;
  title: string;
  rationale: string;
  iconName: string;
}

/**
 * Konten penjelasan Just-In-Time (JIT) sebelum meminta izin runtime.
 * Memenuhi spesifikasi PRD F-92 (alasan jelas sebelum prompt sistem muncul).
 */
export const PERMISSION_RATIONALES: Record<PermissionTarget, PermissionPromptInfo> = {
  location: {
    target: 'location',
    title: 'Akses Lokasi Kampus',
    rationale:
      'MAMORI memerlukan izin lokasi untuk menyematkan koordinat GPS otomatis pada laporan dan mendeteksi apakah laporan Anda berada di dekat area rawan bencana.',
    iconName: 'map-pin',
  },
  camera: {
    target: 'camera',
    title: 'Akses Kamera Langsung',
    rationale:
      'Untuk menjaga keaslian bukti fasilitas kampus yang rusak, foto wajib diambil langsung melalui kamera (bukan dari galeri).',
    iconName: 'camera',
  },
};

async function getNativeLocation(): Promise<any | null> {
  try {
    return await import('expo-location');
  } catch {
    return null;
  }
}

async function getNativeCamera(): Promise<any | null> {
  try {
    const mod = await import('expo-camera');
    return mod.Camera ?? mod;
  } catch {
    return null;
  }
}

/** Ambil status izin lokasi saat ini */
export async function checkLocationPermission(): Promise<PermissionState> {
  try {
    const Location = await getNativeLocation();
    if (Location?.getForegroundPermissionsAsync) {
      const res = await Location.getForegroundPermissionsAsync();
      if (res.granted) return 'granted';
      if (!res.canAskAgain) return 'blocked';
      if (res.status === Location.PermissionStatus?.DENIED || res.status === 'denied') return 'denied';
      return 'undetermined';
    }
  } catch {
    // Non-native fallback
  }
  return 'undetermined';
}

/** Minta izin lokasi secara Just-In-Time */
export async function requestLocationPermission(): Promise<PermissionState> {
  try {
    const Location = await getNativeLocation();
    if (Location?.requestForegroundPermissionsAsync) {
      const res = await Location.requestForegroundPermissionsAsync();
      if (res.granted) return 'granted';
      if (!res.canAskAgain) return 'blocked';
      return 'denied';
    }
  } catch {
    // Non-native fallback
  }
  return 'denied';
}

/** Ambil status izin kamera saat ini */
export async function checkCameraPermission(): Promise<PermissionState> {
  try {
    const Camera = await getNativeCamera();
    if (Camera?.getCameraPermissionsAsync) {
      const res = await Camera.getCameraPermissionsAsync();
      if (res.granted) return 'granted';
      if (!res.canAskAgain) return 'blocked';
      if (res.status === 'denied') return 'denied';
      return 'undetermined';
    }
  } catch {
    // Non-native fallback
  }
  return 'undetermined';
}

/** Minta izin kamera secara Just-In-Time */
export async function requestCameraPermission(): Promise<PermissionState> {
  try {
    const Camera = await getNativeCamera();
    if (Camera?.requestCameraPermissionsAsync) {
      const res = await Camera.requestCameraPermissionsAsync();
      if (res.granted) return 'granted';
      if (!res.canAskAgain) return 'blocked';
      return 'denied';
    }
  } catch {
    // Non-native fallback
  }
  return 'denied';
}

/** Helper terpadu untuk memeriksa izin */
export async function checkPermission(target: PermissionTarget): Promise<PermissionState> {
  return target === 'location' ? checkLocationPermission() : checkCameraPermission();
}

/** Helper terpadu untuk meminta izin */
export async function requestPermission(target: PermissionTarget): Promise<PermissionState> {
  return target === 'location' ? requestLocationPermission() : requestCameraPermission();
}
