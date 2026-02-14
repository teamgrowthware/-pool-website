'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Loader2 } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isLoginPage = pathname === '/login';
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.push('/login');
    }
    if (!isLoading && user && isLoginPage) {
      router.push('/');
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) return null; // Logic in useEffect will redirect

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col pl-0 lg:pl-64 transition-all duration-300">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 mt-16 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
