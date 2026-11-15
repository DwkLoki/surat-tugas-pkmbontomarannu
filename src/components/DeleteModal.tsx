"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  suratNomor: string;
  isDeleting: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  suratNomor,
  isDeleting,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Hapus Surat Tugas</h3>
            <p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Apakah Anda yakin ingin menghapus surat tugas dengan nomor{" "}
          <strong className="text-gray-900">{suratNomor}</strong>?
        </p>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? "Menghapus..." : "Ya, Hapus"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
