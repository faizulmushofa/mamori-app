import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDraft,
  serializeDraft,
  deserializeDraft,
  saveDraft,
  getDraft,
  listDrafts,
  deleteDraft,
} from '../lib/actions/draft.actions.ts';
import type { ReportDraft } from '../lib/types/storage.types.ts';

const sampleValidDraft: ReportDraft = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  reportId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  createdAt: '2026-11-23T10:00:00.000Z',
  updatedAt: '2026-11-23T10:00:00.000Z',
  coords: {
    latitude: -7.7705,
    longitude: 110.4091,
    accuracy: 5,
  },
  capturedAt: '2026-11-23T10:00:00.000Z',
  category: 'fasilitas',
  description: 'Keramik tangga utama pecah dan licin',
  severity: 'sedang',
  blocksEvacuation: false,
  photo: {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    fileName: 'photo_tangga.jpg',
    mimeType: 'image/jpeg',
    bytes: 2 * 1024 * 1024, // 2MB
  },
  upload: {
    provider: 'tus',
    status: 'pending',
    objectPath: 'user123/f47ac10b-58cc-4372-a567-0e02b2c3d479.jpg',
    uploadUrl: null,
    bytesUploaded: 0,
    totalBytes: 2 * 1024 * 1024,
    updatedAt: '2026-11-23T10:00:00.000Z',
    error: null,
  },
};

describe('Validasi Struktur Draf Laporan', () => {
  it('draf lengkap dan valid lolos verifikasi', () => {
    const res = validateDraft(sampleValidDraft);
    assert.equal(res.ok, true);
  });

  it('menolak draf tanpa ID', () => {
    const invalid = { ...sampleValidDraft, id: '' };
    const res = validateDraft(invalid);
    assert.equal(res.ok, false);
    assert.match(res.error ?? '', /Draft ID is required/);
  });

  it('menolak draf tanpa kategori', () => {
    const invalid = { ...sampleValidDraft, category: undefined };
    const res = validateDraft(invalid);
    assert.equal(res.ok, false);
    assert.match(res.error ?? '', /category is required/);
  });

  it('menolak draf dengan ukuran foto melebihi 10MB', () => {
    const invalid = {
      ...sampleValidDraft,
      photo: {
        ...sampleValidDraft.photo,
        bytes: 11 * 1024 * 1024, // 11MB
      },
    };
    const res = validateDraft(invalid);
    assert.equal(res.ok, false);
    assert.match(res.error ?? '', /10 MB/);
  });
});

describe('Serialisasi & Deserialisasi Draf', () => {
  it('JSON round-trip mempertahankan seluruh properti draf', () => {
    const raw = serializeDraft(sampleValidDraft);
    const restored = deserializeDraft(raw);

    assert.equal(restored.id, sampleValidDraft.id);
    assert.equal(restored.category, sampleValidDraft.category);
    assert.equal(restored.coords.latitude, sampleValidDraft.coords.latitude);
    assert.equal(restored.photo.bytes, sampleValidDraft.photo.bytes);
  });

  it('melempar error jika JSON korup atau tidak valid', () => {
    assert.throws(() => deserializeDraft('{"id":"123"}'), /Corrupted draft data/);
  });
});

describe('Siklus Hidup CRUD Draf (Offline Storage)', () => {
  it('dapat menyimpan dan mengambil kembali draf', async () => {
    const draftId = sampleValidDraft.id;
    await saveDraft(sampleValidDraft);

    const fetched = await getDraft(draftId);
    assert.ok(fetched);
    assert.equal(fetched.id, draftId);
    assert.equal(fetched.description, sampleValidDraft.description);
  });

  it('dapat menampilkan daftar seluruh draf tersimpan', async () => {
    const secondDraft: ReportDraft = {
      ...sampleValidDraft,
      id: 'second-draft-uuid',
      category: 'kebersihan',
      updatedAt: '2026-11-23T11:00:00.000Z',
    };
    await saveDraft(secondDraft);

    const all = await listDrafts();
    assert.ok(all.length >= 2);
    assert.equal(all[0].id, 'second-draft-uuid');
  });

  it('dapat menghapus draf berdasarkan ID', async () => {
    const idToDelete = 'second-draft-uuid';
    const deleted = await deleteDraft(idToDelete);
    assert.equal(deleted, true);

    const after = await getDraft(idToDelete);
    assert.equal(after, null);
  });
});
