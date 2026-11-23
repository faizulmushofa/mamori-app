/**
 * Validasi dan sanitasi key untuk expo-secure-store.
 * Batasan native: karakter yang diizinkan hanya alfanumerik, '.', '-', dan '_'.
 */
export function sanitizeSecureKey(key: string): string {
  if (!key) {
    throw new Error('Secure key cannot be empty');
  }
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/** In-memory fallback untuk lingkungan pengujian (Node.js) atau Web jika native SecureStore tidak tersedia */
export const memoryStore = new Map<string, string>();

async function getNativeSecureStore(): Promise<any | null> {
  try {
    return await import('expo-secure-store');
  } catch {
    return null;
  }
}

/** Cek ketersediaan native SecureStore */
export async function isSecureStoreAvailable(): Promise<boolean> {
  try {
    const mod = await getNativeSecureStore();
    if (mod && typeof mod.isAvailableAsync === 'function') {
      return await mod.isAvailableAsync();
    }
  } catch {
    // Non-native fallback
  }
  return false;
}

/** Simpan nilai terenkripsi */
export async function setSecureItem(key: string, value: string): Promise<void> {
  const safeKey = sanitizeSecureKey(key);
  try {
    const mod = await getNativeSecureStore();
    if (mod && (await isSecureStoreAvailable())) {
      await mod.setItemAsync(safeKey, value, {
        keychainAccessible: mod.AFTER_FIRST_UNLOCK,
      });
      return;
    }
  } catch {
    // Fallback ke memory store bila native module tidak ada
  }
  memoryStore.set(safeKey, value);
}

/** Ambil nilai terenkripsi */
export async function getSecureItem(key: string): Promise<string | null> {
  const safeKey = sanitizeSecureKey(key);
  try {
    const mod = await getNativeSecureStore();
    if (mod && (await isSecureStoreAvailable())) {
      return await mod.getItemAsync(safeKey);
    }
  } catch {
    // Fallback
  }
  return memoryStore.get(safeKey) ?? null;
}

/** Hapus nilai terenkripsi */
export async function deleteSecureItem(key: string): Promise<void> {
  const safeKey = sanitizeSecureKey(key);
  try {
    const mod = await getNativeSecureStore();
    if (mod && (await isSecureStoreAvailable())) {
      await mod.deleteItemAsync(safeKey);
      return;
    }
  } catch {
    // Fallback
  }
  memoryStore.delete(safeKey);
}

/**
 * Adapter penyimpanan sesi Supabase Auth berbasis hardware-backed SecureStore.
 * Memenuhi spesifikasi PRD F-91 (menggantikan plaintext AsyncStorage).
 */
export const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    return await getSecureItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await setSecureItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await deleteSecureItem(key);
  },
};

/** Kunci-kunci standar MAMORI */
export const SECURE_KEYS = {
  AUTH_SESSION: 'mamori.auth.session',
  USER_CREDENTIALS: 'mamori.user.credentials',
  OFFLINE_ENCRYPTION_KEY: 'mamori.offline.key',
} as const;
