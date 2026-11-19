// ==========================================================
// SISTEM AUTENTIKASI PIN AKSES STAF PUSKESMAS BONTOMARANNU
// ==========================================================

import { useSyncExternalStore } from "react";

const DEFAULT_PIN = "240226"; // PIN bawaan (dapat diubah via NEXT_PUBLIC_ADMIN_PIN)
const AUTH_STORAGE_KEY = "pkm_bomar_auth_session";
const AUTH_EVENT_NAME = "pkm_auth_state_change";

/**
 * Mendapatkan PIN yang diharapkan dari environment variable atau default
 */
export function getExpectedPin(): string {
  const envPin = process.env.NEXT_PUBLIC_ADMIN_PIN?.trim();
  if (envPin && envPin.length === 6) {
    return envPin;
  }
  return DEFAULT_PIN;
}

/**
 * Memvalidasi apakah PIN yang dimasukkan cocok
 */
export function verifyPin(inputPin: string): boolean {
  const expected = getExpectedPin();
  return inputPin.trim() === expected;
}

/**
 * Memeriksa apakah sesi saat ini masih aktif dan valid di browser
 */
export function checkIsAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  try {
    // 1. Cek di localStorage (mode "Ingat Perangkat Ini" dengan expiry 7 hari)
    const localSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (localSession) {
      const parsed = JSON.parse(localSession);
      if (parsed?.authenticated) {
        if (!parsed.expiresAt || Date.now() < parsed.expiresAt) {
          return true;
        }
        // Jika sudah kadaluarsa, bersihkan
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    // 2. Cek di sessionStorage (mode sesi tab saat ini)
    const sessionOnly = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (sessionOnly) {
      const parsed = JSON.parse(sessionOnly);
      if (parsed?.authenticated) {
        return true;
      }
    }
  } catch (err) {
    console.error("Gagal memeriksa sesi PIN:", err);
  }

  return false;
}

/**
 * Memicu notifikasi perubahan status autentikasi ke semua subscriber
 */
function emitAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  }
}

/**
 * Menyimpan sesi login yang berhasil
 */
export function saveAuthSession(rememberMe: boolean = true): void {
  if (typeof window === "undefined") return;

  const sessionData = {
    authenticated: true,
    createdAt: Date.now(),
    expiresAt: rememberMe ? Date.now() + 7 * 24 * 60 * 60 * 1000 : null, // 7 hari
  };

  try {
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.error("Gagal menyimpan sesi PIN:", err);
  }

  emitAuthChange();
}

/**
 * Menghapus sesi login (Kunci / Logout)
 */
export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (err) {
    console.error("Gagal menghapus sesi PIN:", err);
  }

  emitAuthChange();
}

/**
 * Subscription listener untuk event auth dan storage
 */
function subscribeAuth(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(AUTH_EVENT_NAME, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * Hook reaktif untuk memantau status autentikasi di komponen React
 */
export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(
    subscribeAuth,
    () => checkIsAuthenticated(),
    () => false
  );
}

/**
 * Hook untuk mendeteksi apakah komponen telah ter-mount di browser
 */
const emptySubscribe = () => () => {};
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
