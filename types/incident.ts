import type { Coordinates } from '../lib/types/geo.types';

export type IncidentCategory =
  | 'fasilitas'
  | 'kebersihan'
  | 'drainase'
  | 'pohon'
  | 'listrik'
  | 'bencana'
  | 'lainnya';

export type IncidentSeverity = 'rendah' | 'sedang' | 'tinggi';

export type IncidentStatus =
  | 'dilaporkan'
  | 'terverifikasi'
  | 'diteruskan'
  | 'dikerjakan'
  | 'selesai'
  | 'ditolak';

export interface IncidentItem {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  coordinates: Coordinates;
  photoUrl?: string;
  afterPhotoUrl?: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
  evacuationBarrier: boolean; // Menghalangi jalur evakuasi (F-05)
  confirmationsCount: number; // Jumlah konfirmasi "Masih ada di sini" (F-20)
  unresponsiveDays?: number; // Hari tanpa respons (F-33)
  verifiedBy?: 'komunitas' | 'resmi';
}

export interface StatusTimelineEvent {
  status: IncidentStatus;
  label: string;
  actor: string;
  timestamp: string;
  notes?: string;
  isDone: boolean;
  isCurrent: boolean;
}

export const CATEGORY_METADATA: Record<
  IncidentCategory,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  fasilitas: {
    label: 'Fasilitas',
    icon: 'wrench',
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  kebersihan: {
    label: 'Kebersihan',
    icon: 'trash',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  drainase: {
    label: 'Drainase/Banjir',
    icon: 'tint',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
  },
  pohon: {
    label: 'Pohon/Lingkungan',
    icon: 'tree',
    color: '#84CC16',
    bgColor: '#F7FEE7',
  },
  listrik: {
    label: 'Listrik/Penerangan',
    icon: 'bolt',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  bencana: {
    label: 'Risiko Bencana',
    icon: 'exclamation-triangle',
    color: '#DC2626',
    bgColor: '#FEF2F2',
  },
  lainnya: {
    label: 'Lainnya',
    icon: 'info-circle',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  },
};

export const SEVERITY_METADATA: Record<
  IncidentSeverity,
  { label: string; color: string; bgColor: string }
> = {
  rendah: { label: 'Rendah', color: '#059669', bgColor: '#ECFDF5' },
  sedang: { label: 'Sedang', color: '#D97706', bgColor: '#FFFBEB' },
  tinggi: { label: 'Tinggi (Darurat)', color: '#DC2626', bgColor: '#FEF2F2' },
};

export const STATUS_METADATA: Record<
  IncidentStatus,
  { label: string; color: string; bgColor: string; stepOrder: number }
> = {
  dilaporkan: { label: 'Dilaporkan', color: '#64748B', bgColor: '#F1F5F9', stepOrder: 1 },
  terverifikasi: { label: 'Terverifikasi', color: '#2563EB', bgColor: '#EFF6FF', stepOrder: 2 },
  diteruskan: { label: 'Diteruskan', color: '#7C3AED', bgColor: '#F5F3FF', stepOrder: 3 },
  dikerjakan: { label: 'Dikerjakan', color: '#D97706', bgColor: '#FFFBEB', stepOrder: 4 },
  selesai: { label: 'Selesai', color: '#059669', bgColor: '#ECFDF5', stepOrder: 5 },
  ditolak: { label: 'Ditolak', color: '#DC2626', bgColor: '#FEF2F2', stepOrder: 0 },
};
