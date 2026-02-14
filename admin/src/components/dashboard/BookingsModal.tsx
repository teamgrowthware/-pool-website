'use client';

import React from 'react';
import { X, MapPin, Clock, Phone, User, Calendar } from 'lucide-react';
interface Booking {
    _id: string;
    guest_name?: string;
    guest_phone?: string;
    user_id?: {
        username: string;
        phone: string;
    };
    table_id?: {
        table_number: number;
        type: string;
    };
    start_time: string;
    end_time: string;
    total_price: number;
    status: string;
}

interface BookingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookings: Booking[];
}

const BookingsModal: React.FC<BookingsModalProps> = ({ isOpen, onClose, bookings }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Today's Detailed Bookings
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">Showing all active and confirmed slots for today.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200/50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {bookings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bookings.map((booking) => {
                                const clientName = booking.user_id ? booking.user_id.username : (booking.guest_name || 'Guest');
                                const phone = booking.user_id ? booking.user_id.phone : (booking.guest_phone || 'N/A');
                                const status = booking.status.toLowerCase();
                                const type = booking.table_id?.type || 'N/A';
                                const resourceName = `Table ${booking.table_id?.table_number || '?'}`;
                                const startTime = new Date(booking.start_time);
                                const endTime = new Date(booking.end_time);
                                const timeSlot = `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                const durationMs = new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime();
                                const durationHrs = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
                                const duration = `${durationHrs} hour${durationHrs !== 1 ? 's' : ''}`;

                                return (
                                    <div
                                        key={booking._id}
                                        className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    {clientName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{clientName}</h4>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Phone className="w-3 h-3" />
                                                        {phone}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                    status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        'bg-slate-50 text-slate-600 border-slate-100'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Resource</p>
                                                <p className="text-sm font-semibold text-slate-700 capitalize">{type}: {resourceName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Category</p>
                                                <p className="text-sm font-semibold text-slate-700">{type === 'Pool' ? '8-Ball' : type}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{timeSlot}</span>
                                                </div>
                                                <span className="font-semibold text-slate-900">{duration}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-xs text-slate-400">Total Amount</span>
                                                <span className="text-lg font-bold text-slate-900 font-mono">₹{booking.total_price}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">No bookings yet</h3>
                            <p className="text-slate-500">There are no bookings scheduled for today.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 active:scale-95"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingsModal;
