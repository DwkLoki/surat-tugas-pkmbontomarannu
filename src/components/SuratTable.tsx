"use client";

import React, { useState, useMemo } from "react";
import { SuratTugas } from "@/types/surat";
import { formatTanggalIndo, formatDaftarTanggal } from "@/lib/utils";
import {
  FileText,
  Printer,
  Download,
  Edit3,
  Trash2,
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  Layers,
  Clock,
  ChevronDown,
} from "lucide-react";

interface SuratTableProps {
  suratList: SuratTugas[];
  onView: (surat: SuratTugas) => void;
  onEdit: (surat: SuratTugas) => void;
  onDelete: (surat: SuratTugas) => void;
  onDownloadExcel: (surat: SuratTugas) => void;
  onCreateNew: () => void;
}

export function SuratTable({
  suratList,
  onView,
  onEdit,
  onDelete,
  onDownloadExcel,
  onCreateNew,
}: SuratTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDana, setSelectedDana] = useState<string>("ALL");

  // Filtering
  const filteredList = useMemo(() => {
    return suratList.filter((s) => {
      const matchSearch =
        s.nomorSurat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.maksudPerjalanan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tempatTujuan?.some((t) =>
          t.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        s.petugasDitugaskan?.some((p) =>
          p.nama?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchDana =
        selectedDana === "ALL" || s.dibebankanPada === selectedDana;

      return matchSearch && matchDana;
    });
  }, [suratList, searchTerm, selectedDana]);

  // Statistik Ringkas
  const totalSurat = suratList.length;
  const totalJkn = suratList.filter(
    (s) => s.dibebankanPada === "JKN Kapitasi"
  ).length;
  const totalBok = suratList.filter((s) =>
    s.dibebankanPada?.toLowerCase().includes("bok")
  ).length;

  return (
    <div className="space-y-6">
      {/* KARTU STATISTIK */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalSurat}</div>
            <div className="text-xs text-gray-500 font-medium">
              Total Surat Tugas Terbit
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalJkn}</div>
            <div className="text-xs text-gray-500 font-medium">
              Sumber Dana JKN Kapitasi
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalBok}</div>
            <div className="text-xs text-gray-500 font-medium">
              Sumber Dana BOK / Non Fisik
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & PENCARIAN */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Input Pencarian */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Cari nomor surat, nama pegawai, atau tujuan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>

        {/* Filter Sumber Dana & Tombol Buat */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="relative">
              <select
                value={selectedDana}
                onChange={(e) => setSelectedDana(e.target.value)}
                className="appearance-none pl-3.5 pr-9 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden cursor-pointer transition"
              >
                <option value="ALL">Semua Sumber Dana</option>
                <option value="JKN Kapitasi">JKN Kapitasi</option>
                <option value="BOK (Non Fisik)">BOK (Non Fisik)</option>
                <option value="DAK Fisik">DAK Fisik</option>
                <option value="APBD">APBD</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition shrink-0"
          >
            + Buat Surat
          </button>
        </div>
      </div>

      {/* TABEL KATALOG */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">
              Belum ada surat tugas ditemukan
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              {searchTerm || selectedDana !== "ALL"
                ? "Tidak ada hasil yang sesuai dengan kata kunci atau filter pencarian Anda."
                : "Mulai buat surat tugas pertama Anda dengan menekan tombol di bawah."}
            </p>
            {searchTerm || selectedDana !== "ALL" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDana("ALL");
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Reset Filter
              </button>
            ) : (
              <button
                onClick={onCreateNew}
                className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition shadow-xs"
              >
                Buat Surat Tugas Baru
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50/80 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 w-48">No. & Tanggal Surat</th>
                  <th className="px-4 py-4 w-64">Petugas Ditugaskan</th>
                  <th className="px-4 py-4">Maksud & Tujuan Perjalanan</th>
                  <th className="px-4 py-4 w-44">Jadwal & Sumber Dana</th>
                  <th className="px-5 py-4 text-right w-44">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.map((surat) => (
                  <tr
                    key={surat.id}
                    className="hover:bg-gray-50/80 transition group"
                  >
                    {/* No & Tanggal Surat */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                        {surat.nomorSurat}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1 flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{formatTanggalIndo(surat.tanggalSurat)}</span>
                      </div>
                    </td>

                    {/* Petugas Ditugaskan */}
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1">
                        {(surat.petugasDitugaskan || []).map((p, idx) => (
                          <div
                            key={idx}
                            className="text-xs font-medium text-gray-900 flex items-center space-x-1.5"
                          >
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{p.nama}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1.5 flex items-center space-x-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span>
                          {surat.petugasDitugaskan?.length || 0} orang ditugaskan
                        </span>
                      </div>
                    </td>

                    {/* Maksud & Tujuan */}
                    <td className="px-4 py-4 align-top">
                      <div className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">
                        {surat.maksudPerjalanan}
                      </div>
                      <div className="text-[11px] text-gray-600 mt-1.5 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium text-emerald-800 line-clamp-1">
                          {(surat.tempatTujuan || []).join(", ")}
                        </span>
                      </div>
                    </td>

                    {/* Jadwal & Sumber Dana */}
                    <td className="px-4 py-4 align-top space-y-1.5">
                      <div className="text-xs font-medium text-gray-800">
                        {formatDaftarTanggal(surat.tanggalPerjalanan)}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Durasi: {surat.lamanya}
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {surat.dibebankanPada}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-4 align-top text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Tombol Cetak / PDF */}
                        <button
                          onClick={() => onView(surat)}
                          className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                          title="Lihat & Cetak Surat / Simpan PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Tombol Unduh Excel */}
                        <button
                          onClick={() => onDownloadExcel(surat)}
                          className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition"
                          title="Unduh File Excel (.xlsx Asli)"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Tombol Edit */}
                        <button
                          onClick={() => onEdit(surat)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Surat"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => onDelete(surat)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Surat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
