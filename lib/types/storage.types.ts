import type { Coordinates } from './geo.types';

export type ReportCategory =
  | 'fasilitas'
  | 'kebersihan'
  | 'drainase'
  | 'pohon'
  | 'listrik'
  | 'risiko-bencana'
  | 'lainnya';

export type Severity = 'rendah' | 'sedang' | 'tinggi';

export interface DraftPhoto {
  /** Random UUID used as the storage object name. Never the original filename. */
  id: string;
  /** Local file name inside the drafts sandbox. */
  fileName: string;
  mimeType: string;
  bytes: number;
}

export type UploadProvider = 'tus' | 'single';

export type UploadStatus = 'pending' | 'uploading' | 'paused' | 'failed' | 'done';

export interface DraftUpload {
  provider: UploadProvider;
  status: UploadStatus;
  /** `<user_id>/<photo_id>.<ext>` */
  objectPath: string;
  /** TUS upload URL; valid ~24h. Needed to resume across app restarts. */
  uploadUrl: string | null;
  bytesUploaded: number;
  totalBytes: number;
  updatedAt: string;
  error: string | null;
}

export interface ReportDraft {
  id: string;
  reportId: string;
  createdAt: string;
  updatedAt: string;
  coords: Coordinates;
  capturedAt: string;
  category: ReportCategory;
  description: string;
  severity: Severity;
  blocksEvacuation: boolean;
  photo: DraftPhoto;
  upload: DraftUpload;
}

export type UploadEvent =
  | { type: 'start' }
  | { type: 'progress'; bytesUploaded: number }
  | { type: 'pause' }
  | { type: 'success' }
  | { type: 'expire' }
  | { type: 'failure'; error: string };

export type FailureAction = 'auth-error' | 'retry' | 'restart' | 'fallback' | 'failed';

export interface FailureContext {
  /** HTTP status from TUS/XHR, undefined for network errors. */
  httpStatus?: number;
  /** Retries left inside the current attempt. */
  attemptsLeft: number;
  provider: UploadProvider;
}

export interface PhotoValidation {
  ok: boolean;
  reason: string | null;
}
