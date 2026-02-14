import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Poolside Admin - Pool & Turf Booking System",
  description: "Advanced management panel for pool and cricket turf booking systems.",
};

import { PoolProvider } from '@/context/PoolContext';
import { SearchProvider } from '@/context/SearchContext';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <PoolProvider>
            <SearchProvider>
              <AppShell>
                {children}
              </AppShell>
            </SearchProvider>
          </PoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
