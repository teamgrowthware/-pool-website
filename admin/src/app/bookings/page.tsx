'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';
import { Booking } from '@/types';
import { API_BASE_URL } from '@/lib/api';

import BookingDetailsModal from '@/components/bookings/BookingDetailsModal';
import { useAuth } from '@/context/AuthContext';

export default function BookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'All') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${API_BASE_URL}/admin/bookings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Map backend data to frontend Booking interface
        const mappedData = data.map((b: any) => ({
          id: b._id,
          clientName: b.user_id?.username || b.guest_name || 'Guest',
          phone: b.user_id?.phone || b.guest_phone || 'N/A',
          type: b.table_id ? 'pool' : 'cafe',
          resourceName: b.table_id ? `Table ${b.table_id.table_number}` : 'Cafe Order',
          subType: b.table_id?.type || 'General',
          timeSlot: new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: `${Math.round((new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 60000)} min`,
          amount: b.total_price,
          status: b.status.toLowerCase(),
          createdAt: b.created_at,
          pre_orders: b.pre_orders || []
        }));
        setBookings(mappedData);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBookings();
  }, [filterStatus, token]); // Re-fetch when filter changes

  // Debounce search
  useEffect(() => {
    if (token) {
      const timer = setTimeout(fetchBookings, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, token]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchBookings();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 text-green-600 border-green-100';
      case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Bookings & Reservations
          </h1>
          <p className="text-slate-500">Manage all pool table and cafe reservations.</p>
        </div>

        <div className="flex gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${filterStatus === status
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Resource</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Loading bookings...</td>
                </tr>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      #{booking.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{booking.clientName}</div>
                      <div className="text-xs text-slate-500">{booking.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{booking.resourceName}</div>
                      <div className="text-xs text-slate-500">{booking.subType}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {booking.timeSlot}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{booking.duration}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ₹{booking.amount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'Cancelled')}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'Confirmed')}
                            className="p-1 hover:bg-green-50 text-slate-400 hover:text-green-600 rounded-lg transition-colors"
                            title="Confirm Booking"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 ml-2"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
