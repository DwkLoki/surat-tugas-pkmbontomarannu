-- ==============================================================
-- SKRIP DATABASE SUPABASE - SISTEM SURAT TUGAS PUSKESMAS BONTOMARANNU
-- ==============================================================
-- Panduan untuk Frontend Developer:
-- 1. Buka dashboard Supabase (https://supabase.com/dashboard)
-- 2. Pilih Project Anda
-- 3. Di menu sidebar kiri, klik icon "SQL Editor"
-- 4. Klik "New query"
-- 5. Copy seluruh isi file ini, paste ke SQL Editor, lalu klik tombol "RUN" (di pojok kanan bawah)
-- ==============================================================

-- 1. Buat Tabel surat_tugas
create table if not exists public.surat_tugas (
  id uuid primary key default gen_random_uuid(),
  nomor_urut integer not null,
  nomor_surat text not null,
  nomor_dpa text not null,
  maksud_perjalanan text not null,
  tempat_tujuan text[] not null,
  lamanya text not null,
  tanggal_perjalanan date[] not null,
  dibebankan_pada text not null,
  tanggal_surat date not null,
  pejabat_penandatangan jsonb not null,
  petugas_ditugaskan jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Buat Index untuk pencarian cepat
create index if not exists idx_surat_tugas_nomor on public.surat_tugas (nomor_surat);
create index if not exists idx_surat_tugas_tanggal_surat on public.surat_tugas (tanggal_surat);

-- 3. Aktifkan Row Level Security (RLS)
alter table public.surat_tugas enable row level security;

-- 4. Karena sistem ini tanpa login (sesuai kebutuhan client dan budget),
-- buat policy agar aplikasi bisa membaca, menambah, mengubah, dan menghapus surat tugas
create policy "Akses Publik Baca Surat" 
  on public.surat_tugas 
  for select 
  using (true);

create policy "Akses Publik Tambah Surat" 
  on public.surat_tugas 
  for insert 
  with check (true);

create policy "Akses Publik Edit Surat" 
  on public.surat_tugas 
  for update 
  using (true)
  with check (true);

create policy "Akses Publik Hapus Surat" 
  on public.surat_tugas 
  for delete 
  using (true);

-- Selesai! Tabel siap digunakan oleh aplikasi Next.js Anda.
