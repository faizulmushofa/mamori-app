export const BUCKET_REPORT_PHOTOS = 'report-photos';

/** Hard limit per photo. Enforced before any upload attempt. */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/** Supabase TUS requires exactly 6 MB per chunk. Do not change. */
export const TUS_CHUNK_SIZE = 6 * 1024 * 1024;

export const SUPPORTED_PHOTO_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
