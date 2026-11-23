import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateDistance, isWithinRadius } from '../lib/actions/geo.actions.ts';
import {
  DISTANCE_SCENARIOS,
  DUPLICATE_SCENARIOS,
  REAL_LOCATIONS,
} from '../data/locations.ts';

/**
 * =====================================================================
 * SKENARIO PENGUJIAN — KALKULASI SPASIAL HAVERSINE
 * =====================================================================
 * Semua skenario memakai koordinat nyata (lihat data/locations.ts).
 * Tujuan: memastikan jarak lurus & deteksi duplikat 25 m akurat
 * untuk kasus yang benar-benar terjadi di lapangan (PRD F-02, F-11).
 * =====================================================================
 */

// ---------------------------------------------------------------------
// SKENARIO 1: Jarak antar dua landmark nyata
// Contoh: pengguna di Monas ingin tahu jarak ke Bundaran HI.
// Ekspektasi: ±2,16 km (bukan 0, bukan puluhan km).
// ---------------------------------------------------------------------
describe('Jarak antar lokasi nyata', () => {
  for (const scenario of DISTANCE_SCENARIOS) {
    test(`Skenario: ${scenario.name}`, () => {
      const distance = calculateDistance(scenario.from, scenario.to);

      assert.ok(
        distance >= scenario.expectedMeters.min && distance <= scenario.expectedMeters.max,
        `Jarak ${distance.toFixed(1)} m di luar rentang ` +
          `${scenario.expectedMeters.min}–${scenario.expectedMeters.max} m. ` +
          `(${scenario.source})`
      );
    });
  }
});

// ---------------------------------------------------------------------
// SKENARIO 2: Deteksi duplikat radius 25 m (PRD F-11)
// Contoh: mahasiswa melapor lampu rusak; sistem cek apakah sudah ada
// insiden serupa dalam radius 25 m → tawarkan gabung (F-12).
// ---------------------------------------------------------------------
describe('Deteksi duplikat radius 25 m', () => {
  for (const scenario of DUPLICATE_SCENARIOS) {
    test(`Skenario: ${scenario.name}`, () => {
      const result = isWithinRadius(
        scenario.reference,
        scenario.candidate,
        scenario.radiusMeters
      );

      assert.equal(result, scenario.expectWithin, scenario.note);
    });
  }
});

// ---------------------------------------------------------------------
// SKENARIO 3: Kasus tepi & sifat matematis
// Memastikan rumus tidak menghasilkan nilai aneh (negatif/NaN) dan
// simetris (jarak A→B sama dengan B→A).
// ---------------------------------------------------------------------
describe('Kasus tepi & sifat rumus', () => {
  test('Skenario: titik identik menghasilkan jarak 0 m', () => {
    const distance = calculateDistance(
      REAL_LOCATIONS.monasJakarta,
      REAL_LOCATIONS.monasJakarta
    );
    assert.equal(Math.round(distance), 0);
  });

  test('Skenario: jarak simetris (A→B == B→A)', () => {
    const forward = calculateDistance(
      REAL_LOCATIONS.tuguYogyakarta,
      REAL_LOCATIONS.malioboro
    );
    const backward = calculateDistance(
      REAL_LOCATIONS.malioboro,
      REAL_LOCATIONS.tuguYogyakarta
    );
    assert.ok(Math.abs(forward - backward) < 0.001, 'Jarak harus simetris');
  });

  test('Skenario: jarak selalu non-negatif dan bukan NaN', () => {
    const distance = calculateDistance(
      REAL_LOCATIONS.monasJakarta,
      REAL_LOCATIONS.bundaranHI
    );
    assert.ok(Number.isFinite(distance) && distance >= 0);
  });
});
