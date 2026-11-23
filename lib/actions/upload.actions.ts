import type {
  DraftUpload,
  FailureAction,
  FailureContext,
  UploadEvent,
} from '../types/storage.types';

const PERCENT_STEP = 0.05;
const PERSIST_INTERVAL_MS = 1000;

export function reduceUpload(
  upload: DraftUpload,
  event: UploadEvent,
  now: string
): DraftUpload {
  switch (event.type) {
    case 'start':
      if (upload.status === 'done' || upload.status === 'uploading') return upload;
      return { ...upload, status: 'uploading', error: null, updatedAt: now };
    case 'progress': {
      if (upload.status !== 'uploading') return upload;
      const clamped = Math.min(Math.max(event.bytesUploaded, upload.bytesUploaded), upload.totalBytes);
      return { ...upload, bytesUploaded: clamped, updatedAt: now };
    }
    case 'pause':
      if (upload.status !== 'uploading') return upload;
      return { ...upload, status: 'paused', updatedAt: now };
    case 'success':
      return {
        ...upload,
        status: 'done',
        bytesUploaded: upload.totalBytes,
        uploadUrl: null,
        error: null,
        updatedAt: now,
      };
    case 'expire':
      return { ...upload, status: 'paused', uploadUrl: null, updatedAt: now };
    case 'failure':
      return { ...upload, status: 'failed', error: event.error, updatedAt: now };
  }
}

/** Avoid one disk write per progress event: persist on 5% delta or every second. */
export function shouldPersistProgress(
  previousBytes: number,
  nextBytes: number,
  totalBytes: number,
  elapsedMs: number
): boolean {
  if (nextBytes >= totalBytes) return true;
  if (elapsedMs >= PERSIST_INTERVAL_MS) return true;
  return nextBytes - previousBytes >= totalBytes * PERCENT_STEP;
}

export function decideFailure(context: FailureContext): FailureAction {
  const { httpStatus, attemptsLeft, provider } = context;

  if (httpStatus === 401 || httpStatus === 403) return 'auth-error';
  if (httpStatus === 404 || httpStatus === 409 || httpStatus === 410 || httpStatus === 423) {
    return 'restart';
  }
  if (attemptsLeft > 0) return 'retry';
  return provider === 'tus' ? 'fallback' : 'failed';
}

/** Missing upload URL means there is nothing to resume from. */
export function decideResume(uploadUrl: string | null): 'resume' | 'restart' {
  return uploadUrl ? 'resume' : 'restart';
}

export function createUpload(
  provider: DraftUpload['provider'],
  objectPath: string,
  totalBytes: number,
  now: string
): DraftUpload {
  return {
    provider,
    status: 'pending',
    objectPath,
    uploadUrl: null,
    bytesUploaded: 0,
    totalBytes,
    updatedAt: now,
    error: null,
  };
}
