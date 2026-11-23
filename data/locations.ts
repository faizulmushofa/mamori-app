import type { Coordinates } from '../lib/types/geo.types';

/**
 * =====================================================================
 * DATA LOKASI NYATA (REAL-WORLD FIXTURES)
 * =====================================================================
 * Semua koordinat diambil dari landmark publik yang bisa diverifikasi
 * lewat Google Maps / OpenStreetMap. Dipakai sebagai basis pengujian
 * kalkulasi spasial Haversine & deteksi duplikat radius 25 m (PRD F-11).
 *
 * Sumber koordinat: OpenStreetMap / Google Maps (titik tengah landmark).
 * =====================================================================
 */

export const REAL_LOCATIONS = {
  /** Monumen Nasional, Jakarta Pusat */
  monasJakarta: { latitude: -6.175392, longitude: 106.827153 },
  /** Bundaran Hotel Indonesia (Selamat Datang), Jakarta Pusat */
  bundaranHI: { latitude: -6.1944, longitude: 106.8229 },
  /** Tugu Pal Putih (Tugu Yogyakarta) */
  tuguYogyakarta: { latitude: -7.7828, longitude: 110.3671 },
  /** Kawasan Malioboro, Yogyakarta */
  malioboro: { latitude: -7.7925, longitude: 110.3656 },
} as const satisfies Record<string, Coordinates>;

export interface DistanceScenario {
  name: string;
  from: Coordinates;
  to: Coordinates;
  /** Rentang jarak lurus (meter) yang wajar berdasarkan referensi nyata. */
  expectedMeters: { min: number; max: number };
  source: string;
}

/**
 * Skenario jarak antar dua lokasi nyata.
 * Rentang dibuat longgar (±sedikit) agar tahan variasi titik acuan,
 * namun tetap memvalidasi orde besaran yang benar.
 */
export const DISTANCE_SCENARIOS: DistanceScenario[] = [
  {
    name: 'Monas → Bundaran HI (Jakarta) ≈ 2,1–2,2 km',
    from: REAL_LOCATIONS.monasJakarta,
    to: REAL_LOCATIONS.bundaranHI,
    expectedMeters: { min: 2100, max: 2250 },
    source: 'Jarak lurus Monas–Bundaran HI ±2,16 km (OSM).',
  },
  {
    name: 'Tugu Yogyakarta → Malioboro (Yogyakarta) ≈ 1,0–1,2 km',
    from: REAL_LOCATIONS.tuguYogyakarta,
    to: REAL_LOCATIONS.malioboro,
    expectedMeters: { min: 1050, max: 1150 },
    source: 'Jarak lurus Tugu–Malioboro ±1,09 km (OSM).',
  },
];

export interface DuplicateScenario {
  name: string;
  /** Titik laporan lama (Incident aktif). */
  reference: Coordinates;
  /** Titik laporan baru yang dicek. */
  candidate: Coordinates;
  radiusMeters: number;
  expectWithin: boolean;
  note: string;
}

/**
 * Skenario deteksi duplikat (PRD F-11: radius usulan 25 m).
 * Kandidat digeser ke utara dari Monas sejauh ±N meter.
 * 1 derajat lintang ≈ 111.320 m → 0,00009° ≈ 10 m.
 */
export const DUPLICATE_SCENARIOS: DuplicateScenario[] = [
  {
    name: 'Laporan baru ±10 m dari insiden lama → DUPLIKAT',
    reference: REAL_LOCATIONS.monasJakarta,
    candidate: {
      latitude: REAL_LOCATIONS.monasJakarta.latitude + 0.00009,
      longitude: REAL_LOCATIONS.monasJakarta.longitude,
    },
    radiusMeters: 25,
    expectWithin: true,
    note: '±10 m masih di dalam radius 25 m, harus ditawari gabung (F-12).',
  },
  {
    name: 'Laporan baru ±20 m dari insiden lama → DUPLIKAT',
    reference: REAL_LOCATIONS.monasJakarta,
    candidate: {
      latitude: REAL_LOCATIONS.monasJakarta.latitude + 0.00018,
      longitude: REAL_LOCATIONS.monasJakarta.longitude,
    },
    radiusMeters: 25,
    expectWithin: true,
    note: '±20 m masih di dalam radius 25 m.',
  },
  {
    name: 'Laporan baru ±30 m dari insiden lama → BUKAN duplikat',
    reference: REAL_LOCATIONS.monasJakarta,
    candidate: {
      latitude: REAL_LOCATIONS.monasJakarta.latitude + 0.00027,
      longitude: REAL_LOCATIONS.monasJakarta.longitude,
    },
    radiusMeters: 25,
    expectWithin: false,
    note: '±30 m melewati ambang 25 m, harus jadi Incident baru.',
  },
  {
    name: 'Laporan baru ±110 m dari insiden lama → BUKAN duplikat',
    reference: REAL_LOCATIONS.monasJakarta,
    candidate: {
      latitude: REAL_LOCATIONS.monasJakarta.latitude + 0.001,
      longitude: REAL_LOCATIONS.monasJakarta.longitude,
    },
    radiusMeters: 25,
    expectWithin: false,
    note: '±110 m jelas di luar radius, kasus kontrol negatif.',
  },
];
