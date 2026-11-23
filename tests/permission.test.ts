import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PERMISSION_RATIONALES,
  checkPermission,
  requestPermission,
} from '../lib/actions/permission.actions.ts';

describe('Penanganan Izin Just-In-Time (JIT Runtime Permissions)', () => {
  it('menyediakan pesan rationale edukatif untuk izin lokasi', () => {
    const loc = PERMISSION_RATIONALES.location;
    assert.ok(loc.title);
    assert.match(loc.rationale, /GPS/i);
    assert.equal(loc.target, 'location');
  });

  it('menyediakan pesan rationale edukatif untuk izin kamera', () => {
    const cam = PERMISSION_RATIONALES.camera;
    assert.ok(cam.title);
    assert.match(cam.rationale, /kamera/i);
    assert.equal(cam.target, 'camera');
  });

  it('mengembalikan status permission yang terdefinisi dengan aman di lingkungan non-native', async () => {
    const validStates = ['undetermined', 'granted', 'denied', 'blocked'];

    const locStatus = await checkPermission('location');
    assert.ok(validStates.includes(locStatus));

    const camStatus = await checkPermission('camera');
    assert.ok(validStates.includes(camStatus));

    const locReq = await requestPermission('location');
    assert.ok(validStates.includes(locReq));

    const camReq = await requestPermission('camera');
    assert.ok(validStates.includes(camReq));
  });
});
