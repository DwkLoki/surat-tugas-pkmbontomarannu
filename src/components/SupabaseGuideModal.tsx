"use client";

import React, { useState } from "react";
import { Check, Copy, ExternalLink, HelpCircle, X, Database } from "lucide-react";

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
}

export function SupabaseGuideModal({
  isOpen,
  onClose,
  isConnected,
}: SupabaseGuideModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- 1. Buat Tabel surat_tugas
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

-- 2. Aktifkan Row Level Security (RLS)
alter table public.surat_tugas enable row level security;

-- 3. Kebijakan Akses Tanpa Login (CRUD)
create policy "Akses Publik Baca Surat" on public.surat_tugas for select using (true);
create policy "Akses Publik Tambah Surat" on public.surat_tugas for insert with check (true);
create policy "Akses Publik Edit Surat" on public.surat_tugas for update using (true) with check (true);
create policy "Akses Publik Hapus Surat" on public.surat_tugas for delete using (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Panduan Setup Supabase (Gratis)
              </h3>
              <p className="text-xs text-gray-500">
                Khusus Frontend Developer: Mudah, tanpa perlu coding backend!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="mt-4">
          {isConnected ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-sm text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5 animate-pulse" />
              <strong>Status: Terhubung ke Supabase Cloud!</strong> Data Anda tersimpan aman di cloud.
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center text-sm text-amber-800">
              <HelpCircle className="w-5 h-5 text-amber-600 mr-2 shrink-0" />
              <span>
                Saat ini aplikasi berjalan dalam <strong>Mode Lokal (Browser Storage)</strong>. Ikuti 4 langkah di bawah ini untuk menghubungkan ke Supabase.
              </span>
            </div>
          )}
        </div>

        {/* Content Steps */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 text-sm text-gray-700">
          {/* Langkah 1 */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center mr-2">
                1
              </span>
              Buat Project di Supabase (Gratis)
            </h4>
            <p className="mt-1 text-xs text-gray-600">
              Buka website Supabase, daftar/login (bisa dengan GitHub atau Google), lalu klik tombol <strong>New Project</strong>.
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-2"
            >
              Buka Supabase Dashboard <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>

          {/* Langkah 2 */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center mr-2">
                2
              </span>
              Jalankan Skrip Database (SQL Editor)
            </h4>
            <p className="mt-1 text-xs text-gray-600">
              Di sidebar kiri Supabase, klik menu <strong>SQL Editor</strong>, lalu klik <strong>New Query</strong>. Copy skrip SQL berikut lalu klik tombol <strong>RUN</strong> di pojok kanan bawah:
            </p>
            <div className="relative mt-2">
              <pre className="bg-gray-900 text-gray-200 p-3 rounded-lg text-xs overflow-x-auto max-h-36 font-mono">
                {sqlCode}
              </pre>
              <button
                onClick={copySql}
                className="absolute top-2 right-2 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs flex items-center transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Salin SQL
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Langkah 3 */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center mr-2">
                3
              </span>
              Ambil Project URL & Anon Key
            </h4>
            <p className="mt-1 text-xs text-gray-600">
              Di Supabase, klik icon roda gigi (<strong>Project Settings</strong>) di pojok kiri bawah &gt; pilih menu <strong>API</strong>. Salin dua nilai berikut:
            </p>
            <ul className="list-disc list-inside text-xs text-gray-600 mt-1 space-y-0.5">
              <li><strong>Project URL</strong> (contoh: <code>https://xyzcompany.supabase.co</code>)</li>
              <li><strong>Project API Keys: anon public</strong></li>
            </ul>
          </div>

          {/* Langkah 4 */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center mr-2">
                4
              </span>
              Buat File <code>.env.local</code> di Project Ini
            </h4>
            <p className="mt-1 text-xs text-gray-600">
              Buat file bernama <code>.env.local</code> di root folder project Anda (satu folder dengan package.json), lalu isi dengan:
            </p>
            <pre className="bg-gray-900 text-emerald-300 p-2.5 rounded-lg text-xs mt-2 font-mono">
              {`NEXT_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...kunci_anon_anda`}
            </pre>
            <p className="text-[11px] text-gray-500 mt-1">
              Setelah menyimpan file <code>.env.local</code>, restart terminal Next.js (<code>npm run dev</code>). Sistem langsung terhubung otomatis!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition"
          >
            Mengerti, Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
}
