'use client';

import React, { useState, useEffect } from 'react';
import { Users, Phone, Calendar, Clock, ChevronDown, ChevronUp, Search, History } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ClientData {
    id: string;
    name: string;
    phone: string;
    email: string;
    totalVisits: number;
    lastVisit: string | null;
    isNew: boolean;
    bookings: any[];
}

export default function ClientsPage() {
    const { token } = useAuth();
    const [clients, setClients] = useState<ClientData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

    const fetchClients = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/clients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (err) {
            console.error("Failed to fetch clients:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchClients();
        }
    }, [token]);

    // Helper to toggle expansion
    const toggleExpand = (id: string) => {
        setExpandedClientId(prev => prev === id ? null : id);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row expansion
        if (!confirm('Are you sure you want to delete this client and all their history? This cannot be undone.')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/clients/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchClients(); // Refresh list
            } else {
                alert('Failed to delete client');
            }
        } catch (err) {
            console.error("Failed to delete client:", err);
        }
    };

    // Filter clients based on search
    const filteredClients = clients.filter(client =>
        (client.name && client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.phone && client.phone.includes(searchQuery))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Client History
                    </h1>
                    <p className="text-slate-500">View client profiles and their booking history.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Client Name</th>
                                <th className="px-6 py-4 font-semibold">Contact</th>
                                <th className="px-6 py-4 font-semibold text-center">Total Visits</th>
                                <th className="px-6 py-4 font-semibold">Last Visit</th>
                                <th className="px-6 py-4 font-semibold text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading clients...</td>
                                </tr>
                            ) : filteredClients.length > 0 ? (
                                filteredClients.map(client => {
                                    const lastVisit = client.lastVisit
                                        ? new Date(client.lastVisit).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })
                                        : 'N/A';

                                    const isExpanded = expandedClientId === client.id;

                                    return (
                                        <React.Fragment key={client.id}>
                                            <tr
                                                className={`transition-colors cursor-pointer hover:bg-slate-50 ${isExpanded ? 'bg-slate-50' : ''}`}
                                                onClick={() => toggleExpand(client.id)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                            {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{client.name || 'Unknown'}</p>
                                                            {client.isNew && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">NEW</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Phone className="w-4 h-4 text-slate-400" />
                                                        {client.phone || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${client.totalVisits > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                                                        {client.totalVisits}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {lastVisit}
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-400">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={(e) => handleDelete(client.id, e)}
                                                            className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                        {isExpanded ? <ChevronUp className="w-5 h-5 ml-auto" /> : <ChevronDown className="w-5 h-5 ml-auto" />}
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expandable History Row */}
                                            {isExpanded && (
                                                <tr className="bg-slate-50/50">
                                                    <td colSpan={5} className="px-6 py-4 pt-0 border-b border-slate-100">
                                                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                                                <History className="w-4 h-4" />
                                                                Recent History
                                                            </div>
                                                            {client.bookings.length > 0 ? (
                                                                <table className="w-full text-sm">
                                                                    <thead className="bg-white text-slate-400 text-xs border-b border-slate-100">
                                                                        <tr>
                                                                            <th className="px-4 py-2 text-left font-medium">Date</th>
                                                                            <th className="px-4 py-2 text-left font-medium">Resource</th>
                                                                            <th className="px-4 py-2 text-right font-medium">Amount</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-50">
                                                                        {client.bookings.map((booking: any) => (
                                                                            <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                                                                                <td className="px-4 py-3 text-slate-600">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                                        {new Date(booking.created_at).toLocaleDateString()}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                                                        <Clock className="w-3.5 h-3.5" />
                                                                                        {new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-4 py-3 text-slate-600">
                                                                                    <div className="font-medium text-slate-900">
                                                                                        {booking.table_id ? `Table Booking` : 'Cafe Order'}
                                                                                    </div>
                                                                                    <div className="text-xs text-slate-500">
                                                                                        Duration: {booking.end_time ? Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / 60000) : 0} mins
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-4 py-3 text-right font-bold text-slate-900">
                                                                                    ₹{booking.total_price}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            ) : (
                                                                <div className="p-8 text-center text-slate-400 text-sm">
                                                                    No booking history found for this client.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No clients found matching "{searchQuery}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
