"use client";

import React, { useState, useMemo } from "react";
import {
  SuratTugas,
  SuratTugasInput,
  Pegawai,
  PejabatPenandatangan,
  ScheduleConflict,
} from "@/types/surat";
import { MASTER_PEGAWAI } from "@/data/pegawai";
import { DAFTAR_PENANDATANGAN } from "@/data/penandatangan";
import {
  generateNomorSurat,
  checkScheduleConflicts,
  formatTanggalIndo,
  cn,
} from "@/lib/utils";
import {
  AlertTriangle,
  Calendar,
  Check,
  Plus,
  Trash2,
  MapPin,
  FileCheck,
  Clock,
  ShieldAlert,
} from "lucide-react";

interface SuratFormProps {
  initialData?: SuratTugas | null;
  allSurat: SuratTugas[];
  nextNomorUrut: number;
  onSubmit: (data: SuratTugasInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function SuratForm({
  initialData,
  allSurat,
  nextNomorUrut,
  onSubmit,
  onCancel,
  isSubmitting,
}: SuratFormProps) {
  // Tanggal Hari Ini (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Form States
  const [nomorUrut, setNomorUrut] = useState<number>(
    initialData?.nomorUrut || nextNomorUrut
  );
  const [tanggalSurat, setTanggalSurat] = useState<string>(
    initialData?.tanggalSurat || todayStr
  );
  const [isManualNomor, setIsManualNomor] = useState<boolean>(false);
  const [customNomorSurat, setCustomNomorSurat] = useState<string>(
    initialData?.nomorSurat || ""
  );

  const [nomorDpa, setNomorDpa] = useState<string>(
    initialData?.nomorDpa || "DPA/A.1/1.02.0.00.0.00.02.0000/001/2026"
  );
  const [maksudPerjalanan, setMaksudPerjalanan] = useState<string>(
    initialData?.maksudPerjalanan || ""
  );

  // Multi-tujuan: input comma separated atau tags
  const [tujuanInput, setTujuanInput] = useState<string>(
    initialData?.tempatTujuan?.join(", ") || ""
  );

  const [lamanya, setLamanya] = useState<string>(
    initialData?.lamanya || "1 (Satu) Hari"
  );

  // Multi-tanggal kegiatan
  const [tanggalPerjalananList, setTanggalPerjalananList] = useState<string[]>(
    initialData?.tanggalPerjalanan && initialData.tanggalPerjalanan.length > 0
      ? initialData.tanggalPerjalanan
      : [todayStr]
  );

  const [dibebankanPada, setDibebankanPada] = useState<string>(
    initialData?.dibebankanPada || "JKN Kapitasi"
  );

  const [pejabatPenandatangan, setPejabatPenandatangan] =
    useState<PejabatPenandatangan>(
      initialData?.pejabatPenandatangan || DAFTAR_PENANDATANGAN[0]
    );

  // Pegawai yang ditugaskan (maksimal 7 orang)
  const [selectedPetugas, setSelectedPetugas] = useState<Pegawai[]>(
    initialData?.petugasDitugaskan && initialData.petugasDitugaskan.length > 0
      ? initialData.petugasDitugaskan
      : [MASTER_PEGAWAI[0]]
  );

  // Nomor surat terhitung (jika tidak manual, hitung otomatis)
  const activeNomorSurat = useMemo(() => {
    if (isManualNomor && customNomorSurat) {
      return customNomorSurat;
    }
    if (initialData?.nomorSurat && !isManualNomor) {
      return initialData.nomorSurat;
    }
    return generateNomorSurat(nomorUrut, tanggalSurat);
  }, [
    isManualNomor,
    customNomorSurat,
    initialData?.nomorSurat,
    nomorUrut,
    tanggalSurat,
  ]);

  // Cek bentrok jadwal (1 orang 1 kegiatan per hari)
  const conflicts: ScheduleConflict[] = useMemo(() => {
    return checkScheduleConflicts(
      allSurat,
      selectedPetugas,
      tanggalPerjalananList,
      initialData?.id
    );
  }, [allSurat, selectedPetugas, tanggalPerjalananList, initialData?.id]);

  const hasConflicts = conflicts.length > 0;

  // Handler: Tambah tanggal perjalanan
  const handleAddTanggal = () => {
    setTanggalPerjalananList([...tanggalPerjalananList, todayStr]);
  };

  const handleUpdateTanggal = (index: number, val: string) => {
    const updated = [...tanggalPerjalananList];
    updated[index] = val;
    setTanggalPerjalananList(updated);
  };

  const handleRemoveTanggal = (index: number) => {
    if (tanggalPerjalananList.length <= 1) return;
    setTanggalPerjalananList(
      tanggalPerjalananList.filter((_, i) => i !== index)
    );
  };

  // Handler: Tambah Petugas (Maksimal 7)
  const handleAddPetugas = () => {
    if (selectedPetugas.length >= 7) return;
    // Cari pegawai yang belum terpilih
    const unused = MASTER_PEGAWAI.find(
      (m) => !selectedPetugas.some((p) => p.id === m.id)
    );
    if (unused) {
      setSelectedPetugas([...selectedPetugas, unused]);
    } else {
      setSelectedPetugas([...selectedPetugas, MASTER_PEGAWAI[0]]);
    }
  };

  const handleSelectPetugas = (index: number, pegawaiId: string) => {
    const pegawai = MASTER_PEGAWAI.find((p) => p.id === pegawaiId);
    if (!pegawai) return;
    const updated = [...selectedPetugas];
    updated[index] = pegawai;
    setSelectedPetugas(updated);
  };

  const handleRemovePetugas = (index: number) => {
    if (selectedPetugas.length <= 1) return;
    setSelectedPetugas(selectedPetugas.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // Blokir jika ada bentrok jadwal
    if (hasConflicts) {
      alert(
        "Tidak dapat menyimpan surat tugas!\n\n" +
          "Terdapat bentrok jadwal pada pegawai yang dipilih. Sesuai aturan, 1 orang cuma bisa berkegiatan 1 kali sehari. Harap ubah tanggal kegiatan atau ganti pegawai yang ditugaskan."
      );
      return;
    }

    if (!maksudPerjalanan.trim()) {
      alert("Harap masukkan maksud perjalanan");
      return;
    }

    if (!tujuanInput.trim()) {
      alert("Harap masukkan tempat tujuan");
      return;
    }

    // Split tujuan berdasarkan koma
    const tempatTujuan = tujuanInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (tempatTujuan.length === 0) {
      alert("Harap masukkan minimal satu tempat tujuan");
      return;
    }

    if (selectedPetugas.length === 0) {
      alert("Harap pilih minimal 1 petugas");
      return;
    }

    const payload: SuratTugasInput = {
      nomorUrut,
      nomorSurat: activeNomorSurat.trim(),
      nomorDpa: nomorDpa.trim(),
      maksudPerjalanan: maksudPerjalanan.trim(),
      tempatTujuan,
      lamanya: lamanya.trim(),
      tanggalPerjalanan: tanggalPerjalananList,
      dibebankanPada,
      tanggalSurat,
      pejabatPenandatangan,
      petugasDitugaskan: selectedPetugas,
    };

    await onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmitForm}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Header Form */}
      <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <FileCheck className="w-6 h-6 text-emerald-600" />
          <span>
            {initialData ? "Edit Surat Tugas" : "Formulir Surat Tugas Baru"}
          </span>
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Lengkapi isian di bawah ini. Nomor surat digenerate otomatis dan layout cetak disesuaikan dengan standar UPT Puskesmas Bontomarannu.
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* SECTION 1: NOMOR & IDENTITAS SURAT */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-4 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span>Penomoran & Tanggal Surat</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tanggal Surat Dikeluarkan */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tanggal Surat Dikeluarkan
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Default tanggal hari ini, dapat diedit jika backdate.
              </p>
            </div>

            {/* Nomor Urut */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nomor Urut Surat
              </label>
              <input
                type="number"
                min="1"
                value={nomorUrut}
                onChange={(e) => setNomorUrut(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition"
                required
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Otomatis dihitung dari surat terakhir tahun ini.
              </p>
            </div>

            {/* Nomor Surat Tergenerate */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  Nomor Surat Hasil Generate
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!isManualNomor) {
                      setCustomNomorSurat(activeNomorSurat);
                    }
                    setIsManualNomor(!isManualNomor);
                  }}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  {isManualNomor ? "Gunakan Otomatis" : "Edit Manual"}
                </button>
              </div>
              <input
                type="text"
                value={activeNomorSurat}
                onChange={(e) => {
                  setCustomNomorSurat(e.target.value);
                  setIsManualNomor(true);
                }}
                readOnly={!isManualNomor}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono font-medium transition ${
                  isManualNomor
                    ? "bg-white border-emerald-500 text-gray-900 focus:ring-2 focus:ring-emerald-500"
                    : "bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
                }`}
                required
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Format: <code>01 / PKM-BM / X / 2026</code>
              </p>
            </div>
          </div>

          {/* Nomor DPA */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nomor DPA (Dokumen Pelaksanaan Anggaran)
            </label>
            <input
              type="text"
              value={nomorDpa}
              onChange={(e) => setNomorDpa(e.target.value)}
              placeholder="Contoh: DPA/A.1/1.02.0.00.0.00.02.0000/001/2026"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition font-mono"
              required
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Disisipkan pada butir konsideran ke-3 di lembar surat tugas.
            </p>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* SECTION 2: PEGAWAI YANG DITUGASKAN (MAKSIMAL 7) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Pegawai yang Ditugaskan (Maksimal 7 Orang)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Pilih dari daftar master staf puskesmas untuk mencegah salah ketik nama atau NIP.
              </p>
            </div>
            {selectedPetugas.length < 7 && (
              <button
                type="button"
                onClick={handleAddPetugas}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition border border-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Orang ({selectedPetugas.length}/7)</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {selectedPetugas.map((petugas, index) => {
              // Cek apakah pegawai ini bentrok
              const employeeConflict = conflicts.find(
                (c) => c.petugasId === petugas.id
              );

              return (
                <div
                  key={index}
                  className={cn(
                    "p-3.5 rounded-xl border transition flex flex-col space-y-2",
                    employeeConflict
                      ? "border-rose-400 bg-rose-50/70 shadow-xs"
                      : "border-gray-200 bg-gray-50/70 hover:bg-white hover:border-gray-300"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0",
                        employeeConflict ? "bg-rose-600" : "bg-emerald-600"
                      )}
                    >
                      {index + 1}
                    </div>

                    {/* Dropdown Master Pegawai */}
                    <div className="flex-1">
                      <select
                        value={petugas.id}
                        onChange={(e) =>
                          handleSelectPetugas(index, e.target.value)
                        }
                        className={cn(
                          "w-full px-3 py-2 bg-white border rounded-lg text-sm font-medium focus:ring-2 outline-hidden",
                          employeeConflict
                            ? "border-rose-300 focus:ring-rose-500 text-rose-950 font-semibold"
                            : "border-gray-300 focus:ring-emerald-500"
                        )}
                      >
                        {MASTER_PEGAWAI.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nama} — {m.jabatan}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Readonly Info: NIP & Jabatan */}
                    <div className="text-xs text-gray-600 md:w-64 truncate">
                      <span className="font-semibold text-gray-800">
                        NIP: {petugas.nip || "-"}
                      </span>
                      <br />
                      <span className="text-gray-500">{petugas.jabatan}</span>
                    </div>

                    {/* Tombol Hapus */}
                    {selectedPetugas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePetugas(index)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition self-end md:self-center"
                        title="Hapus petugas ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Indikator Spesifik Pegawai Bentrok */}
                  {employeeConflict && (
                    <div className="ml-0 md:ml-11 flex items-center space-x-1.5 text-xs font-semibold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-lg">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Bentrok jadwal: Sudah ada surat tugas pada tanggal{" "}
                        <u>{formatTanggalIndo(employeeConflict.tanggal)}</u> (No:{" "}
                        {employeeConflict.nomorSurat}).
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* SECTION 3: RINCIAN PERJALANAN DINAS */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 mb-4 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>Rincian & Jadwal Perjalanan</span>
          </h3>

          <div className="space-y-4">
            {/* Maksud Perjalanan */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Maksud Perjalanan
              </label>
              <textarea
                value={maksudPerjalanan}
                onChange={(e) => setMaksudPerjalanan(e.target.value)}
                placeholder="Contoh: Pemutakhiran Realisasi Belanja BOK dan JKN Kapitasi Tahun 2026"
                rows={2}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition"
                required
              />
            </div>

            {/* Tempat Tujuan & Lamanya */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tempat Tujuan (Bisa lebih dari satu, pisahkan dengan koma)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tujuanInput}
                    onChange={(e) => setTujuanInput(e.target.value)}
                    placeholder="Contoh: Desa Untia, Desa Bontoa, Kantor BKAD Kab. Takalar"
                    className="w-full px-3.5 py-2.5 pl-9 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition"
                    required
                  />
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Contoh: <em>Desa Untia, Desa Bontoa, Desa Barangmamase</em>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lamanya
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lamanya}
                    onChange={(e) => setLamanya(e.target.value)}
                    placeholder="Contoh: 1 (Satu) Hari"
                    className="w-full px-3.5 py-2.5 pl-9 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition"
                    required
                  />
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Multi-Tanggal Perjalanan */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Tanggal / Jadwal Perjalanan (Bisa Lebih Dari 1 Tanggal)</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddTanggal}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Tanggal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {tanggalPerjalananList.map((tgl, idx) => {
                  const dateHasConflict = conflicts.some(
                    (c) => c.tanggal === tgl
                  );

                  return (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={tgl}
                        onChange={(e) =>
                          handleUpdateTanggal(idx, e.target.value)
                        }
                        className={cn(
                          "w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 outline-hidden",
                          dateHasConflict
                            ? "border-rose-400 bg-rose-50 text-rose-950 focus:ring-rose-500"
                            : "border-gray-300 focus:ring-emerald-500"
                        )}
                        required
                      />
                      {tanggalPerjalananList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTanggal(idx)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sumber Dana & Pejabat Penandatangan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dibebankan Pada (Sumber Dana)
                </label>
                <select
                  value={dibebankanPada}
                  onChange={(e) => setDibebankanPada(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition font-medium"
                >
                  <option value="JKN Kapitasi">JKN Kapitasi</option>
                  <option value="BOK (Non Fisik)">BOK (Non Fisik)</option>
                  <option value="DAK Fisik">DAK Fisik</option>
                  <option value="APBD">APBD</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pejabat yang Menandatangani
                </label>
                <select
                  value={pejabatPenandatangan.id}
                  onChange={(e) => {
                    const found = DAFTAR_PENANDATANGAN.find(
                      (p) => p.id === e.target.value
                    );
                    if (found) setPejabatPenandatangan(found);
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition font-medium"
                >
                  {DAFTAR_PENANDATANGAN.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.jabatan})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BENTROK JADWAL ALERT BANNER */}
        {hasConflicts && (
          <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 shadow-sm animate-pulse">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold flex items-center space-x-1.5 text-rose-800">
                  <span>JADWAL BENTROK TERDETEKSI (TOMBOL SIMPAN DINONAKTIFKAN)</span>
                </h4>
                <p className="text-xs text-rose-700 mt-1">
                  Sesuai aturan sistem: <strong>1 orang cuma bisa berkegiatan 1 kali sehari</strong>. Tombol simpan dinonaktifkan sampai Anda mengubah tanggal perjalanan atau mengganti pegawai yang bersangkutan:
                </p>
                <ul className="list-disc list-inside text-xs mt-2.5 space-y-1 font-medium bg-white/70 p-3 rounded-lg border border-rose-200">
                  {conflicts.map((c, i) => (
                    <li key={i}>
                      <strong>{c.petugasNama}</strong> telah terdaftar bertugas pada{" "}
                      <strong>{formatTanggalIndo(c.tanggal)}</strong> (Surat No:{" "}
                      <code className="bg-rose-100 text-rose-900 px-1 py-0.5 rounded">
                        {c.nomorSurat}
                      </code>
                      )
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-rose-600 font-semibold mt-2">
                  👉 Silakan ubah tanggal kegiatan atau ganti pegawai di atas agar tombol simpan aktif kembali.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TOMBOL AKSI */}
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status teks info */}
          <div className="text-xs font-medium">
            {hasConflicts ? (
              <span className="text-rose-600 flex items-center space-x-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Harap selesaikan jadwal bentrok sebelum menyimpan.</span>
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tidak ada bentrok jadwal, siap disimpan.</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || hasConflicts}
              title={
                hasConflicts
                  ? "Tombol dinonaktifkan karena terdapat bentrok jadwal pegawai"
                  : undefined
              }
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center space-x-2",
                hasConflicts
                  ? "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg disabled:opacity-50"
              )}
            >
              {hasConflicts ? (
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>
                {isSubmitting
                  ? "Menyimpan..."
                  : hasConflicts
                  ? "Jadwal Bentrok (Perlu Diperbaiki)"
                  : initialData
                  ? "Perbarui Surat Tugas"
                  : "Simpan & Buat Surat"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
