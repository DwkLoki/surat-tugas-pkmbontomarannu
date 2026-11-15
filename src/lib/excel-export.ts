import ExcelJS from "exceljs";
import { SuratTugas } from "@/types/surat";
import { formatTanggalIndo, formatDaftarTanggal } from "./utils";

/**
 * Generate dan download file Excel (.xlsx) surat tugas secara client-side
 */
export async function exportSuratToExcel(surat: SuratTugas): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "UPT Puskesmas Bontomarannu";
  workbook.lastModifiedBy = "Sistem Surat Tugas Puskesmas";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("SURAT TUGAS", {
    pageSetup: {
      paperSize: 9, // A4
      orientation: "portrait",
      margins: {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
    },
  });

  // Set column widths matching original template
  worksheet.columns = [
    { key: "colA", width: 8 },
    { key: "colB", width: 22 },
    { key: "colC", width: 4 },
    { key: "colD", width: 26 },
    { key: "colE", width: 46 },
  ];

  // Helper border styling
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // Row 2: PEMERINTAH KABUPATEN TAKALAR
  worksheet.mergeCells("A2:E2");
  const r2 = worksheet.getCell("A2");
  r2.value = "PEMERINTAH KABUPATEN TAKALAR";
  r2.font = { name: "Arial", size: 14, bold: true };
  r2.alignment = { horizontal: "center", vertical: "middle" };

  // Row 3: DINAS KESEHATAN
  worksheet.mergeCells("A3:E3");
  const r3 = worksheet.getCell("A3");
  r3.value = "DINAS KESEHATAN";
  r3.font = { name: "Arial", size: 15, bold: true };
  r3.alignment = { horizontal: "center", vertical: "middle" };

  // Row 4: UPT PUSKESMAS BONTOMARANNU
  worksheet.mergeCells("A4:E4");
  const r4 = worksheet.getCell("A4");
  r4.value = "UPT PUSKESMAS BONTOMARANNU";
  r4.font = { name: "Arial Narrow", size: 16, bold: true };
  r4.alignment = { horizontal: "center", vertical: "middle" };

  // Row 5: Alamat
  worksheet.mergeCells("A5:E5");
  const r5 = worksheet.getCell("A5");
  r5.value =
    "Barua Desa Bontomarannu, Kec. Galesong Selatan, Kab. Takalar, E-mail: pkmbontomarannu12@gmail.com";
  r5.font = { name: "Arial", size: 9, italic: true };
  r5.alignment = { horizontal: "center", vertical: "middle" };

  // Row 6: Double line under kop
  for (let c = 1; c <= 5; c++) {
    worksheet.getCell(6, c).border = {
      bottom: { style: "double" },
    };
  }

  // Row 7: Judul "SURAT TUGAS"
  worksheet.mergeCells("A7:E7");
  const r7 = worksheet.getCell("A7");
  r7.value = "SURAT TUGAS";
  r7.font = { name: "Arial", size: 12, bold: true, underline: true };
  r7.alignment = { horizontal: "center", vertical: "middle" };

  // Row 8: NOMOR : ...
  worksheet.mergeCells("A8:E8");
  const r8 = worksheet.getCell("A8");
  r8.value = `NOMOR :   ${surat.nomorSurat}`;
  r8.font = { name: "Arial", size: 11, bold: true };
  r8.alignment = { horizontal: "center", vertical: "middle" };

  // Row 10: Dasar :
  worksheet.getCell("A10").value = "Dasar :";
  worksheet.getCell("A10").font = { name: "Arial", size: 11 };

  // Dasar 1
  worksheet.getCell("A11").value = "1";
  worksheet.getCell("A11").alignment = { horizontal: "right" };
  worksheet.getCell("A11").font = { name: "Arial", size: 10 };
  worksheet.mergeCells("B11:E11");
  worksheet.getCell("B11").value =
    "Peraturan Bupati Takalar Nomor 30 Tahun 2021 tentang Kedudukan, Susunan Organisasi,";
  worksheet.getCell("B11").font = { name: "Arial", size: 10 };

  worksheet.mergeCells("B12:E12");
  worksheet.getCell("B12").value =
    "Tugas dan Fungsi serta Tata Kerja Dinas Kesehatan;";
  worksheet.getCell("B12").font = { name: "Arial", size: 10 };

  // Dasar 2
  worksheet.getCell("A13").value = "2";
  worksheet.getCell("A13").alignment = { horizontal: "right" };
  worksheet.getCell("A13").font = { name: "Arial", size: 10 };
  worksheet.mergeCells("B13:E13");
  worksheet.getCell("B13").value =
    "Permenkes No. 18 Tahun 2025 tentang Perubahan atas Permenkes No. 18 Tahun 2024 tentang";
  worksheet.getCell("B13").font = { name: "Arial", size: 10 };

  worksheet.mergeCells("B14:E14");
  worksheet.getCell("B14").value =
    "Petunjuk Teknis Pengelolaan Dana Bantuan Operasional Kesehatan";
  worksheet.getCell("B14").font = { name: "Arial", size: 10 };

  // Dasar 3 (DPA)
  worksheet.getCell("A15").value = "3";
  worksheet.getCell("A15").alignment = { horizontal: "right" };
  worksheet.getCell("A15").font = { name: "Arial", size: 10 };
  worksheet.mergeCells("B15:E15");
  worksheet.getCell("B15").value =
    `Dokumen Pelaksanaan Anggaran Nomor DPA : ${surat.nomorDpa}`;
  worksheet.getCell("B15").font = { name: "Arial", size: 10 };

  worksheet.mergeCells("B16:E16");
  worksheet.getCell("B16").value =
    "Sebagai Acuan Pelaksanaan Program Dana Bantuan Operasional Kesehatan";
  worksheet.getCell("B16").font = { name: "Arial", size: 10 };

  worksheet.mergeCells("B17:E17");
  worksheet.getCell("B17").value = "Puskesmas Bontomarannu";
  worksheet.getCell("B17").font = { name: "Arial", size: 10 };

  // Row 19: MENUGASKAN
  worksheet.mergeCells("A19:E19");
  const r19 = worksheet.getCell("A19");
  r19.value = "MENUGASKAN";
  r19.font = { name: "Arial", size: 12, bold: true };
  r19.alignment = { horizontal: "center", vertical: "middle" };

  // Tabel Pegawai Header
  let currentRow = 21;
  worksheet.getCell(`A${currentRow}`).value = "NO";
  worksheet.getCell(`A${currentRow}`).font = { name: "Arial", size: 11, bold: true };
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getCell(`A${currentRow}`).border = thinBorder;

  worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
  const headerNama = worksheet.getCell(`B${currentRow}`);
  headerNama.value = "NAMA";
  headerNama.font = { name: "Arial", size: 11, bold: true };
  headerNama.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getCell(`B${currentRow}`).border = thinBorder;
  worksheet.getCell(`C${currentRow}`).border = thinBorder;
  worksheet.getCell(`D${currentRow}`).border = thinBorder;

  worksheet.getCell(`E${currentRow}`).value = "JABATAN";
  worksheet.getCell(`E${currentRow}`).font = { name: "Arial", size: 11, bold: true };
  worksheet.getCell(`E${currentRow}`).alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getCell(`E${currentRow}`).border = thinBorder;

  currentRow++;

  // Data Pegawai (Maks 7)
  const petugasList = surat.petugasDitugaskan || [];
  petugasList.forEach((petugas, idx) => {
    const noRow = currentRow;
    const nipRow = currentRow + 1;

    // Nomor
    worksheet.mergeCells(`A${noRow}:A${nipRow}`);
    const noCell = worksheet.getCell(`A${noRow}`);
    noCell.value = idx + 1;
    noCell.font = { name: "Arial", size: 11 };
    noCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`A${noRow}`).border = thinBorder;
    worksheet.getCell(`A${nipRow}`).border = thinBorder;

    // Nama
    worksheet.mergeCells(`B${noRow}:D${noRow}`);
    const namaCell = worksheet.getCell(`B${noRow}`);
    namaCell.value = petugas.nama;
    namaCell.font = { name: "Arial", size: 11, bold: true };
    namaCell.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getCell(`B${noRow}`).border = thinBorder;
    worksheet.getCell(`C${noRow}`).border = thinBorder;
    worksheet.getCell(`D${noRow}`).border = thinBorder;

    // NIP di bawah nama
    worksheet.mergeCells(`B${nipRow}:D${nipRow}`);
    const nipCell = worksheet.getCell(`B${nipRow}`);
    nipCell.value = petugas.nip ? `Nip. ${petugas.nip}` : "-";
    nipCell.font = { name: "Arial", size: 10 };
    nipCell.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getCell(`B${nipRow}`).border = thinBorder;
    worksheet.getCell(`C${nipRow}`).border = thinBorder;
    worksheet.getCell(`D${nipRow}`).border = thinBorder;

    // Jabatan
    worksheet.mergeCells(`E${noRow}:E${nipRow}`);
    const jabCell = worksheet.getCell(`E${noRow}`);
    jabCell.value = petugas.jabatan;
    jabCell.font = { name: "Arial", size: 11 };
    jabCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    worksheet.getCell(`E${noRow}`).border = thinBorder;
    worksheet.getCell(`E${nipRow}`).border = thinBorder;

    currentRow += 2;
  });

  // Space
  currentRow++;

  // Detail Info (Label : Value)
  const addDetailRow = (label: string, value: string) => {
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    const lCell = worksheet.getCell(`A${currentRow}`);
    lCell.value = label;
    lCell.font = { name: "Arial", size: 11 };

    worksheet.getCell(`C${currentRow}`).value = ":";
    worksheet.getCell(`C${currentRow}`).alignment = { horizontal: "center" };
    worksheet.getCell(`C${currentRow}`).font = { name: "Arial", size: 11 };

    worksheet.mergeCells(`D${currentRow}:E${currentRow}`);
    const vCell = worksheet.getCell(`D${currentRow}`);
    vCell.value = value;
    vCell.font = { name: "Arial", size: 11 };
    vCell.alignment = { wrapText: true };

    currentRow++;
  };

  addDetailRow("Maksud Perjalanan", surat.maksudPerjalanan);
  addDetailRow("Tempat Tujuan", (surat.tempatTujuan || []).join(", "));
  addDetailRow("Lamanya", surat.lamanya);
  addDetailRow(
    "Tanggal Perjalanan",
    formatDaftarTanggal(surat.tanggalPerjalanan)
  );
  addDetailRow("Dibebankan Pada", surat.dibebankanPada);

  // Space
  currentRow++;

  // Kalimat Penutup
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const closingCell = worksheet.getCell(`A${currentRow}`);
  closingCell.value =
    "Demikian Surat tugas ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.";
  closingCell.font = { name: "Arial", size: 11 };
  currentRow += 2;

  // Bagian Tanda Tangan (Sebelah Kanan)
  worksheet.getCell(`E${currentRow}`).value = `Bontomarannu, ${formatTanggalIndo(
    surat.tanggalSurat
  )}`;
  worksheet.getCell(`E${currentRow}`).font = { name: "Arial", size: 11 };
  currentRow++;

  worksheet.getCell(`E${currentRow}`).value =
    surat.pejabatPenandatangan?.jabatan || "Kepala UPT Puskesmas Bontomarannu";
  worksheet.getCell(`E${currentRow}`).font = { name: "Arial", size: 11 };
  currentRow += 4; // Space untuk tanda tangan fisik

  // Nama Pejabat
  const ttdNamaCell = worksheet.getCell(`E${currentRow}`);
  ttdNamaCell.value = surat.pejabatPenandatangan?.nama || "";
  ttdNamaCell.font = { name: "Arial", size: 11, bold: true, underline: true };
  currentRow++;

  // Pangkat / Gol
  if (surat.pejabatPenandatangan?.pangkatGol) {
    worksheet.getCell(
      `E${currentRow}`
    ).value = `Pangkat/ Gol : ${surat.pejabatPenandatangan.pangkatGol}`;
    worksheet.getCell(`E${currentRow}`).font = { name: "Arial", size: 11 };
    currentRow++;
  }

  // NIP
  if (surat.pejabatPenandatangan?.nip) {
    worksheet.getCell(
      `E${currentRow}`
    ).value = `NIP: ${surat.pejabatPenandatangan.nip}`;
    worksheet.getCell(`E${currentRow}`).font = { name: "Arial", size: 11 };
    currentRow++;
  }

  // Generate buffer dan trigger download di browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const sanitizedNomor = surat.nomorSurat.replace(/[\/\\]/g, "-");
  anchor.download = `Surat-Tugas-${sanitizedNomor}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
