"use client";

import React from "react";
import Image from "next/image";
import { FileText, PlusCircle, Lock } from "lucide-react";

interface NavbarProps {
  currentTab: "list" | "create" | "detail";
  onTabChange: (tab: "list" | "create") => void;
  onLogout?: () => void;
}

export function Navbar({ currentTab, onTabChange, onLogout }: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0 mr-2"
            onClick={() => onTabChange("list")}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative shrink-0">
              <Image
                src="/logo-takalar.png"
                alt="Logo Takalar"
                fill
                sizes="(max-width: 640px) 32px, 40px"
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight truncate">
                UPT Puskesmas Bontomarannu
              </div>
              <div className="hidden sm:block text-xs text-gray-500 font-medium truncate">
                Sistem Generator Surat Tugas Otomatis
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Tombol Katalog */}
            <button
              onClick={() => onTabChange("list")}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentTab === "list"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>
                Daftar<span className="hidden sm:inline"> Surat</span>
              </span>
            </button>

            {/* Tombol Buat Baru */}
            <button
              onClick={() => onTabChange("create")}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentTab === "create"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>
                Buat<span className="hidden sm:inline"> Surat</span>
              </span>
            </button>

            {/* Tombol Kunci / Keluar */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200 shrink-0"
                title="Kunci Akses Sistem (Keluar)"
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden md:inline">Kunci</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
