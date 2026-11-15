# Sistem Generator Surat Tugas UPT Puskesmas Bontomarannu

Aplikasi web modern berbasis Next.js 16 (App Router), React 19, dan Tailwind CSS untuk pembuatan, manajemen, dan pencetakan Surat Tugas dinas secara otomatis di lingkungan UPT Puskesmas Bontomarannu, Kab. Takalar.

---

## Fitur Utama

1. **Auto-Generate Nomor Surat Dinas:**
   - Format standar: `01 / PKM-BM / X / 2026`
   - Nomor urut otomatis per tahun, bulan angka Romawi otomatis, dan tetap dapat diedit manual jika diperlukan.
2. **Validasi Anti-Bentrok Jadwal:**
   - Aturan: *1 orang cuma bisa berkegiatan 1 kali sehari*.
   - Sistem mendeteksi otomatis jika pegawai yang dipilih sudah memiliki surat tugas di tanggal yang sama.
3. **Multi-Input Fleksibel:**
   - Pemilihan staf (maksimal 7 orang) dari daftar master pegawai (otomatis mengisi NIP & Jabatan).
   - Multi-tujuan (dipisahkan koma, cth: *Desa Untia, Desa Bontoa, Kantor BKAD*).
   - Multi-jadwal/tanggal kegiatan.
   - Pilihan sumber dana: *JKN Kapitasi, BOK (Non Fisik), DAK Fisik, APBD, dll*.
4. **Dua Mode Output:**
   - **Cetak / PDF Presisi:** Tampilan cetak resmi standar dinas dengan Kop, Logo Takalar, tabel rapi, dan tanda tangan (dukungan kertas A4 / F4 Folio via `@media print`).
   - **Unduh File Excel (.xlsx Asli):** Mengisi langsung ke dalam format template Excel resmi klien.
5. **Katalog & Riwayat Surat:**
   - Filter pencarian instan (berdasarkan nomor surat, nama pegawai, atau tujuan).
   - Filter berdasarkan sumber dana.
   - Aksi: Lihat/Cetak, Download Excel, Edit, Hapus.
6. **Dual Storage Mode (Tanpa Ribet Backend):**
   - **Mode Supabase Cloud (Gratis):** Data tersimpan di cloud & sinkron di semua komputer puskesmas.
   - **Mode Lokal (Fallback):** Tetap berjalan otomatis via browser storage jika Supabase belum dikonfigurasi.

---

## Panduan Cepat Menjalankan Aplikasi

1. **Jalankan Aplikasi di Komputer Anda:**
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

2. **Melihat / Menguji Fitur:**
   Aplikasi sudah terisi 1 data contoh sesuai surat asli klien. Anda bisa langsung mencoba fitur:
   - Klik tombol **Lihat & Cetak (icon printer)** untuk melihat lembar surat tugas resmi.
   - Klik tombol **Unduh Excel (icon download)** untuk mengunduh berkas `.xlsx`.
   - Klik **+ Buat Surat** untuk mencoba validasi bentrok jadwal dan auto penomoran.

---

## Panduan Lengkap Setup Supabase (Gratis, Khusus Frontend)

Sistem ini tidak membutuhkan coding backend sama sekali. Untuk menghubungkan ke database cloud Supabase:

1. **Buat Akun & Project Baru:**
   - Buka [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Login dengan GitHub / Google, lalu klik **"New Project"**.
   - Beri nama (misal: `puskesmas-surat-tugas`) dan masukkan password database.

2. **Buat Tabel via SQL Editor (1 Klik):**
   - Di dashboard Supabase, buka menu **SQL Editor** (icon `>_` di sidebar kiri).
   - Buka file `supabase/schema.sql` di proyek ini, copy seluruh kodenya.
   - Paste ke dalam SQL Editor Supabase, lalu klik tombol hijau **"Run"** di pojok kanan bawah.

3. **Ambil Kunci API Supabase:**
   - Masuk ke **Project Settings** (icon gerigi di kiri bawah) > pilih tab **API**.
   - Salin **Project URL** dan **Project API Keys (anon public)**.

4. **Hubungkan ke Aplikasi:**
   - Buat file `.env.local` di root folder proyek ini:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     ```
   - Restart server: `npm run dev`. Status di header aplikasi akan otomatis berubah menjadi **"Supabase Cloud"** warna hijau!

---

## Mengubah / Menambah Daftar Pegawai

Seluruh daftar pegawai puskesmas disimpan rapi di file:
`src/data/pegawai.ts`

Anda bisa menambahkan seluruh nama staf puskesmas lengkap beserta NIP dan Jabatannya di file tersebut.
