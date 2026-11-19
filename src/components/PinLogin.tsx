"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { verifyPin, saveAuthSession } from "@/lib/auth";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Delete,
  CheckCircle2,
} from "lucide-react";

interface PinLoginProps {
  onSuccess: () => void;
}

export function PinLogin({ onSuccess }: PinLoginProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto focus input pertama saat dimuat
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Eksekusi verifikasi PIN
  const handleValidate = (pinString: string) => {
    if (pinString.length !== 6) return;

    if (verifyPin(pinString)) {
      setIsSuccess(true);
      setErrorMsg("");
      saveAuthSession(rememberMe);
      setTimeout(() => {
        onSuccess();
      }, 350);
    } else {
      setIsShaking(true);
      setErrorMsg("PIN akses salah. Silakan periksa kembali.");
      setTimeout(() => {
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setIsShaking(false);
      }, 500);
    }
  };

  // Handler input keyboard pada kotak digit
  const handleChange = (index: number, value: string) => {
    // Ambil hanya karakter angka
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    const digit = cleanValue.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setErrorMsg("");

    // Pindah ke kotak berikutnya
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // Jika digit ke-6 sudah diisi, verifikasi
      const fullPin = newDigits.join("");
      handleValidate(fullPin);
    }
  };

  // Handler backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handler paste (jika staf copy-paste 6 digit PIN sekaligus)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pastedData) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < 6 && i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    setErrorMsg("");

    const targetIndex = Math.min(pastedData.length, 5);
    inputRefs.current[targetIndex]?.focus();

    if (pastedData.length >= 6) {
      handleValidate(newDigits.join(""));
    }
  };

  // Handler tombol keypad virtual di layar
  const handleKeypadPress = (val: string) => {
    if (val === "BACK") {
      // Cari digit terisi terakhir lalu hapus
      const lastIndex = digits.map((d) => d !== "").lastIndexOf(true);
      if (lastIndex !== -1) {
        const newDigits = [...digits];
        newDigits[lastIndex] = "";
        setDigits(newDigits);
        inputRefs.current[lastIndex]?.focus();
      }
      return;
    }

    if (val === "CLEAR") {
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setErrorMsg("");
      return;
    }

    // Cari digit kosong pertama
    const firstEmptyIndex = digits.findIndex((d) => d === "");
    if (firstEmptyIndex !== -1) {
      const newDigits = [...digits];
      newDigits[firstEmptyIndex] = val;
      setDigits(newDigits);
      setErrorMsg("");

      if (firstEmptyIndex < 5) {
        inputRefs.current[firstEmptyIndex + 1]?.focus();
      } else {
        handleValidate(newDigits.join(""));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-emerald-50/40 flex flex-col justify-center items-center p-3.5 sm:p-6 lg:p-8 font-sans">
      <div
        className={`w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-lg sm:shadow-xl p-4 sm:p-7 md:p-8 space-y-4 sm:space-y-6 transition-all duration-300 ${
          isShaking ? "animate-shake ring-2 ring-rose-400" : ""
        }`}
      >
        {/* Header Identitas Puskesmas */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 relative mx-auto drop-shadow-2xs mb-2 sm:mb-3">
            <Image
              src="/logo-takalar.png"
              alt="Logo Takalar"
              fill
              sizes="(max-width: 640px) 56px, 80px"
              className="object-contain"
              priority
            />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-xs font-bold tracking-wide">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
            <span>Akses Terbatas Staf</span>
          </div>

          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight">
            UPT Puskesmas Bontomarannu
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            Sistem Generator Surat Tugas Otomatis &bull; Masukkan 6-digit PIN akses staf untuk melanjutkan.
          </p>
        </div>

        {/* Kotak Input 6-Digit PIN */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center space-x-1.5">
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
              <span>PIN Akses (6 Digit)</span>
            </label>

            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-[11px] sm:text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              {showPin ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Sembunyikan</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Tampilkan</span>
                </>
              )}
            </button>
          </div>

          {/* Kotak Digit Input (Dioptimalkan agar pas di lebar 375px) */}
          <div className="flex justify-between items-center gap-1.5 sm:gap-2.5">
            {digits.map((digit, idx) => {
              const isFilled = digit !== "";
              return (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-2xl font-black rounded-xl sm:rounded-2xl border transition-all outline-hidden ${
                    isSuccess
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500"
                      : isFilled
                      ? "border-emerald-500 bg-white text-gray-900 ring-2 ring-emerald-400/40 shadow-xs"
                      : "border-gray-300 bg-gray-50/80 text-gray-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30"
                  }`}
                />
              );
            })}
          </div>

          {/* Pesan Kesalahan / Sukses */}
          {errorMsg ? (
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : isSuccess ? (
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>PIN Benar! Membuka sistem...</span>
            </div>
          ) : null}

          {/* Opsi Ingat Perangkat Ini */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-600 pt-0.5">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 rounded-md border-gray-300 focus:ring-emerald-500"
              />
              <span className="font-medium">Ingat saya di perangkat ini (7 hari)</span>
            </label>
          </div>
        </div>

        {/* Virtual Keypad (Sangat ramah sentuhan untuk Mobile 375px & Tablet) */}
        <div className="pt-2 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 max-w-[280px] sm:max-w-xs mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="h-11 sm:h-12 md:h-13 rounded-xl sm:rounded-2xl bg-gray-50 hover:bg-emerald-50 active:bg-emerald-100 text-gray-800 hover:text-emerald-800 font-bold text-base sm:text-lg border border-gray-200/80 transition shadow-2xs flex items-center justify-center select-none active:scale-95"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleKeypadPress("CLEAR")}
              className="h-11 sm:h-12 md:h-13 rounded-xl sm:rounded-2xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-500 font-bold text-[11px] sm:text-xs uppercase tracking-wider border border-gray-200/80 transition flex items-center justify-center select-none active:scale-95"
            >
              Hapus
            </button>

            <button
              type="button"
              onClick={() => handleKeypadPress("0")}
              className="h-11 sm:h-12 md:h-13 rounded-xl sm:rounded-2xl bg-gray-50 hover:bg-emerald-50 active:bg-emerald-100 text-gray-800 hover:text-emerald-800 font-bold text-base sm:text-lg border border-gray-200/80 transition shadow-2xs flex items-center justify-center select-none active:scale-95"
            >
              0
            </button>

            <button
              type="button"
              onClick={() => handleKeypadPress("BACK")}
              className="h-11 sm:h-12 md:h-13 rounded-xl sm:rounded-2xl bg-gray-50 hover:bg-rose-50 active:bg-rose-100 text-gray-500 hover:text-rose-600 border border-gray-200/80 transition flex items-center justify-center select-none active:scale-95"
              title="Hapus Satu Digit"
            >
              <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Footer Info Bantuan */}
        <div className="text-center text-[10px] sm:text-[11px] text-gray-400 leading-tight">
          Belum mengetahui PIN akses staf? Hubungi Koordinator TU Puskesmas.
        </div>
      </div>
    </div>
  );
}
