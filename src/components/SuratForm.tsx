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
  formatTerbilangHari,
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
  ChevronDown,
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

  // Multi-tanggal kegiatan
  const [tanggalPerjalananList, setTanggalPerjalananList] = useState<string[]>(
    initialData?.tanggalPerjalanan && initialData.tanggalPerjalanan.length > 0
      ? initialData.tanggalPerjalanan
      : [todayStr]
  );

  // Status dan nilai manual untuk kolom "lamanya"
  const initialIsManualLamanya = useMemo(() => {
    if (!initialData?.lamanya) return false;
    const initialAuto = formatTerbilangHari(
      initialData.tanggalPerjalanan?.length || 1
    );
    return initialData.lamanya !== initialAuto;
  }, [initialData]);

  const [isManualLamanya, setIsManualLamanya] =
    useState<boolean>(initialIsManualLamanya);
  const [customLamanya, setCustomLamanya] = useState<string>(
    initialData?.lamanya || ""
  );

  // Kalkulasi otomatis lamanya perjalanan berdasarkan jumlah tanggal kegiatan
  const autoLamanya = useMemo(() => {
    const validCount = tanggalPerjalananList.filter(Boolean).length;
    return formatTerbilangHari(validCount || 1);
  }, [tanggalPerjalananList]);

  // Nilai aktif untuk lamanya perjalanan
  const activeLamanya = useMemo(() => {
    if (isManualLamanya) {
      return customLamanya;
    }
    return autoLamanya;
  }, [isManualLamanya, customLamanya, autoLamanya]);

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
      lamanya: activeLamanya.trim(),
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
      <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
          <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
          <span>
            {initialData ? "Edit Surat Tugas" : "Formulir Surat Tugas Baru"}
          </span>
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Lengkapi isian di bawah ini. Nomor surat digenerate otomatis dan layout cetak disesuaikan dengan standar UPT Puskesmas Bontomarannu.
        </p>
      </div>

      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-0 mb-3">
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
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition border border-emerald-200 self-start sm:self-auto shrink-0"
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
                    "p-3 sm:p-3.5 rounded-xl border transition flex flex-col space-y-2",
                    employeeConflict
                      ? "border-rose-400 bg-rose-50/70 shadow-xs"
                      : "border-gray-200 bg-gray-50/70 hover:bg-white hover:border-gray-300"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <div className="flex items-center space-x-2 md:contents">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0",
                          employeeConflict ? "bg-rose-600" : "bg-emerald-600"
                        )}
                      >
                        {index + 1}
                      </div>

                      {/* Dropdown Master Pegawai */}
                      <div className="flex-1 relative min-w-0">
                        <select
                          value={petugas.id}
                          onChange={(e) =>
                            handleSelectPetugas(index, e.target.value)
                          }
                          className={cn(
                            "appearance-none w-full pl-3.5 pr-9 py-2 bg-white border rounded-lg text-xs sm:text-sm font-medium focus:ring-2 outline-hidden cursor-pointer transition truncate",
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
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
                            employeeConflict ? "text-rose-500" : "text-gray-400"
                          )}
                        />
                      </div>

                      {/* Tombol Hapus (Tampilan Mobile) */}
                      {selectedPetugas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePetugas(index)}
                          className="md:hidden p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition shrink-0"
                          title="Hapus petugas ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Readonly Info: NIP & Jabatan */}
                    <div className="text-xs text-gray-600 pl-9 md:pl-0 md:w-64 truncate">
                      <span className="font-semibold text-gray-800">
                        NIP: {petugas.nip || "-"}
                      </span>
                      <br />
                      <span className="text-gray-500">{petugas.jabatan}</span>
                    </div>

                    {/* Tombol Hapus (Tampilan Desktop) */}
                    {selectedPetugas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePetugas(index)}
                        className="hidden md:block p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition self-center shrink-0"
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Lamanya
                  </label>
                  {isManualLamanya ? (
                    <button
                      type="button"
                      onClick={() => setIsManualLamanya(false)}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Gunakan Otomatis ({autoLamanya})
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomLamanya(activeLamanya);
                        setIsManualLamanya(true);
                      }}
                      className="text-[11px] text-gray-500 hover:text-emerald-600 font-semibold"
                    >
                      Edit Manual
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={activeLamanya}
                    onChange={(e) => {
                      setCustomLamanya(e.target.value);
                      setIsManualLamanya(true);
                    }}
                    placeholder="Contoh: 1 (Satu) Hari"
                    className={cn(
                      "w-full px-3.5 py-2.5 pl-9 border rounded-xl text-sm outline-hidden transition",
                      isManualLamanya
                        ? "bg-white border-emerald-500 text-gray-900 focus:ring-2 focus:ring-emerald-500 font-medium"
                        : "bg-gray-50 border-gray-300 text-gray-800 focus:ring-2 focus:ring-emerald-500"
                    )}
                    required
                  />
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {isManualLamanya ? (
                    <span className="text-amber-700 font-medium">
                      Mode manual aktif.
                    </span>
                  ) : (
                    <span>
                      Otomatis: {tanggalPerjalananList.length} hari kegiatan.
                    </span>
                  )}
                </p>
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
                <div className="relative">
                  <select
                    value={dibebankanPada}
                    onChange={(e) => setDibebankanPada(e.target.value)}
                    className="appearance-none w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition font-medium cursor-pointer"
                  >
                    <option value="JKN Kapitasi">JKN Kapitasi</option>
                    <option value="BOK (Non Fisik)">BOK (Non Fisik)</option>
                    <option value="DAK Fisik">DAK Fisik</option>
                    <option value="APBD">APBD</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pejabat yang Menandatangani
                </label>
                <div className="relative">
                  <select
                    value={pejabatPenandatangan.id}
                    onChange={(e) => {
                      const found = DAFTAR_PENANDATANGAN.find(
                        (p) => p.id === e.target.value
                      );
                      if (found) setPejabatPenandatangan(found);
                    }}
                    className="appearance-none w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition font-medium cursor-pointer"
                  >
                    {DAFTAR_PENANDATANGAN.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama} ({p.jabatan})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
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
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
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

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition text-center"
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
                "w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center space-x-2 text-center",
                hasConflicts
                  ? "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg disabled:opacity-50"
              )}
            >
              {hasConflicts ? (
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              ) : (
                <Check className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate">
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
