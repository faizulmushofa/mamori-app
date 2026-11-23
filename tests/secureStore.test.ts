import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeSecureKey,
  setSecureItem,
  getSecureItem,
  deleteSecureItem,
  secureStoreAdapter,
  SECURE_KEYS,
} from '../lib/actions/secureStore.actions.ts';

describe('Sanitasi & Validasi Kunci SecureStore', () => {
  it('mengizinkan alfanumerik, titik, strip, dan garis bawah', () => {
    const valid = 'auth.session-token_123';
    assert.equal(sanitizeSecureKey(valid), valid);
  });

  it('mengganti karakter terlarang (@, :, spasi, slash) dengan underscore', () => {
    const raw = 'auth:session@token/user 1';
    const sanitized = sanitizeSecureKey(raw);
    assert.equal(sanitized, 'auth_session_token_user_1');
  });

  it('menolak string kosong', () => {
    assert.throws(() => sanitizeSecureKey(''), /cannot be empty/i);
  });
});

describe('Operasi Simpan & Baca Terenkripsi (SecureStore)', () => {
  it('menyimpan dan membaca kembali string sensitif', async () => {
    const key = SECURE_KEYS.AUTH_SESSION;
    const value = 'jwt.mock.token.payload.signature';

    await setSecureItem(key, value);
    const retrieved = await getSecureItem(key);
    assert.equal(retrieved, value);
  });

  it('menghapus item dan mengembalikan null saat dibaca ulang', async () => {
    const key = 'temporary_token';
    await setSecureItem(key, 'secret_123');
    await deleteSecureItem(key);

    const result = await getSecureItem(key);
    assert.equal(result, null);
  });

  it('kompatibel dengan antarmuka Supabase Auth Storage adapter', async () => {
    const sbKey = 'sb-auth-token';
    const sessionJson = JSON.stringify({ access_token: 'abc', refresh_token: 'xyz' });

    await secureStoreAdapter.setItem(sbKey, sessionJson);
    const stored = await secureStoreAdapter.getItem(sbKey);
    assert.equal(stored, sessionJson);

    await secureStoreAdapter.removeItem(sbKey);
    const deleted = await secureStoreAdapter.getItem(sbKey);
    assert.equal(deleted, null);
  });
});
