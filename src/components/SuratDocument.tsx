"use client";

import React from "react";
import Image from "next/image";
import { SuratTugas } from "@/types/surat";
import { formatTanggalIndo, formatDaftarTanggal } from "@/lib/utils";

interface SuratDocumentProps {
  surat: SuratTugas;
}

export function SuratDocument({ surat }: SuratDocumentProps) {
  return (
    <div className="bg-white text-black font-sans text-[12pt] leading-relaxed p-8 sm:p-12 max-w-[210mm] min-h-[297mm] mx-auto shadow-lg print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full">
      {/* KOP SURAT */}
      <div className="relative border-b-[3px] border-black pb-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="w-20 h-24 relative shrink-0">
            <Image
              src="/logo-takalar.png"
              alt="Logo Takalar"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex-1 text-center px-4">
            <h3 className="text-[13pt] font-bold uppercase tracking-wide leading-tight">
              Pemerintah Kabupaten Takalar
            </h3>
            <h2 className="text-[14pt] font-extrabold uppercase tracking-wide leading-tight">
              Dinas Kesehatan
            </h2>
            <h1 className="text-[16pt] font-black uppercase tracking-wider leading-tight font-sans">
              UPT Puskesmas Bontomarannu
            </h1>
            <p className="text-[8.5pt] italic text-gray-800 leading-tight mt-1">
              Barua Desa Bontomarannu, Kec. Galesong Selatan, Kab. Takalar, E-mail: pkmbontomarannu12@gmail.com
            </p>
          </div>
          <div className="w-20 shrink-0" />
        </div>
        {/* Garis ganda khas kop dinas */}
        <div className="border-b border-black mt-1" />
      </div>

      {/* JUDUL SURAT */}
      <div className="text-center my-4">
        <h2 className="text-[13pt] font-bold uppercase underline tracking-wide">
          Surat Tugas
        </h2>
        <p className="text-[11pt] font-semibold mt-0.5">
          NOMOR : &nbsp;&nbsp;&nbsp;&nbsp; {surat.nomorSurat}
        </p>
      </div>

      {/* DASAR */}
      <div className="text-[10.5pt] my-3 leading-normal">
        <div className="flex">
          <span className="w-16 shrink-0 font-medium">Dasar :</span>
          <div className="flex-1 space-y-1">
            <div className="flex">
              <span className="w-5 shrink-0 text-right pr-2">1.</span>
              <p className="text-justify">
                Peraturan Bupati Takalar Nomor 30 Tahun 2021 tentang Kedudukan,
                Susunan Organisasi, Tugas dan Fungsi serta Tata Kerja Dinas
                Kesehatan;
              </p>
            </div>
            <div className="flex">
              <span className="w-5 shrink-0 text-right pr-2">2.</span>
              <p className="text-justify">
                Permenkes No. 18 Tahun 2025 tentang Perubahan atas Permenkes No. 18
                Tahun 2024 tentang Petunjuk Teknis Pengelolaan Dana Bantuan
                Operasional Kesehatan;
              </p>
            </div>
            <div className="flex">
              <span className="w-5 shrink-0 text-right pr-2">3.</span>
              <p className="text-justify">
                Dokumen Pelaksanaan Anggaran Nomor DPA :{" "}
                <span className="font-semibold">{surat.nomorDpa}</span> Sebagai
                Acuan Pelaksanaan Program Dana Bantuan Operasional Kesehatan
                Puskesmas Bontomarannu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MENUGASKAN */}
      <div className="text-center my-4">
        <span className="text-[11.5pt] font-bold uppercase tracking-wider">
          MENUGASKAN
        </span>
      </div>

      {/* TABEL PEGAWAI */}
      <div className="my-3">
        <table className="w-full border-collapse border border-black text-[10.5pt]">
          <thead>
            <tr className="bg-gray-100 print:bg-transparent">
              <th className="border border-black px-2 py-1.5 w-12 text-center font-bold">
                NO
              </th>
              <th className="border border-black px-3 py-1.5 text-center font-bold">
                NAMA
              </th>
              <th className="border border-black px-3 py-1.5 text-center font-bold w-1/3">
                JABATAN
              </th>
            </tr>
          </thead>
          <tbody>
            {(surat.petugasDitugaskan || []).map((petugas, idx) => (
              <tr key={petugas.id || idx}>
                <td className="border border-black px-2 py-2 text-center align-top font-medium">
                  {idx + 1}
                </td>
                <td className="border border-black px-3 py-2 align-top">
                  <div className="font-bold text-black">{petugas.nama}</div>
                  <div className="text-[9.5pt] text-gray-800">
                    {petugas.nip ? `Nip. ${petugas.nip}` : "-"}
                  </div>
                </td>
                <td className="border border-black px-3 py-2 align-top">
                  {petugas.jabatan}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RINCIAN PERJALANAN */}
      <div className="my-4 text-[10.5pt] space-y-1.5">
        <div className="flex">
          <span className="w-44 shrink-0">Maksud Perjalanan</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span className="flex-1 font-medium">{surat.maksudPerjalanan}</span>
        </div>
        <div className="flex">
          <span className="w-44 shrink-0">Tempat Tujuan</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span className="flex-1">
            {(surat.tempatTujuan || []).join(", ")}
          </span>
        </div>
        <div className="flex">
          <span className="w-44 shrink-0">Lamanya</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span className="flex-1">{surat.lamanya}</span>
        </div>
        <div className="flex">
          <span className="w-44 shrink-0">Tanggal Perjalanan</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span className="flex-1 font-medium">
            {formatDaftarTanggal(surat.tanggalPerjalanan)}
          </span>
        </div>
        <div className="flex">
          <span className="w-44 shrink-0">Dibebankan Pada</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span className="flex-1 font-medium">{surat.dibebankanPada}</span>
        </div>
      </div>

      {/* PENUTUP */}
      <div className="my-4 text-[10.5pt] leading-normal text-justify">
        Demikian Surat tugas ini dibuat dengan sebenarnya untuk dipergunakan
        sebagaimana mestinya.
      </div>

      {/* TANDA TANGAN */}
      <div className="mt-8 flex justify-end">
        <div className="w-72 text-[10.5pt] text-left">
          <p>
            Bontomarannu, {formatTanggalIndo(surat.tanggalSurat)}
          </p>
          <p className="mt-0.5">
            {surat.pejabatPenandatangan?.jabatan ||
              "Kepala UPT Puskesmas Bontomarannu"}
          </p>

          {/* Area Tanda Tangan Fisik / Stempel */}
          <div className="h-24" />

          <p className="font-bold underline uppercase">
            {surat.pejabatPenandatangan?.nama}
          </p>
          {surat.pejabatPenandatangan?.pangkatGol && (
            <p className="text-[9.5pt]">
              Pangkat/ Gol : {surat.pejabatPenandatangan.pangkatGol}
            </p>
          )}
          {surat.pejabatPenandatangan?.nip && (
            <p className="text-[9.5pt]">
              NIP: {surat.pejabatPenandatangan.nip}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
