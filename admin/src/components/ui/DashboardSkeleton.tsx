import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
        <div className="h-4 w-96 bg-slate-100 rounded-lg"></div>
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-32 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-slate-100"></div>
              <div className="w-12 h-6 rounded-full bg-slate-50"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-100 rounded"></div>
              <div className="h-6 w-16 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* Recent Bookings Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-96 p-6">
            <div className="flex justify-between mb-6">
              <div className="h-6 w-32 bg-slate-200 rounded"></div>
              <div className="h-4 w-16 bg-slate-100 rounded"></div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-slate-50 rounded-lg"></div>
              ))}
            </div>
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
              <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
              <div className="h-full bg-slate-50 rounded-lg"></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
              <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
              <div className="h-full bg-slate-50 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Right Column - Inventory Skeleton */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[500px]">
            <div className="flex justify-between mb-6">
              <div className="h-6 w-32 bg-slate-200 rounded"></div>
              <div className="h-5 w-24 bg-slate-100 rounded-full"></div>
            </div>
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                    <div className="h-4 w-12 bg-slate-100 rounded"></div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
