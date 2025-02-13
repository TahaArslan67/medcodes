'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../../context/AuthContext";
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedCodes - Tıp ve Teknoloji",
  description: "Tıp ve teknoloji dünyasının kesişiminde, geleceğin sağlık teknolojilerini birlikte inşa ediyoruz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/auth/');

  return (
    <html lang="tr">
      <body className={`${inter.className} antialiased bg-[#1a1a2e] text-white min-h-screen`}>
        <AuthProvider>
          <div className="fixed w-full top-0 z-[100]">
            <Navbar />
          </div>
          <div className="relative mt-20">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
