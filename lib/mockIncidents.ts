import type { IncidentItem } from './types';

export const CAMPUS_CENTER = {
  latitude: -7.8014,
  longitude: 110.3644,
};

export const MOCK_INCIDENTS: IncidentItem[] = [
  {
    id: 'inc-001',
    title: 'Lampu Tangga Darurat Gedung B Mati Total',
    description:
      'Lampu tangga darurat lantai 2 menuju lantai 1 gedung B mati sudah dua minggu, membahayakan saat evakuasi malam hari.',
    category: 'bencana',
    severity: 'tinggi',
    status: 'terverifikasi',
    coordinates: {
      latitude: -7.80142,
      longitude: 110.36442, // ~15m dari pusat kampus (dalam radius duplikat)
    },
    reporterName: 'Rani (Mahasiswa)',
    createdAt: '2026-11-20T08:30:00Z',
    updatedAt: '2026-11-21T10:15:00Z',
    evacuationBarrier: true,
    confirmationsCount: 6,
    unresponsiveDays: 3,
    verifiedBy: 'resmi',
  },
  {
    id: 'inc-002',
    title: 'Lampu Koridor Gedung B Padam',
    description: 'Penerangan koridor arah tangga darurat redup dan berkedip.',
    category: 'listrik',
    severity: 'sedang',
    status: 'dilaporkan',
    coordinates: {
      latitude: -7.80144,
      longitude: 110.36443, // Dekat (~20m) dengan inc-001
    },
    reporterName: 'Dimas (Mahasiswa)',
    createdAt: '2026-11-22T14:00:00Z',
    updatedAt: '2026-11-22T14:00:00Z',
    evacuationBarrier: false,
    confirmationsCount: 2,
    unresponsiveDays: 1,
    verifiedBy: 'komunitas',
  },
  {
    id: 'inc-003',
    title: 'Saluran Drainase Depan Perpustakaan Meluap',
    description:
      'Sampah daun dan sedimentasi menyumbat gorong-gorong, air mulai menggenang setinggi mata kaki saat hujan lebat.',
    category: 'drainase',
    severity: 'tinggi',
    status: 'diteruskan',
    coordinates: {
      latitude: -7.8021,
      longitude: 110.3651,
    },
    reporterName: 'Ahmad (Staf K3)',
    createdAt: '2026-11-19T11:20:00Z',
    updatedAt: '2026-11-21T09:00:00Z',
    evacuationBarrier: true,
    confirmationsCount: 14,
    unresponsiveDays: 4,
    verifiedBy: 'resmi',
  },
  {
    id: 'inc-004',
    title: 'Dahan Pohon Trembesi Lapuk di Jalur Pejalan Kaki',
    description:
      'Dahan besar retak dan condong ke jalan setapak arah kantin, rawan patah tertiup angin.',
    category: 'pohon',
    severity: 'tinggi',
    status: 'dikerjakan',
    coordinates: {
      latitude: -7.8008,
      longitude: 110.3638,
    },
    reporterName: 'Fajar (Mahasiswa)',
    createdAt: '2026-11-18T16:45:00Z',
    updatedAt: '2026-11-23T07:30:00Z',
    evacuationBarrier: false,
    confirmationsCount: 9,
    unresponsiveDays: 5,
    verifiedBy: 'resmi',
  },
  {
    id: 'inc-005',
    title: 'Keran Air Wastafel Rusak Mengalir Terus',
    description: 'Wastafel lantai dasar gedung rektorat bocor, air terbuang percuma.',
    category: 'fasilitas',
    severity: 'rendah',
    status: 'selesai',
    coordinates: {
      latitude: -7.8019,
      longitude: 110.3639,
    },
    reporterName: 'Siti (Dosen)',
    createdAt: '2026-11-15T09:10:00Z',
    updatedAt: '2026-11-17T15:20:00Z',
    evacuationBarrier: false,
    confirmationsCount: 4,
    unresponsiveDays: 0,
    verifiedBy: 'resmi',
  },
];
