import type { ReportDraft, PhotoValidation } from '../types/storage.types.ts';
import { validatePhotoSize } from './photo.actions.ts';

let defaultBaseDir = '/tmp/mamori_documents/';

async function getNativeFileSystem(): Promise<any | null> {
  try {
    return await import('expo-file-system');
  } catch {
    return null;
  }
}

export function getDraftsDirectory(): string {
  return `${defaultBaseDir}mamori_drafts/`;
}

export function getDraftPhotosDirectory(): string {
  return `${getDraftsDirectory()}photos/`;
}

/** In-memory storage untuk fallback environment Node/test */
export const memoryDraftFiles = new Map<string, string>();

/** Validasi struktur kelayakan draf laporan sebelum disimpan */
export function validateDraft(draft: Partial<ReportDraft>): { ok: boolean; error?: string } {
  if (!draft.id) {
    return { ok: false, error: 'Draft ID is required' };
  }
  if (!draft.reportId) {
    return { ok: false, error: 'Report ID is required' };
  }
  if (!draft.category) {
    return { ok: false, error: 'Report category is required' };
  }
  if (!draft.coords || typeof draft.coords.latitude !== 'number' || typeof draft.coords.longitude !== 'number') {
    return { ok: false, error: 'Valid coordinates are required' };
  }
  if (draft.photo) {
    const sizeCheck: PhotoValidation = validatePhotoSize(draft.photo.bytes);
    if (!sizeCheck.ok) {
      return { ok: false, error: sizeCheck.reason ?? 'Photo size exceeds limit' };
    }
  }
  return { ok: true };
}

/** Serialisasi draf ke JSON */
export function serializeDraft(draft: ReportDraft): string {
  return JSON.stringify(draft, null, 2);
}

/** Deserialisasi JSON ke ReportDraft */
export function deserializeDraft(rawJson: string): ReportDraft {
  const parsed = JSON.parse(rawJson);
  const validation = validateDraft(parsed);
  if (!validation.ok) {
    throw new Error(`Corrupted draft data: ${validation.error}`);
  }
  return parsed as ReportDraft;
}

/** Pastikan direktori draf di Scoped Storage tersedia */
export async function ensureDraftDirectories(): Promise<void> {
  try {
    const FileSystem = await getNativeFileSystem();
    if (FileSystem?.documentDirectory) {
      defaultBaseDir = FileSystem.documentDirectory;
      const draftsDir = getDraftsDirectory();
      const photoDir = getDraftPhotosDirectory();

      const dirInfo = await FileSystem.getInfoAsync(draftsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(draftsDir, { intermediates: true });
      }
      const photoDirInfo = await FileSystem.getInfoAsync(photoDir);
      if (!photoDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(photoDir, { intermediates: true });
      }
    }
  } catch {
    // Non-native environment
  }
}

/**
 * Simpan draf secara atomik (menulis ke .tmp lalu rename)
 * Mencegah data korup bila baterai habis atau aplikasi terhenti tiba-tiba (notes.txt).
 */
export async function saveDraft(draft: ReportDraft): Promise<string> {
  const validation = validateDraft(draft);
  if (!validation.ok) {
    throw new Error(`Cannot save invalid draft: ${validation.error}`);
  }

  const rawJson = serializeDraft(draft);
  const draftsDir = getDraftsDirectory();
  const targetPath = `${draftsDir}${draft.id}.json`;
  const tempPath = `${draftsDir}${draft.id}.tmp`;

  try {
    const FileSystem = await getNativeFileSystem();
    if (FileSystem?.documentDirectory) {
      await ensureDraftDirectories();
      await FileSystem.writeAsStringAsync(tempPath, rawJson, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await FileSystem.moveAsync({
        from: tempPath,
        to: targetPath,
      });
      return targetPath;
    }
  } catch {
    // Fallback
  }

  memoryDraftFiles.set(targetPath, rawJson);
  return targetPath;
}

/** Ambil draf berdasarkan ID */
export async function getDraft(id: string): Promise<ReportDraft | null> {
  const draftsDir = getDraftsDirectory();
  const targetPath = `${draftsDir}${id}.json`;

  try {
    const FileSystem = await getNativeFileSystem();
    if (FileSystem?.documentDirectory) {
      const fileInfo = await FileSystem.getInfoAsync(targetPath);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(targetPath, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        return deserializeDraft(content);
      }
    }
  } catch {
    // Fallback
  }

  const cached = memoryDraftFiles.get(targetPath);
  if (cached) {
    return deserializeDraft(cached);
  }
  return null;
}

/** Dapatkan semua daftar draf yang tersimpan */
export async function listDrafts(): Promise<ReportDraft[]> {
  const drafts: ReportDraft[] = [];
  const draftsDir = getDraftsDirectory();

  try {
    const FileSystem = await getNativeFileSystem();
    if (FileSystem?.documentDirectory) {
      await ensureDraftDirectories();
      const files = await FileSystem.readDirectoryAsync(draftsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await FileSystem.readAsStringAsync(`${draftsDir}${file}`, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          try {
            drafts.push(deserializeDraft(content));
          } catch {
            // Ignore corrupted draft
          }
        }
      }
      return drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  } catch {
    // Fallback
  }

  for (const [path, content] of memoryDraftFiles.entries()) {
    if (path.endsWith('.json')) {
      try {
        drafts.push(deserializeDraft(content));
      } catch {
        // Skip
      }
    }
  }
  return drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/** Hapus draf beserta berkas fotonya di Scoped Storage */
export async function deleteDraft(id: string): Promise<boolean> {
  const draftsDir = getDraftsDirectory();
  const photoDir = getDraftPhotosDirectory();
  const targetPath = `${draftsDir}${id}.json`;
  let deleted = false;

  try {
    const existing = await getDraft(id);
    const FileSystem = await getNativeFileSystem();
    if (existing && existing.photo?.fileName && FileSystem?.documentDirectory) {
      const photoPath = `${photoDir}${existing.photo.fileName}`;
      const photoInfo = await FileSystem.getInfoAsync(photoPath);
      if (photoInfo.exists) {
        await FileSystem.deleteAsync(photoPath, { idempotent: true });
      }
    }

    if (FileSystem?.documentDirectory) {
      const info = await FileSystem.getInfoAsync(targetPath);
      if (info.exists) {
        await FileSystem.deleteAsync(targetPath, { idempotent: true });
        deleted = true;
      }
    }
  } catch {
    // Fallback
  }

  if (memoryDraftFiles.has(targetPath)) {
    memoryDraftFiles.delete(targetPath);
    deleted = true;
  }

  return deleted;
}
