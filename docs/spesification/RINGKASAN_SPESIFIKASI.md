# Ringkasan Spesifikasi Proyek (MAMORI)

Dokumen pointer ringkas. Mengacu ke dokumen sumber:
- Panduan Tugas Besar: [`docs/Spesifikasi Proyek Pemrograman Mobile.md`](./Spesifikasi%20Proyek%20Pemrograman%20Mobile.md)
- PRD Produk: [`docs/PRD MAMORI Platform Pelaporan dan Kesiapsiagaan Kampus.md`](./PRD%20MAMORI%20Platform%20Pelaporan%20dan%20Kesiapsiagaan%20Kampus.md)

---

## 1. Profil Proyek

| Parameter | Ketetapan | Ref Dokumen |
|---|---|---|
| **Tema SDG** | SDG 11: Civic Infrastructure & Disaster Mitigation (Topik B) | Panduan §2 |
| **Durasi** | 7 Minggu (Pertemuan 9 – 15) | Panduan §1 |
| **Tim** | Maksimal 3 orang | Panduan §1, §3 |
| **Tooling Inti** | React Native (Expo SDK 54), Zustand (UDF), RxJS, Supabase (PostGIS), Antigravity IDE | Panduan §1, PRD §8 |

---

## 2. Pembagian Peran Tim (3 Orang)

| Peran | Fokus & Luaran Kunci | Ref |
|---|---|---|
| **Anggota 1: System Architect & Security** | Zustand Store (UDF), `expo-secure-store`, Architect’s Audit, EAS Build APK | Panduan §3 |
| **Anggota 2: Frontend & Performance** | UI Deklaratif, 16ms Mandate (60 FPS), `React.memo`/memoization, Micro-animations | Panduan §3 |
| **Anggota 3: Hardware, Spatial & Network** | `react-native-maps`, `expo-location`, PostGIS / Haversine, `expo-file-system`, RxJS Pipeline | Panduan §3 |

---

## 3. Matriks Milestone Mingguan

| Pertemuan | Target Deliverables | Ref Spesifikasi |
|---|---|---|
| **P9** | LBS, `useLocationTracking`, kalkulasi jarak Haversine | Panduan §4 (P9) & PRD F-02, F-11 |
| **P10** | `expo-secure-store` (token/auth), Scoped Storage `expo-file-system`, JIT Runtime Permissions | Panduan §4 (P10) & PRD F-01, F-06 |
| **P11** | RxJS Pipeline (debounce, switchMap), Supabase Realtime, Offline fallback | Panduan §4 (P11) & PRD F-32, F-61 |
| **P12** | Responsive layout, `react-native-reanimated`, Skeleton loaders | Panduan §4 (P12) & PRD §10 |
| **P13** | AI Refactoring di Antigravity, 16ms Profiling, Audit Zero Memory Leak (Cleanup listener) | Panduan §4 (P13) |
| **P14** | Unit Test kalkulasi spasial & Zustand, Kompilasi Standalone APK (EAS Build) | Panduan §4 (P14) & PRD §12 |
| **P15** | Demo live, Repositori final, Laporan integrasi AIK (*Ikhlas, Itqan, Amanah*) | Panduan §4 (P15), §6 |

---

## 4. Checklist Kriteria Penilaian

- [ ] **Zustand UDF (20%)**: Single Source of Truth, Precision Selectors, tanpa mutasi langsung (`.agents/skills/react-state-management`).
- [ ] **Hardware, LBS & Security (25%)**: PostGIS radius 25m, Haversine, camera direct, `expo-secure-store` (`.agents/skills/supabase`).
- [ ] **60 FPS / 16ms Mandate (20%)**: Memoization, unsubscribe cleanup listener lokasi/realtime (`.agents/skills/react-native-best-practices`).
- [ ] **Antigravity & AIK (15%)**: Master prompt history, Architect’s Audit checklist lengkap.
- [ ] **Testing & APK Build (10%)**: Unit test passing, APK jalan di fisik (`.agents/skills/react-native-testing`).
- [ ] **Live Demo & Presentasi (10%)**: Pertahanan sistem real-time.

---

## 5. Referensi File & Panduan Teknis

- Config App & Routing: [`app.json`](../app.json), [`app/_layout.tsx`](../app/_layout.tsx)
- Supabase Client: [`lib/supabase.ts`](../lib/supabase.ts)
- PRD Fungsional Detail (F-01 s/d F-83): [`docs/PRD MAMORI...md`](./PRD%20MAMORI%20Platform%20Pelaporan%20dan%20Kesiapsiagaan%20Kampus.md#7-kebutuhan-fungsional)
- Model Data Database: [`docs/PRD MAMORI...md`](./PRD%20MAMORI%20Platform%20Pelaporan%20dan%20Kesiapsiagaan%20Kampus.md#8-model-data-inti)
- Standar Praktik Mobile: [`.agents/skills/`](../.agents/skills/)
