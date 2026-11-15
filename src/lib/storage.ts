import { SuratTugas, SuratTugasInput } from "@/types/surat";
import { supabase, isSupabaseConfigured } from "./supabase";
import { MASTER_PEGAWAI } from "@/data/pegawai";
import { DAFTAR_PENANDATANGAN } from "@/data/penandatangan";

const LOCAL_STORAGE_KEY = "surat_tugas_puskesmas_bomar";

// Data awal contoh (sesuai template screenshot klien)
const SEED_DATA: SuratTugas[] = [
  {
    id: "sample-surat-1",
    nomorUrut: 1,
    nomorSurat: "01 / PKM-BM / X / 2026",
    nomorDpa: "DPA/A.1/1.02.0.00.0.00.02.0000/001/2026",
    maksudPerjalanan:
      "Pemutakhiran Realisasi Belanja BOK dan JKN Kapitasi Tahun 2026",
    tempatTujuan: ["Kantor BKAD Kab. Takalar Bidang Akuntansi"],
    lamanya: "1 (Satu) Hari",
    tanggalPerjalanan: ["2026-10-15"],
    dibebankanPada: "JKN Kapitasi",
    tanggalSurat: "2026-10-15",
    pejabatPenandatangan: DAFTAR_PENANDATANGAN[0],
    petugasDitugaskan: [MASTER_PEGAWAI[0], MASTER_PEGAWAI[1]],
    createdAt: "2026-10-15T08:00:00Z",
    updatedAt: "2026-10-15T08:00:00Z",
  },
];

// Helper: baca dari localStorage
function getLocalData(): SuratTugas[] {
  if (typeof window === "undefined") return SEED_DATA;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Gagal membaca localStorage:", err);
    return SEED_DATA;
  }
}

// Helper: simpan ke localStorage
function saveLocalData(data: SuratTugas[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Gagal menyimpan ke localStorage:", err);
  }
}

// Helper: map DB snake_case ke camelCase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFromDb(row: any): SuratTugas {
  return {
    id: row.id,
    nomorUrut: row.nomor_urut,
    nomorSurat: row.nomor_surat,
    nomorDpa: row.nomor_dpa,
    maksudPerjalanan: row.maksud_perjalanan,
    tempatTujuan: row.tempat_tujuan || [],
    lamanya: row.lamanya,
    tanggalPerjalanan: row.tanggal_perjalanan || [],
    dibebankanPada: row.dibebankan_pada,
    tanggalSurat: row.tanggal_surat,
    pejabatPenandatangan: row.pejabat_penandatangan,
    petugasDitugaskan: row.petugas_ditugaskan || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper: map camelCase ke DB snake_case
function mapToDb(input: SuratTugasInput | SuratTugas) {
  return {
    nomor_urut: input.nomorUrut,
    nomor_surat: input.nomorSurat,
    nomor_dpa: input.nomorDpa,
    maksud_perjalanan: input.maksudPerjalanan,
    tempat_tujuan: input.tempatTujuan,
    lamanya: input.lamanya,
    tanggal_perjalanan: input.tanggalPerjalanan,
    dibebankan_pada: input.dibebankanPada,
    tanggal_surat: input.tanggalSurat,
    pejabat_penandatangan: input.pejabatPenandatangan,
    petugas_ditugaskan: input.petugasDitugaskan,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Ambil semua daftar surat tugas
 */
export async function getSuratList(): Promise<SuratTugas[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("surat_tugas")
        .select("*")
        .order("nomor_urut", { ascending: false });

      if (error) {
        console.warn("Supabase query error, fallback ke local storage:", error.message);
        return getLocalData();
      }
      return (data || []).map(mapFromDb);
    } catch (err) {
      console.warn("Supabase fetch exception, fallback ke local storage:", err);
      return getLocalData();
    }
  }

  return getLocalData();
}

/**
 * Ambil satu surat tugas berdasarkan ID
 */
export async function getSuratById(id: string): Promise<SuratTugas | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("surat_tugas")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        const local = getLocalData();
        return local.find((s) => s.id === id) || null;
      }
      return mapFromDb(data);
    } catch {
      const local = getLocalData();
      return local.find((s) => s.id === id) || null;
    }
  }

  const local = getLocalData();
  return local.find((s) => s.id === id) || null;
}

/**
 * Buat surat tugas baru
 */
export async function createSurat(input: SuratTugasInput): Promise<SuratTugas> {
  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = {
        ...mapToDb(input),
        created_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("surat_tugas")
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return mapFromDb(data);
    } catch (err) {
      console.warn("Supabase insert error, fallback ke local storage:", err);
      // Fallback lanjut ke local storage
    }
  }

  const local = getLocalData();
  const newSurat: SuratTugas = {
    ...input,
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [newSurat, ...local];
  saveLocalData(updated);
  return newSurat;
}

/**
 * Perbarui surat tugas yang ada
 */
export async function updateSurat(
  id: string,
  input: SuratTugasInput
): Promise<SuratTugas> {
  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = mapToDb(input);
      const { data, error } = await supabase
        .from("surat_tugas")
        .update(dbPayload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return mapFromDb(data);
    } catch (err) {
      console.warn("Supabase update error, fallback ke local storage:", err);
    }
  }

  const local = getLocalData();
  const index = local.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error("Surat tidak ditemukan");
  }

  const updatedSurat: SuratTugas = {
    ...input,
    id,
    createdAt: local[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  local[index] = updatedSurat;
  saveLocalData(local);
  return updatedSurat;
}

/**
 * Hapus surat tugas
 */
export async function deleteSurat(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("surat_tugas")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
      return true;
    } catch (err) {
      console.warn("Supabase delete error, fallback ke local storage:", err);
    }
  }

  const local = getLocalData();
  const filtered = local.filter((s) => s.id !== id);
  saveLocalData(filtered);
  return true;
}

/**
 * Dapatkan nomor urut berikutnya berdasarkan tahun
 */
export async function getNextNomorUrut(year: number): Promise<number> {
  const allSurat = await getSuratList();
  const yearSurat = allSurat.filter((s) => {
    const y = s.tanggalSurat ? new Date(s.tanggalSurat).getFullYear() : null;
    return y === year;
  });

  if (yearSurat.length === 0) {
    return 1;
  }

  const maxUrut = Math.max(...yearSurat.map((s) => s.nomorUrut || 0));
  return maxUrut + 1;
}
