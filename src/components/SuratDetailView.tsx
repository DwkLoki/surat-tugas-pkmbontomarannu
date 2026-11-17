"use client";

import React from "react";
import { SuratTugas } from "@/types/surat";
import { SuratDocument } from "./SuratDocument";
import { exportSuratToExcel } from "@/lib/excel-export";
import { ArrowLeft, Printer, Download, Edit3 } from "lucide-react";

interface SuratDetailViewProps {
  surat: SuratTugas;
  onBack: () => void;
  onEdit: (surat: SuratTugas) => void;
}

export function SuratDetailView({
  surat,
  onBack,
  onEdit,
}: SuratDetailViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = async () => {
    try {
      await exportSuratToExcel(surat);
    } catch (err) {
      console.error("Gagal export excel:", err);
      alert("Terjadi kesalahan saat mengekspor ke Excel");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Action Bar (Hidden on print) */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-100 transition self-start"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>
            Kembali<span className="hidden sm:inline"> ke Katalog</span>
          </span>
        </button>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={() => onEdit(surat)}
            className="col-span-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition border border-blue-200"
          >
            <Edit3 className="w-4 h-4 shrink-0" />
            <span>Edit</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="col-span-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition border border-teal-200"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>
              Excel<span className="hidden sm:inline"> (.xlsx)</span>
            </span>
          </button>

          <button
            onClick={handlePrint}
            className="col-span-2 sm:col-span-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Notice info on print tip */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 print:hidden flex items-center justify-between">
        <span>
          💡 <strong>Tips Cetak:</strong> Klik tombol <em>Cetak / Simpan PDF</em>. Pada jendela print browser, pilih <strong>Destination: Save as PDF</strong> atau pilih printer Anda. Pastikan opsi <em>Background graphics</em> dicentang.
        </span>
      </div>

      {/* Official Document */}
      <div className="space-y-1">
        <div className="md:hidden text-center text-[11px] text-gray-500 print:hidden">
          ↔ Geser ke samping untuk melihat lembar surat penuh
        </div>
        <div className="overflow-x-auto pb-8 print:p-0 print:m-0 print:overflow-visible">
          <SuratDocument surat={surat} />
        </div>
      </div>
    </div>
  );
}
