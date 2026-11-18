# MAMORI (Mahasiswa Monitor Risiko)

[![Expo](https://img.shields.io/badge/Expo-54-000020?style=flat-square&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?style=flat-square&logo=react)](https://reactnative.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostGIS-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

Platform pelaporan kondisi fasilitas kampus berbasis lokasi dan kesiapsiagaan bencana kampus sepanjang tahun. 

> **Tagline:** *Lihat masalah. Laporkan. Pantau sampai selesai.*

---

## Fitur Utama

- **Lapor Cepat (< 60 detik):** Foto langsung dari kamera + tag koordinat GPS otomatis.
- **Deteksi Duplikat Spasial:** Pencegahan laporan ganda dalam radius 25 meter menggunakan PostgreSQL PostGIS.
- **Konfirmasi Komunitas:** Tombol satu-tap *"Masih ada di sini"* untuk memprioritaskan penanganan.
- **Transparansi Status:** Pelacakan siklus penanganan: `Dilaporkan` → `Terverifikasi` → `Diteruskan` → `Dikerjakan` → `Selesai`.
- **Kesiapsiagaan Bencana (P0/P1):** Peta titik kumpul & jalur evakuasi, mode darurat, dan check-in *"Saya Aman"*.

---

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| **Mobile Client** | React Native, Expo (SDK 54), Expo Router |
| **Backend & DB** | Supabase (PostgreSQL 15+, PostGIS extension) |
| **Autentikasi & Storage** | Supabase Auth & Storage Bucket |
| **Platform Dukungan** | Android, iOS, Web Dashboard |

---

## Struktur Direktori

```text
mamori-app/
├── app/                  # Routing layar (Expo Router)
│   ├── (auth)/           # Autentikasi (login, register)
│   ├── (tabs)/           # Aplikasi mobile mahasiswa
│   ├── (dashboard)/      # Antarmuka web staf pengelola / Sarpras
│   └── _layout.tsx       # Root layout & providers
├── assets/               # Gambar, aset ikon, dan splash screen
├── components/           # Komponen UI bersama
├── docs/                 # Dokumen PRD dan spesifikasi teknis
├── lib/                  # Klien Supabase dan definisi tipe TypeScript
│   ├── supabase.ts
│   └── types.ts
├── .agents/skills/       # Agent skills & best practices
├── .env.example          # Contoh variabel environment
└── app.json              # Konfigurasi aplikasi Expo
```

---

## Memulai Cepat

### Prasyarat

- [Node.js](https://nodejs.org/) v18+ 
- Akun dan project aktif di [Supabase](https://supabase.com)
- Aplikasi [Expo Go](https://expo.dev/go) di perangkat fisik (opsional, untuk testing)

### Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/<username>/mamori.git
   cd mamori/mamori-app
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi environment:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan masukkan kredensial project Supabase:
   ```ini
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
   ```

4. Jalankan development server:
   ```bash
   npx expo start
   ```

Tekan `a` untuk Android Emulator, `i` untuk iOS Simulator, atau `w` untuk Web.

---

## Lisensi

Proyek ini didistribusikan di bawah lisensi [MIT](LICENSE).
