import {
  MAX_PHOTO_BYTES,
  SUPPORTED_PHOTO_MIME,
  TUS_CHUNK_SIZE,
} from '../constants/storage.ts';
import type { PhotoValidation } from '../types/storage.types';

const SAFE_SEGMENT = /^[A-Za-z0-9-]{8,64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function extForMime(mimeType: string): string {
  const ext = SUPPORTED_PHOTO_MIME[mimeType];
  if (!ext) throw new Error(`Tipe foto tidak didukung: ${mimeType}`);
  return ext;
}

export function validatePhotoSize(bytes: number): PhotoValidation {
  if (!Number.isInteger(bytes) || bytes <= 0) {
    return { ok: false, reason: 'Ukuran foto tidak valid' };
  }
  if (bytes > MAX_PHOTO_BYTES) {
    return { ok: false, reason: 'Ukuran foto melebihi 10 MB' };
  }
  return { ok: true, reason: null };
}

/** Storage object path. Rejects traversal and anything that is not a UUID segment. */
export function buildObjectPath(userId: string, photoId: string, mimeType: string): string {
  if (!SAFE_SEGMENT.test(userId)) throw new Error('userId tidak valid');
  if (!UUID.test(photoId)) throw new Error('photoId harus UUID');
  return `${userId}/${photoId}.${extForMime(mimeType)}`;
}

/** 10 MB photo => 2 chunks; the 6 MB chunk size is fixed by Supabase. */
export function estimateChunks(bytes: number): number {
  if (bytes <= 0) return 0;
  return Math.ceil(bytes / TUS_CHUNK_SIZE);
}

/** Direct storage hostname; Supabase-specific, so an unknown host is an error, not a guess. */
export function buildTusEndpoint(supabaseUrl: string): string {
  const url = new URL(supabaseUrl);
  if (!url.hostname.endsWith('.supabase.co')) {
    throw new Error(`Host Supabase tidak dikenali: ${url.hostname}`);
  }
  const storageHost = url.hostname.replace('.supabase.co', '.storage.supabase.co');
  return `${url.protocol}//${storageHost}/storage/v1/upload/resumable`;
}

export function buildPublicUrl(supabaseUrl: string, bucket: string, objectPath: string): string {
  return `${new URL(supabaseUrl).origin}/storage/v1/object/public/${bucket}/${objectPath}`;
}
