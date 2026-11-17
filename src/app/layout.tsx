import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Surat Tugas - UPT Puskesmas Bontomarannu",
  description:
    "Aplikasi Generator dan Manajemen Surat Tugas Otomatis UPT Puskesmas Bontomarannu, Kab. Takalar",
  icons: {
    icon: [
      { url: "/logo-takalar.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/logo-takalar.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
