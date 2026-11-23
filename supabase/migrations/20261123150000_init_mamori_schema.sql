-- =====================================================================
-- MAMORI — Inisialisasi Skema Basis Data Lengkap (PostgreSQL 15+ / Supabase + PostGIS)
-- Spesifikasi: PRD MAMORI (F-01 s/d F-92), Panduan Topik B (SDG 11), 3NF Normalization
-- =====================================================================

-- 1. EXTENSIONS
create extension if not exists postgis schema extensions;
create extension if not exists pgcrypto;

-- 2. ENUM TYPES
create type public.user_role         as enum ('student', 'staff', 'pengelola', 'floor_warden', 'moderator', 'admin');
create type public.account_status    as enum ('active', 'suspended', 'blocked');
create type public.incident_category as enum ('facility', 'cleanliness', 'drainage', 'tree', 'electrical', 'disaster_risk', 'other');
create type public.incident_severity as enum ('low', 'medium', 'high');
create type public.incident_status   as enum ('reported', 'verified', 'forwarded', 'in_progress', 'resolved', 'rejected', 'reopened');
create type public.report_type       as enum ('initial', 'confirmation', 'new_evidence', 'update', 'resolution');
create type public.photo_status      as enum ('pending', 'ready', 'failed');
create type public.asset_type        as enum ('assembly_point', 'apar', 'p3k', 'aed', 'emergency_stairs');
create type public.asset_condition   as enum ('good', 'needs_check', 'damaged');
create type public.route_condition   as enum ('good', 'needs_check', 'blocked');
create type public.hazard_type       as enum ('flood', 'landslide', 'fire', 'earthquake', 'other');
create type public.risk_level        as enum ('low', 'medium', 'high');
create type public.emergency_type    as enum ('earthquake', 'fire', 'flood', 'drill', 'other');
create type public.checkin_status    as enum ('safe', 'need_help');
create type public.help_category     as enum ('trapped', 'injured', 'need_evacuation');
create type public.xp_source         as enum ('report_verified', 'report_resolved', 'useful_confirmation', 'new_evidence', 'before_after_photo', 'penalty');
create type public.flag_target       as enum ('incident', 'report', 'profile');
create type public.flag_status       as enum ('pending', 'resolved', 'dismissed');

-- 3. PROFILES (Terhubung 1-to-1 dengan auth.users)
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  name           varchar(120) not null,
  email          varchar(160) not null unique,
  avatar_url     text,
  reputation     numeric(6,2) not null default 0,
  xp             integer not null default 0,
  account_status public.account_status not null default 'active',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 4. USER ROLES (Multi-role F-54: Mahasiswa sekaligus Floor Warden)
create table public.user_roles (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       public.user_role not null,
  is_primary boolean not null default false,
  granted_by uuid references public.profiles(id),
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- Helper Function Otorisasi Role (Security Definer mencegah rekursi RLS)
create or replace function public.has_role(required_roles public.user_role[])
returns boolean as $$
begin
  return exists (
    select 1 
    from public.user_roles 
    where user_id = (select auth.uid())
      and role = any(required_roles)
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger Sinkronisasi Otomatis Pengguna Baru (Google OAuth & Email)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_name text;
begin
  default_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    default_name,
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.user_roles (user_id, role, is_primary)
  values (new.id, 'student', true)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. UNITS (Master Unit Kerja: Sarpras, K3, Satpam)
create table public.units (
  id         uuid primary key default gen_random_uuid(),
  name       varchar(120) not null,
  unit_type  varchar(40) not null,
  created_at timestamptz not null default now()
);

-- 6. INCIDENTS (Entitas Masalah Utama di Lapangan)
create table public.incidents (
  id                  uuid primary key default gen_random_uuid(),
  category            public.incident_category not null,
  location            extensions.geometry(Point, 4326) not null,
  severity            public.incident_severity not null default 'medium',
  status              public.incident_status not null default 'reported',
  blocks_evacuation   boolean not null default false,
  created_by          uuid not null references public.profiles(id),
  assigned_unit_id    uuid references public.units(id),
  merged_into_id      uuid references public.incidents(id),
  verification_source varchar(20),
  verified_at         timestamptz,
  resolution_notes    text,
  created_at          timestamptz not null default now(),
  resolved_at         timestamptz,
  updated_at          timestamptz not null default now()
);

-- 7. REPORTS (Bukti Laporan Awal, Konfirmasi, & Update)
create table public.reports (
  id              uuid primary key default gen_random_uuid(),
  incident_id     uuid not null references public.incidents(id) on delete cascade,
  user_id         uuid not null references public.profiles(id),
  report_type     public.report_type not null default 'initial',
  description     varchar(280),
  location        extensions.geometry(Point, 4326),
  brings_new_info boolean not null default false,
  captured_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

-- 8. REPORT ATTACHMENTS (Pemisahan Media Fisik - Anti Model Gemuk & Mendukung Sinyal EDGE)
create table public.report_attachments (
  id           uuid primary key default gen_random_uuid(),
  report_id    uuid not null references public.reports(id) on delete cascade,
  storage_path text not null unique,
  file_bytes   integer not null check (file_bytes > 0 and file_bytes <= 10485760), -- Maksimal 10MB
  mime_type    varchar(50) not null,
  sha256       varchar(64),
  photo_status public.photo_status not null default 'pending',
  created_at   timestamptz not null default now(),
  uploaded_at  timestamptz
);

-- 9. STATUS EVENTS (Audit Mutasi Status Insiden)
create table public.status_events (
  id          uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  from_status public.incident_status,
  to_status   public.incident_status not null,
  changed_by  uuid not null references public.profiles(id),
  note        text,
  created_at  timestamptz not null default now()
);

-- 10. SAFETY ASSETS (Data Statis Kesiapsiagaan Kampus - P0)
create table public.safety_assets (
  id               uuid primary key default gen_random_uuid(),
  name             varchar(120) not null,
  asset_type       public.asset_type not null,
  geometry         extensions.geometry(Point, 4326) not null,
  condition_status public.asset_condition not null default 'good',
  created_at       timestamptz not null default now()
);

-- 11. EVACUATION ROUTES (Jalur Evakuasi Darurat Kampus - P0)
create table public.evacuation_routes (
  id               uuid primary key default gen_random_uuid(),
  name             varchar(120) not null,
  geometry         extensions.geometry(LineString, 4326) not null,
  condition_status public.route_condition not null default 'good',
  created_at       timestamptz not null default now()
);

-- 12. RISK ZONES (Geofencing Area Rawan Bencana - Panduan Topik B & F-16)
create table public.risk_zones (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(120) not null,
  hazard_type public.hazard_type not null,
  risk_level  public.risk_level not null default 'medium',
  area        extensions.geometry(Polygon, 4326) not null,
  updated_at  timestamptz not null default now()
);

-- 13. NOTIFICATIONS (Notifikasi Push & Status Update Pengguna - F-32)
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete cascade,
  type        varchar(60) not null,
  title       varchar(160) not null,
  body        text not null,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- 14. MODERATION FLAGS (Laporan Pelanggaran Konten - F-80)
create table public.moderation_flags (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  target_type public.flag_target not null,
  target_id   uuid not null,
  reason      text not null,
  status      public.flag_status not null default 'pending',
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at  timestamptz not null default now()
);

-- 15. AUDIT LOGS (Audit Trail Aktivitas Sistem & Pengelola - F-83)
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid not null references public.profiles(id),
  action      varchar(80) not null,
  entity_type varchar(60) not null,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- 16. EMERGENCY EVENTS (Deklarasi Darurat Kampus & Simulasi Drill - F-60)
create table public.emergency_events (
  id          uuid primary key default gen_random_uuid(),
  event_type  public.emergency_type not null,
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  declared_by uuid not null references public.profiles(id),
  created_at  timestamptz not null default now()
);

-- 17. SAFETY CHECKINS (Check-in 'Saya Aman' / 'Butuh Bantuan' - F-61, Offline Idempotent)
create table public.safety_checkins (
  id            uuid primary key, -- UUID digenerate di klien untuk antrean offline idempoten
  user_id       uuid not null references public.profiles(id) on delete cascade,
  event_id      uuid not null references public.emergency_events(id) on delete cascade,
  status        public.checkin_status not null default 'safe',
  help_category public.help_category,
  location      extensions.geometry(Point, 4326),
  created_at    timestamptz not null default now(),
  synced_at     timestamptz,
  unique (event_id, user_id)
);

-- 18. XP LEDGER (Catatan Gamifikasi & Poin Kontribusi - F-70)
create table public.xp_ledger (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete set null,
  source      public.xp_source not null,
  amount      integer not null,
  created_at  timestamptz not null default now()
);

-- 19. ANNOUNCEMENTS (Siaran Pengumuman Resmi Kampus - F-64)
create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid references public.emergency_events(id) on delete cascade,
  title      varchar(160) not null,
  body       text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- =====================================================================
-- INDEKS BASIS DATA
-- =====================================================================

-- Indeks Spasial PostGIS (GIST)
create index idx_incidents_location on public.incidents using gist (location);
create index idx_reports_location   on public.reports using gist (location);
create index idx_safety_assets_geo  on public.safety_assets using gist (geometry);
create index idx_evac_routes_geo    on public.evacuation_routes using gist (geometry);
create index idx_risk_zones_area    on public.risk_zones using gist (area);
create index idx_checkins_location  on public.safety_checkins using gist (location);

-- Indeks Integritas Bisnis
create unique index uq_user_primary_role on public.user_roles (user_id) where is_primary;
create unique index uq_report_confirm    on public.reports (incident_id, user_id) where report_type = 'confirmation';

-- Indeks Kueri Performa & Foreign Key
create index idx_incidents_status       on public.incidents (status, category);
create index idx_incidents_created_by   on public.incidents (created_by);
create index idx_incidents_unit         on public.incidents (assigned_unit_id);
create index idx_reports_incident       on public.reports (incident_id);
create index idx_reports_user           on public.reports (user_id);
create index idx_attachments_report     on public.report_attachments (report_id);
create index idx_status_events_inc      on public.status_events (incident_id, created_at);
create index idx_notifications_user     on public.notifications (user_id, read_at);
create index idx_xp_ledger_user         on public.xp_ledger (user_id, created_at);
create index idx_checkins_event_status  on public.safety_checkins (event_id, status);
create index idx_checkins_pending       on public.safety_checkins (synced_at) where synced_at is null;

-- =====================================================================
-- ATOMIC RPC FUNCTIONS (Pencegah Desinkronisasi Metadata & File)
-- =====================================================================

-- RPC 1: submit_report (Pencatatan Atomik Insiden, Laporan, dan Antrean File)
create or replace function public.submit_report(
  p_category public.incident_category,
  p_longitude double precision,
  p_latitude double precision,
  p_severity public.incident_severity,
  p_description varchar(280),
  p_blocks_evacuation boolean default false,
  p_incident_id uuid default null,
  p_report_type public.report_type default 'initial',
  p_photo_file_bytes integer default null,
  p_photo_mime varchar(50) default null
)
returns jsonb as $$
declare
  v_incident_id uuid;
  v_report_id uuid;
  v_attachment_id uuid := null;
  v_storage_path text := null;
  v_location extensions.geometry(Point, 4326);
  v_caller_id uuid;
begin
  v_caller_id := (select auth.uid());
  if v_caller_id is null then
    raise exception 'Unauthorized: Operasi memerlukan autentikasi login.';
  end if;

  v_location := extensions.st_setsrid(extensions.st_makepoint(p_longitude, p_latitude), 4326);

  -- Tentukan apakah ini insiden baru atau laporan/konfirmasi pada insiden yang ada
  if p_incident_id is not null then
    v_incident_id := p_incident_id;
  else
    insert into public.incidents (
      category, location, severity, status, blocks_evacuation, created_by
    ) values (
      p_category, v_location, p_severity, 'reported', p_blocks_evacuation, v_caller_id
    ) returning id into v_incident_id;

    -- Rekam event status awal
    insert into public.status_events (
      incident_id, from_status, to_status, changed_by, note
    ) values (
      v_incident_id, null, 'reported', v_caller_id, 'Laporan awal dibuat warga'
    );
  end if;

  -- Buat entitas laporan
  insert into public.reports (
    incident_id, user_id, report_type, description, location, brings_new_info
  ) values (
    v_incident_id, v_caller_id, p_report_type, p_description, v_location, true
  ) returning id into v_report_id;

  -- Jika ada foto yang akan diunggah, siapkan rekaman attachment 'pending'
  if p_photo_file_bytes is not null and p_photo_mime is not null then
    v_storage_path := v_caller_id::text || '/' || gen_random_uuid()::text || 
      case 
        when p_photo_mime = 'image/png' then '.png'
        when p_photo_mime = 'image/webp' then '.webp'
        else '.jpg'
      end;

    insert into public.report_attachments (
      report_id, storage_path, file_bytes, mime_type, photo_status
    ) values (
      v_report_id, v_storage_path, p_photo_file_bytes, p_photo_mime, 'pending'
    ) returning id into v_attachment_id;
  end if;

  return jsonb_build_object(
    'incident_id', v_incident_id,
    'report_id', v_report_id,
    'attachment_id', v_attachment_id,
    'storage_path', v_storage_path
  );
end;
$$ language plpgsql security invoker set search_path = public;

-- RPC 2: confirm_photo_upload (Konfirmasi Berkas Berhasil Terunggah)
create or replace function public.confirm_photo_upload(
  p_attachment_id uuid,
  p_sha256 varchar(64) default null
)
returns boolean as $$
declare
  v_caller_id uuid;
  v_report_owner uuid;
begin
  v_caller_id := (select auth.uid());
  if v_caller_id is null then
    raise exception 'Unauthorized.';
  end if;

  select r.user_id into v_report_owner
  from public.report_attachments a
  join public.reports r on r.id = a.report_id
  where a.id = p_attachment_id;

  if v_report_owner is null or v_report_owner <> v_caller_id then
    raise exception 'Forbidden: Anda bukan pemilik berkas laporan ini.';
  end if;

  update public.report_attachments
  set photo_status = 'ready',
      sha256 = coalesce(p_sha256, sha256),
      uploaded_at = now()
  where id = p_attachment_id;

  return true;
end;
$$ language plpgsql security invoker set search_path = public;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Aktifkan RLS di seluruh tabel publik
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.units enable row level security;
alter table public.incidents enable row level security;
alter table public.reports enable row level security;
alter table public.report_attachments enable row level security;
alter table public.status_events enable row level security;
alter table public.safety_assets enable row level security;
alter table public.evacuation_routes enable row level security;
alter table public.risk_zones enable row level security;
alter table public.notifications enable row level security;
alter table public.moderation_flags enable row level security;
alter table public.audit_logs enable row level security;
alter table public.emergency_events enable row level security;
alter table public.safety_checkins enable row level security;
alter table public.xp_ledger enable row level security;
alter table public.announcements enable row level security;

-- PROFILES
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- USER ROLES
create policy "User roles viewable by everyone"
  on public.user_roles for select
  to anon, authenticated
  using (true);

create policy "Only admin can manage user roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(array['admin'::public.user_role]))
  with check (public.has_role(array['admin'::public.user_role]));

-- UNITS
create policy "Units viewable by everyone"
  on public.units for select
  to anon, authenticated
  using (true);

-- INCIDENTS
create policy "Incidents are viewable by everyone"
  on public.incidents for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can create incidents"
  on public.incidents for insert
  to authenticated
  with check ((select auth.uid()) = created_by);

create policy "Staff, pengelola, or admin can update incidents"
  on public.incidents for update
  to authenticated
  using (
    (select auth.uid()) = created_by or 
    public.has_role(array['staff'::public.user_role, 'pengelola'::public.user_role, 'admin'::public.user_role])
  )
  with check (
    (select auth.uid()) = created_by or 
    public.has_role(array['staff'::public.user_role, 'pengelola'::public.user_role, 'admin'::public.user_role])
  );

-- REPORTS
create policy "Reports are viewable by everyone"
  on public.reports for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert reports"
  on public.reports for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own reports"
  on public.reports for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- REPORT ATTACHMENTS
create policy "Ready attachments viewable by everyone"
  on public.report_attachments for select
  to anon, authenticated
  using (photo_status = 'ready' or exists (
    select 1 from public.reports r 
    where r.id = report_id and r.user_id = (select auth.uid())
  ));

create policy "Report owner can insert attachment"
  on public.report_attachments for insert
  to authenticated
  with check (exists (
    select 1 from public.reports r 
    where r.id = report_id and r.user_id = (select auth.uid())
  ));

create policy "Report owner can update attachment"
  on public.report_attachments for update
  to authenticated
  using (exists (
    select 1 from public.reports r 
    where r.id = report_id and r.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.reports r 
    where r.id = report_id and r.user_id = (select auth.uid())
  ));

-- STATUS EVENTS
create policy "Status events viewable by everyone"
  on public.status_events for select
  to anon, authenticated
  using (true);

create policy "Staff, pengelola, or admin can insert status events"
  on public.status_events for insert
  to authenticated
  with check (
    public.has_role(array['staff'::public.user_role, 'pengelola'::public.user_role, 'admin'::public.user_role]) or
    exists (select 1 from public.incidents i where i.id = incident_id and i.created_by = (select auth.uid()))
  );

-- KESIAPSIAGAAN STATIS & RISK ZONES
create policy "Safety assets viewable by everyone"
  on public.safety_assets for select
  to anon, authenticated
  using (true);

create policy "Evacuation routes viewable by everyone"
  on public.evacuation_routes for select
  to anon, authenticated
  using (true);

create policy "Risk zones viewable by everyone"
  on public.risk_zones for select
  to anon, authenticated
  using (true);

-- NOTIFICATIONS
create policy "Users can read own notifications"
  on public.notifications for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- MODERATION FLAGS
create policy "Users can insert moderation flags"
  on public.moderation_flags for insert
  to authenticated
  with check ((select auth.uid()) = reporter_id);

create policy "Moderators and admins can view flags"
  on public.moderation_flags for select
  to authenticated
  using (
    (select auth.uid()) = reporter_id or
    public.has_role(array['moderator'::public.user_role, 'admin'::public.user_role])
  );

create policy "Moderators and admins can update flags"
  on public.moderation_flags for update
  to authenticated
  using (public.has_role(array['moderator'::public.user_role, 'admin'::public.user_role]))
  with check (public.has_role(array['moderator'::public.user_role, 'admin'::public.user_role]));

-- AUDIT LOGS
create policy "Admins can view audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.has_role(array['admin'::public.user_role]));

create policy "Authenticated users can append audit logs"
  on public.audit_logs for insert
  to authenticated
  with check ((select auth.uid()) = actor_id);

-- EMERGENCY EVENTS & ANNOUNCEMENTS
create policy "Emergency events viewable by everyone"
  on public.emergency_events for select
  to anon, authenticated
  using (true);

create policy "Wardens, staff, and admin can create emergency events"
  on public.emergency_events for insert
  to authenticated
  with check (public.has_role(array['floor_warden'::public.user_role, 'staff'::public.user_role, 'admin'::public.user_role]));

create policy "Announcements viewable by everyone"
  on public.announcements for select
  to anon, authenticated
  using (true);

create policy "Staff and admin can create announcements"
  on public.announcements for insert
  to authenticated
  with check (public.has_role(array['staff'::public.user_role, 'admin'::public.user_role]));

-- SAFETY CHECKINS (Offline-First)
create policy "Checkins viewable by wardens, staff, and admin"
  on public.safety_checkins for select
  to authenticated
  using (
    (select auth.uid()) = user_id or
    public.has_role(array['floor_warden'::public.user_role, 'staff'::public.user_role, 'admin'::public.user_role])
  );

create policy "Users can insert own checkin"
  on public.safety_checkins for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own checkin"
  on public.safety_checkins for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- XP LEDGER
create policy "XP ledger viewable by user and public leaderboard"
  on public.xp_ledger for select
  to anon, authenticated
  using (true);

-- =====================================================================
-- STORAGE BUCKET & STORAGE POLICIES
-- =====================================================================

-- Buat bucket report-photos (Public Read, Max 10MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-photos',
  'report-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS: Public Read
create policy "Report photos are publicly accessible"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'report-photos');

-- Storage RLS: Owner Insert
create policy "Users can upload photos to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'report-photos' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Storage RLS: Owner Update (Upsert butuh INSERT + SELECT + UPDATE)
create policy "Users can update photos in their own folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'report-photos' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'report-photos' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Storage RLS: Owner Delete
create policy "Users can delete photos in their own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'report-photos' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );
