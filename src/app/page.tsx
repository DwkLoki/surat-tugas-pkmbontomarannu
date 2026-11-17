"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { SuratTable } from "@/components/SuratTable";
import { SuratForm } from "@/components/SuratForm";
import { SuratDetailView } from "@/components/SuratDetailView";
import { DeleteModal } from "@/components/DeleteModal";
import {
  getSuratList,
  createSurat,
  updateSurat,
  deleteSurat,
  getNextNomorUrut,
} from "@/lib/storage";
import { exportSuratToExcel } from "@/lib/excel-export";
import { SuratTugas, SuratTugasInput } from "@/types/surat";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "detail">("list");
  const [suratList, setSuratList] = useState<SuratTugas[]>([]);
  const [selectedSurat, setSelectedSurat] = useState<SuratTugas | null>(null);
  const [editingSurat, setEditingSurat] = useState<SuratTugas | null>(null);
  const [deletingSurat, setDeletingSurat] = useState<SuratTugas | null>(null);

  const [nextNomorUrut, setNextNomorUrut] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Load data dari storage
  useEffect(() => {
    let isCancelled = false;

    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await getSuratList();
        if (!isCancelled) {
          setSuratList(data);
        }

        const currentYear = new Date().getFullYear();
        const nextNum = await getNextNomorUrut(currentYear);
        if (!isCancelled) {
          setNextNomorUrut(nextNum);
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [refreshTrigger]);

  const reloadData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handler: Buka form buat baru
  const handleOpenCreate = () => {
    setEditingSurat(null);
    setActiveTab("create");
  };

  // Handler: Buka form edit
  const handleOpenEdit = (surat: SuratTugas) => {
    setEditingSurat(surat);
    setActiveTab("create");
  };

  // Handler: Buka detail / cetak
  const handleView = (surat: SuratTugas) => {
    setSelectedSurat(surat);
    setActiveTab("detail");
  };

  // Handler: Download Excel
  const handleDownloadExcel = async (surat: SuratTugas) => {
    try {
      await exportSuratToExcel(surat);
    } catch (err) {
      console.error("Gagal download excel:", err);
      alert("Terjadi kesalahan saat mengekspor ke Excel");
    }
  };

  // Handler: Submit Form (Create / Update)
  const handleSubmitForm = async (payload: SuratTugasInput) => {
    setIsSubmitting(true);
    try {
      if (editingSurat) {
        const updated = await updateSurat(editingSurat.id, payload);
        setSelectedSurat(updated);
        alert("Surat tugas berhasil diperbarui!");
      } else {
        const created = await createSurat(payload);
        setSelectedSurat(created);
        alert("Surat tugas berhasil dibuat!");
      }
      reloadData();
      setActiveTab("detail"); // langsung bawa user ke halaman preview cetak
    } catch (err) {
      console.error("Gagal menyimpan surat:", err);
      alert("Gagal menyimpan surat tugas. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Konfirmasi Hapus
  const handleConfirmDelete = async () => {
    if (!deletingSurat) return;
    setIsDeleting(true);
    try {
      await deleteSurat(deletingSurat.id);
      reloadData();
      setDeletingSurat(null);
      if (selectedSurat?.id === deletingSurat.id) {
        setSelectedSurat(null);
        setActiveTab("list");
      }
    } catch (err) {
      console.error("Gagal menghapus:", err);
      alert("Gagal menghapus surat tugas.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "create") {
            handleOpenCreate();
          } else {
            setActiveTab("list");
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-sm font-medium">Memuat data surat tugas...</p>
          </div>
        ) : (
          <>
            {activeTab === "list" && (
              <SuratTable
                suratList={suratList}
                onView={handleView}
                onEdit={handleOpenEdit}
                onDelete={(surat) => setDeletingSurat(surat)}
                onDownloadExcel={handleDownloadExcel}
                onCreateNew={handleOpenCreate}
              />
            )}

            {activeTab === "create" && (
              <div className="max-w-4xl mx-auto">
                <SuratForm
                  initialData={editingSurat}
                  allSurat={suratList}
                  nextNomorUrut={nextNomorUrut}
                  onSubmit={handleSubmitForm}
                  onCancel={() => setActiveTab("list")}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}

            {activeTab === "detail" && selectedSurat && (
              <SuratDetailView
                surat={selectedSurat}
                onBack={() => setActiveTab("list")}
                onEdit={handleOpenEdit}
              />
            )}
          </>
        )}
      </main>

      {/* Footer (Hidden on print) */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500 print:hidden">
        UPT Puskesmas Bontomarannu &bull; Kabupaten Takalar &bull; Sistem Generator Surat Tugas Otomatis
      </footer>

      {/* Modal Hapus */}
      <DeleteModal
        isOpen={Boolean(deletingSurat)}
        onClose={() => setDeletingSurat(null)}
        onConfirm={handleConfirmDelete}
        suratNomor={deletingSurat?.nomorSurat || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
