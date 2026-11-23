import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildObjectPath,
  buildPublicUrl,
  buildTusEndpoint,
  estimateChunks,
  extForMime,
  validatePhotoSize,
} from '../lib/actions/photo.actions.ts';
import {
  createUpload,
  decideFailure,
  decideResume,
  reduceUpload,
  shouldPersistProgress,
} from '../lib/actions/upload.actions.ts';
import { MAX_PHOTO_BYTES } from '../lib/constants/storage.ts';

const USER_ID = '2f1c9a1e-1111-4222-8333-444455556666';
const PHOTO_ID = '9b8c7d6e-aaaa-4bbb-8ccc-ddddeeeeffff';
const NOW = '2026-11-23T00:00:00.000Z';
const SUPABASE_URL = 'https://abcxyz.supabase.co';

describe('path & URL foto', () => {
  test('object path memakai UUID foto, bukan nama asli', () => {
    assert.equal(
      buildObjectPath(USER_ID, PHOTO_ID, 'image/jpeg'),
      `${USER_ID}/${PHOTO_ID}.jpg`
    );
  });

  test('ekstensi mengikuti mime', () => {
    assert.equal(extForMime('image/png'), 'png');
    assert.equal(extForMime('image/webp'), 'webp');
    assert.throws(() => extForMime('image/gif'), /tidak didukung/);
  });

  test('menolak userId dengan traversal atau pemisah path', () => {
    assert.throws(() => buildObjectPath('..', PHOTO_ID, 'image/jpeg'), /userId/);
    assert.throws(() => buildObjectPath('a/b', PHOTO_ID, 'image/jpeg'), /userId/);
    assert.throws(() => buildObjectPath('user name', PHOTO_ID, 'image/jpeg'), /userId/);
  });

  test('menolak photoId yang bukan UUID', () => {
    assert.throws(() => buildObjectPath(USER_ID, 'foto.jpg', 'image/jpeg'), /UUID/);
  });

  test('endpoint TUS memakai host storage langsung', () => {
    assert.equal(
      buildTusEndpoint(SUPABASE_URL),
      'https://abcxyz.storage.supabase.co/storage/v1/upload/resumable'
    );
  });

  test('endpoint TUS menolak host non-Supabase', () => {
    assert.throws(() => buildTusEndpoint('https://example.com'), /tidak dikenali/);
  });

  test('public URL dibentuk dari path', () => {
    assert.equal(
      buildPublicUrl(SUPABASE_URL, 'report-photos', `${USER_ID}/${PHOTO_ID}.jpg`),
      `https://abcxyz.supabase.co/storage/v1/object/public/report-photos/${USER_ID}/${PHOTO_ID}.jpg`
    );
  });
});

describe('batas 10 MB & chunk 6 MB', () => {
  test('10 MB tepat masih diterima', () => {
    assert.equal(validatePhotoSize(MAX_PHOTO_BYTES).ok, true);
  });

  test('lebih 1 byte ditolak', () => {
    const result = validatePhotoSize(MAX_PHOTO_BYTES + 1);
    assert.equal(result.ok, false);
    assert.match(result.reason ?? '', /10 MB/);
  });

  test('ukuran nol atau negatif ditolak', () => {
    assert.equal(validatePhotoSize(0).ok, false);
    assert.equal(validatePhotoSize(-1).ok, false);
  });

  test('10 MB jadi 2 chunk, 6 MB tetap 1 chunk', () => {
    assert.equal(estimateChunks(MAX_PHOTO_BYTES), 2);
    assert.equal(estimateChunks(6 * 1024 * 1024), 1);
    assert.equal(estimateChunks(6 * 1024 * 1024 + 1), 2);
  });
});

describe('state machine upload', () => {
  const base = () => createUpload('tus', `${USER_ID}/${PHOTO_ID}.jpg`, 10, NOW);

  test('start → uploading, lalu progress dibatasi total', () => {
    const started = reduceUpload(base(), { type: 'start' }, NOW);
    assert.equal(started.status, 'uploading');

    const over = reduceUpload(started, { type: 'progress', bytesUploaded: 99 }, NOW);
    assert.equal(over.bytesUploaded, 10);
  });

  test('progress tidak menurunkan bytesUploaded', () => {
    const started = reduceUpload(base(), { type: 'start' }, NOW);
    const atSix = reduceUpload(started, { type: 'progress', bytesUploaded: 6 }, NOW);
    const late = reduceUpload(atSix, { type: 'progress', bytesUploaded: 3 }, NOW);
    assert.equal(late.bytesUploaded, 6);
  });

  test('pause → paused, success → done dan URL dibuang', () => {
    const started = reduceUpload(base(), { type: 'start' }, NOW);
    assert.equal(reduceUpload(started, { type: 'pause' }, NOW).status, 'paused');

    const done = reduceUpload(
      { ...started, uploadUrl: 'https://tus/x' },
      { type: 'success' },
      NOW
    );
    assert.equal(done.status, 'done');
    assert.equal(done.uploadUrl, null);
    assert.equal(done.bytesUploaded, done.totalBytes);
  });

  test('upload URL kedaluwarsa → paused tanpa URL', () => {
    const started = { ...reduceUpload(base(), { type: 'start' }, NOW), uploadUrl: 'https://tus/x' };
    const expired = reduceUpload(started, { type: 'expire' }, NOW);
    assert.equal(expired.status, 'paused');
    assert.equal(expired.uploadUrl, null);
  });

  test('done tidak bisa kembali ke uploading', () => {
    const done = reduceUpload(base(), { type: 'success' }, NOW);
    assert.equal(reduceUpload(done, { type: 'start' }, NOW).status, 'done');
  });

  test('failure menyimpan pesan', () => {
    const failed = reduceUpload(base(), { type: 'failure', error: 'jaringan putus' }, NOW);
    assert.equal(failed.status, 'failed');
    assert.equal(failed.error, 'jaringan putus');
  });

  test('progress tetap tidak dipersist tiap event', () => {
    assert.equal(shouldPersistProgress(0, 1, 100, 10), false);
    assert.equal(shouldPersistProgress(0, 5, 100, 10), true);
    assert.equal(shouldPersistProgress(10, 11, 100, 1000), true);
    assert.equal(shouldPersistProgress(0, 1, 100, 1500), true);
  });
});

describe('keputusan gagal & resume', () => {
  test('401/403 selalu auth-error, tidak di-retry', () => {
    assert.equal(decideFailure({ httpStatus: 401, attemptsLeft: 5, provider: 'tus' }), 'auth-error');
    assert.equal(decideFailure({ httpStatus: 403, attemptsLeft: 5, provider: 'tus' }), 'auth-error');
  });

  test('404/409/410/423 → mulai upload baru', () => {
    for (const status of [404, 409, 410, 423]) {
      assert.equal(decideFailure({ httpStatus: status, attemptsLeft: 5, provider: 'tus' }), 'restart');
    }
  });

  test('error jaringan dengan retry tersisa → retry', () => {
    assert.equal(decideFailure({ attemptsLeft: 2, provider: 'tus' }), 'retry');
  });

  test('retry habis: TUS → fallback, single → failed', () => {
    assert.equal(decideFailure({ attemptsLeft: 0, provider: 'tus' }), 'fallback');
    assert.equal(decideFailure({ attemptsLeft: 0, provider: 'single' }), 'failed');
  });

  test('resume butuh uploadUrl tersimpan', () => {
    assert.equal(decideResume('https://tus/x'), 'resume');
    assert.equal(decideResume(null), 'restart');
  });
});
