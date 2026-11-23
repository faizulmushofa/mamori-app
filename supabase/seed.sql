-- =====================================================================
-- MAMORI — Data Awal (Seed Data)
-- Berisi: Akun Demo (Student, Staff, Admin), Master Unit, dan Kesiapsiagaan Kampus
-- =====================================================================

-- 1. MASTER UNITS
insert into public.units (id, name, unit_type)
values
  ('11111111-1111-1111-1111-111111111111', 'Biro Sarana dan Prasarana (Sarpras)', 'sarpras'),
  ('22222222-2222-2222-2222-222222222222', 'Unit Keselamatan dan Kesehatan Kerja (K3)', 'k3'),
  ('33333333-3333-3333-3333-333333333333', 'Unit Keamanan Kampus (Satpam)', 'satpam')
on conflict (id) do nothing;

-- 2. AKUN DEMO PERMANEN (Password: Mamori2026! untuk semua akun demo)
-- Mahasiswa Demo
insert into auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000000',
  'student@mamori.ac.id',
  crypt('Mamori2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Ahmad Faizul (Mahasiswa)","name":"Ahmad Faizul"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
) on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  jsonb_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'email', 'student@mamori.ac.id'),
  'email',
  now(),
  now(),
  now()
) on conflict (provider, id) do nothing;

-- Staf Sarpras Demo
insert into auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) values (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '00000000-0000-0000-0000-000000000000',
  'staff@mamori.ac.id',
  crypt('Mamori2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Budi Santoso (Staf Sarpras)","name":"Budi Santoso"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
) on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  jsonb_build_object('sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'email', 'staff@mamori.ac.id'),
  'email',
  now(),
  now(),
  now()
) on conflict (provider, id) do nothing;

-- Admin Kampus Demo
insert into auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) values (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '00000000-0000-0000-0000-000000000000',
  'admin@mamori.ac.id',
  crypt('Mamori2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Administrator MAMORI","name":"Admin"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
) on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  jsonb_build_object('sub', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'email', 'admin@mamori.ac.id'),
  'email',
  now(),
  now(),
  now()
) on conflict (provider, id) do nothing;

-- Tetapkan Role Khusus untuk Staf dan Admin (Mahasiswa otomatis dapat role 'student' dari trigger)
insert into public.user_roles (user_id, role, is_primary)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'staff', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'admin', true)
on conflict (user_id, role) do update set is_primary = true;

-- 3. DATA KESIAPSIAGAAN KAMPUS (P0)
-- Aset Kesiapsiagaan Statis (Titik Kumpul, APAR, P3K, AED, Tangga Darurat)
insert into public.safety_assets (name, asset_type, geometry, condition_status)
values
  (
    'Titik Kumpul Utama Lapangan Rektorat',
    'assembly_point',
    extensions.st_setsrid(extensions.st_makepoint(110.4091, -7.7705), 4326),
    'good'
  ),
  (
    'Titik Kumpul Parkir Barat',
    'assembly_point',
    extensions.st_setsrid(extensions.st_makepoint(110.4075, -7.7712), 4326),
    'good'
  ),
  (
    'APAR Lobi Gedung Kuliah Terpadu',
    'apar',
    extensions.st_setsrid(extensions.st_makepoint(110.4085, -7.7708), 4326),
    'good'
  ),
  (
    'Kotak P3K Ruang Security Lobi',
    'p3k',
    extensions.st_setsrid(extensions.st_makepoint(110.4089, -7.7704), 4326),
    'good'
  ),
  (
    'AED Sentral Gedung Pelayanan Mahasiswa',
    'aed',
    extensions.st_setsrid(extensions.st_makepoint(110.4090, -7.7706), 4326),
    'good'
  ),
  (
    'Tangga Darurat Sayap Timur Lantai 2',
    'emergency_stairs',
    extensions.st_setsrid(extensions.st_makepoint(110.4095, -7.7710), 4326),
    'good'
  );

-- Jalur Evakuasi Kampus
insert into public.evacuation_routes (name, geometry, condition_status)
values
  (
    'Jalur Evakuasi Gedung Kuliah Terpadu ke Lapangan Utama',
    extensions.st_setsrid(
      extensions.st_geomfromtext('LINESTRING(110.4085 -7.7708, 110.4088 -7.7706, 110.4091 -7.7705)'),
      4326
    ),
    'good'
  ),
  (
    'Jalur Evakuasi Sayap Barat ke Parkir Barat',
    extensions.st_setsrid(
      extensions.st_geomfromtext('LINESTRING(110.4080 -7.7709, 110.4077 -7.7711, 110.4075 -7.7712)'),
      4326
    ),
    'good'
  );

-- Area Rawan Bencana (Risk Zones Geofencing - Panduan Topik B)
insert into public.risk_zones (name, hazard_type, risk_level, area)
values
  (
    'Zona Rawan Genangan Drainase Parkir Barat',
    'flood',
    'medium',
    extensions.st_setsrid(
      extensions.st_geomfromtext('POLYGON((110.4073 -7.7710, 110.4078 -7.7710, 110.4078 -7.7715, 110.4073 -7.7715, 110.4073 -7.7710))'),
      4326
    )
  ),
  (
    'Zona Pohon Rindang Berisiko Tumbang Jalur Boulevard',
    'other',
    'low',
    extensions.st_setsrid(
      extensions.st_geomfromtext('POLYGON((110.4088 -7.7700, 110.4094 -7.7700, 110.4094 -7.7703, 110.4088 -7.7703, 110.4088 -7.7700))'),
      4326
    )
  );
