import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Pegawai, SuratTugas, ScheduleConflict } from "@/types/surat";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BULAN_INDONESIA = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const ROMAN_MONTHS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

const SATUAN_ANGKA = [
  "",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
];

function angkaKeTerbilang(n: number): string {
  if (n < 12) return SATUAN_ANGKA[n];
  if (n < 20) return `${angkaKeTerbilang(n - 10)} Belas`;
  if (n < 100)
    return `${angkaKeTerbilang(Math.floor(n / 10))} Puluh ${angkaKeTerbilang(
      n % 10
    )}`.trim();
  return `${n}`;
}

/**
 * Format jumlah hari ke format standar dinas:
 * Contoh: 1 -> "1 (Satu) Hari", 2 -> "2 (Dua) Hari", 3 -> "3 (Tiga) Hari"
 */
export function formatTerbilangHari(count: number): string {
  if (count <= 0) return "1 (Satu) Hari";
  const terbilang = angkaKeTerbilang(count);
  return `${count} (${terbilang}) Hari`;
}

/**
 * Format string tanggal YYYY-MM-DD ke format Indonesia (cth: "15 Oktober 2026")
 */
export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  return `${day} ${BULAN_INDONESIA[month] || ""} ${year}`;
}

/**
 * Format gabungan beberapa tanggal perjalanan
 * Contoh: ["2026-10-15", "2026-10-16"] -> "15 dan 16 Oktober 2026" atau "15, 16 Oktober 2026"
 */
export function formatDaftarTanggal(dates: string[]): string {
  if (!dates || dates.length === 0) return "";
  if (dates.length === 1) return formatTanggalIndo(dates[0]);

  // Urutkan tanggal
  const sorted = [...dates].sort();
  return sorted.map((d) => formatTanggalIndo(d)).join(", ");
}

/**
 * Konversi angka bulan (1-12) ke angka Romawi
 */
export function getRomanMonth(monthNumber: number): string {
  if (monthNumber < 1 || monthNumber > 12) return "I";
  return ROMAN_MONTHS[monthNumber - 1];
}

/**
 * Generate format nomor surat otomatis
 * Format: 01 / PKM-BM / X / 2026
 */
export function generateNomorSurat(
  nomorUrut: number,
  tanggalSuratStr: string,
  kodeInstansi = "PKM-BM"
): string {
  const parts = (tanggalSuratStr || "").split("-");
  const month = parts.length === 3 ? parseInt(parts[1], 10) : new Date().getMonth() + 1;
  const year = parts.length === 3 ? parts[0] : new Date().getFullYear().toString();

  const padUrut = nomorUrut < 10 ? `0${nomorUrut}` : `${nomorUrut}`;
  const romanMonth = getRomanMonth(month);

  return `${padUrut} / ${kodeInstansi} / ${romanMonth} / ${year}`;
}

/**
 * Cek bentrok jadwal pegawai (1 orang cuma bisa berkegiatan 1 kali sehari)
 */
export function checkScheduleConflicts(
  existingSuratList: SuratTugas[],
  selectedPetugas: Pegawai[],
  selectedDates: string[],
  currentSuratId?: string
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  const otherSurat = existingSuratList.filter((s) => s.id !== currentSuratId);

  for (const date of selectedDates) {
    if (!date) continue;

    for (const petugas of selectedPetugas) {
      if (!petugas || !petugas.id) continue;

      for (const surat of otherSurat) {
        const hasDateConflict = surat.tanggalPerjalanan?.includes(date);
        const hasPetugasConflict = surat.petugasDitugaskan?.some(
          (p) => p.id === petugas.id || (p.nip && p.nip === petugas.nip)
        );

        if (hasDateConflict && hasPetugasConflict) {
          conflicts.push({
            petugasId: petugas.id,
            petugasNama: petugas.nama,
            tanggal: date,
            nomorSurat: surat.nomorSurat,
            suratId: surat.id,
          });
        }
      }
    }
  }

  return conflicts;
}
