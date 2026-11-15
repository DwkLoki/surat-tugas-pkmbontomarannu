export interface Pegawai {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  pangkatGol?: string;
}

export interface PejabatPenandatangan {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  pangkatGol: string;
}

export type SumberDana =
  | "JKN Kapitasi"
  | "BOK (Non Fisik)"
  | "DAK Fisik"
  | "APBD"
  | "Lainnya";

export interface SuratTugas {
  id: string;
  nomorUrut: number;
  nomorSurat: string;
  nomorDpa: string;
  maksudPerjalanan: string;
  tempatTujuan: string[];
  lamanya: string;
  tanggalPerjalanan: string[]; // Format: YYYY-MM-DD
  dibebankanPada: string;
  tanggalSurat: string; // Format: YYYY-MM-DD
  pejabatPenandatangan: PejabatPenandatangan;
  petugasDitugaskan: Pegawai[]; // Maksimal 7 orang
  createdAt: string;
  updatedAt: string;
}

export type SuratTugasInput = Omit<SuratTugas, "id" | "createdAt" | "updatedAt">;

export interface ScheduleConflict {
  petugasId: string;
  petugasNama: string;
  tanggal: string;
  nomorSurat: string;
  suratId: string;
}
