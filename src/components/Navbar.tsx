"use client";

import React from "react";
import Image from "next/image";
import { FileText, PlusCircle } from "lucide-react";

interface NavbarProps {
  currentTab: "list" | "create" | "detail";
  onTabChange: (tab: "list" | "create") => void;
}

export function Navbar({ currentTab, onTabChange }: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onTabChange("list")}
          >
            <div className="w-10 h-10 relative shrink-0">
              <Image
                src="/logo-takalar.png"
                alt="Logo Takalar"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 leading-tight">
                UPT Puskesmas Bontomarannu
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Sistem Generator Surat Tugas Otomatis
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Tombol Katalog */}
            <button
              onClick={() => onTabChange("list")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentTab === "list"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Daftar Surat</span>
            </button>

            {/* Tombol Buat Baru */}
            <button
              onClick={() => onTabChange("create")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                currentTab === "create"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Surat</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
