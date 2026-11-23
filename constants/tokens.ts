import { Platform } from 'react-native';

/**
 * MAMORI Frontend Design Tokens
 * Tema: Civic Infrastructure & Campus Disaster Mitigation (SDG 11)
 */

export const colors = {
  // Brand Primary & Secondary
  primary: '#1D4ED8',        // Blue 700 - Brand utama (Amanah & Profesional)
  primaryLight: '#EFF6FF',   // Blue 50
  primaryHover: '#1E40AF',   // Blue 800
  secondary: '#0F172A',      // Slate 900

  // Status & Severity Colors
  danger: '#DC2626',         // Red 600 - Risiko Bencana / Severity Tinggi
  dangerLight: '#FEF2F2',    // Red 50
  warning: '#D97706',        // Amber 600 - Severity Sedang
  warningLight: '#FFFBEB',   // Amber 50
  success: '#059669',        // Emerald 600 - Selesai / Terverifikasi / Aman
  successLight: '#ECFDF5',   // Emerald 50
  info: '#0284C7',           // Sky 600 - Jalur Evakuasi / LBS

  // Category Colors (PRD F-03)
  categoryFasilitas: '#2563EB',  // Biru
  categoryKebersihan: '#10B981', // Hijau
  categoryDrainase: '#06B6D4',   // Cyan
  categoryPohon: '#84CC16',      // Lime
  categoryListrik: '#F59E0B',    // Oranye / Amber
  categoryBencana: '#EF4444',    // Merah Terang (Risiko Bencana)
  categoryLainnya: '#6B7280',    // Abu-abu

  // Neutral Background & Surface
  background: '#F8FAFC',     // Slate 50
  surface: '#FFFFFF',        // Putih Kartu
  surfaceSubtle: '#F1F5F9',  // Slate 100
  border: '#E2E8F0',         // Slate 200
  borderDark: '#CBD5E1',     // Slate 300

  // Text Colors
  textMain: '#0F172A',       // Slate 900
  textMuted: '#64748B',      // Slate 500
  textLight: '#94A3B8',      // Slate 400
  textInverse: '#FFFFFF',

  // Accent & Overlays
  overlay: 'rgba(15, 23, 42, 0.65)',
  radius25mCircle: 'rgba(239, 68, 68, 0.18)',
  radius25mStroke: '#EF4444',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const typography = {
  fontFamily: {
    mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    title: 28,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
