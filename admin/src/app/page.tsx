'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  CircleDot,
  IndianRupee,
  Users,
  Coffee
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RecentBookings from '@/components/dashboard/RecentBookings';
import InventoryWidget from '@/components/dashboard/InventoryWidget';
import ChartContainer from '@/components/dashboard/ChartContainer';
import BookingsModal from '@/components/dashboard/BookingsModal';
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { useSearch } from '@/context/SearchContext';

interface DashboardStats {
  todaysBookings: number;
  activePoolTables: number;
  totalPoolTables: number;
  activeCafeOrders: number;
  totalRevenue: number;
  staffOnDuty: number;
  lowStockAlerts: number;
  monthlyStats: { name: string; bookings: number; revenue: number }[];
  dailyStats: { name: string; bookings: number }[];
}

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const { searchQuery } = useSearch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      // Don't set loading to true on background refreshes, only initial load or retry
      if (!stats) setIsLoading(true);
      setError(null);

      const fetchJson = async (url: string) => {
        const res = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.status === 401) {
          // Token is likely invalid/expired. Force logout.
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/login';
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        return res.json();
      };

      const [statsData, bookingsData, todaysData, inventoryData] = await Promise.all([
        fetchJson(`${API_BASE_URL}/admin/dashboard-stats?t=${Date.now()}`),
        fetchJson(`${API_BASE_URL}/admin/bookings?limit=3&t=${Date.now()}`),
        fetchJson(`${API_BASE_URL}/admin/bookings?date=today&t=${Date.now()}`),
        fetchJson(`${API_BASE_URL}/inventory?t=${Date.now()}`)
      ]);

      setStats(statsData);
      setRecentBookings(bookingsData);
      setTodaysBookings(todaysData);
      setInventory(inventoryData);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [stats, token]);

  useEffect(() => {
    if (!authLoading && token) {
      fetchData();
      // Poll every 30 seconds
      const interval = setInterval(fetchData, 30000);

      // Refetch on window focus
      const onFocus = () => fetchData();
      window.addEventListener('focus', onFocus);

      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', onFocus);
      };
    }
  }, [fetchData, authLoading, token]);

  // Filter Data based on Search Query
  // Filter Data based on Search Query
  const filteredBookings = recentBookings.filter((b: any) => {
    const q = searchQuery.toLowerCase();
    const clientName = b.guest_name || b.user_id?.username || b.guest_name || 'Guest';
    const tableName = b.table_id ? `${b.table_id.type} ${b.table_id.table_number}` : '';
    const status = b.status || '';

    return (
      clientName.toLowerCase().includes(q) ||
      tableName.toLowerCase().includes(q) ||
      status.toLowerCase().includes(q)
    );
  });

  const filteredInventory = inventory.filter((i: any) =>
    (i.name && i.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (i.category && i.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading && !stats) {
    return <DashboardSkeleton />;
  }

  if (error && !stats) {
    return <ErrorDisplay onRetry={fetchData} message={error} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, {user?.username || 'Admin'}. Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Today's Bookings"
          value={stats ? stats.todaysBookings : '-'}
          icon={<CalendarCheck className="w-6 h-6" />}
          trend={{ value: 12, isUp: true }}
          color="blue"
          onClick={() => setIsModalOpen(true)}
        />
        <StatCard
          title="Active Pool Tables"
          value={stats ? `${stats.activePoolTables}/${stats.totalPoolTables}` : '-/-'}
          icon={<CircleDot className="w-6 h-6" />}
          color="purple"
          onClick={() => router.push('/pool')}
        />
        <StatCard
          title="Active Cafe Orders"
          value={stats ? stats.activeCafeOrders : '-'}
          icon={<Coffee className="w-6 h-6" />}
          color="orange"
          onClick={() => router.push('/cafe')}
        />
        <StatCard
          title="Total Revenue"
          value={stats ? `₹${stats.totalRevenue}` : '-'}
          icon={<IndianRupee className="w-6 h-6" />}
          trend={{ value: 8, isUp: true }}
          color="orange"
        />
        <StatCard
          title="Staff on Duty"
          value={stats ? stats.staffOnDuty : '-'}
          icon={<Users className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Bookings & Charts */}
        <div className="xl:col-span-2 space-y-8">
          <RecentBookings bookings={filteredBookings} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ChartContainer
              key={`daily-${stats?.dailyStats?.length || 0}-${Date.now()}`}
              title="Daily Bookings"
              subtitle="Last 30 days activity"
              data={stats?.dailyStats || []}
              dataKey="bookings"
              color="bg-blue-500"
            />
            <ChartContainer
              key={`monthly-${stats?.monthlyStats?.length || 0}-${Date.now()}`}
              title="Revenue Overview"
              subtitle="Monthly revenue trends"
              data={stats?.monthlyStats || []}
              dataKey="revenue"
              color="bg-green-500"
            />
          </div>
        </div>

        {/* Right Column - Inventory */}
        <div className="space-y-8">
          <InventoryWidget inventory={filteredInventory} />
        </div>
      </div>

      {/* Modal */}
      <BookingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookings={todaysBookings}
      />
    </div>
  );
}
