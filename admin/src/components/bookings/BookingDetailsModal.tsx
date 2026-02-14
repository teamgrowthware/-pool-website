
import React from 'react';
import { X, Calendar, User, Phone, Clock, Coffee, Receipt, MapPin } from 'lucide-react';
import { Booking } from '@/types';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

export default function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  const cafeTotal = booking.pre_orders?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const tableAmount = Math.max(0, booking.amount - cafeTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Booking Details</h2>
            <p className="text-xs text-slate-500 font-mono">#{booking.id.slice(-6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">

          {/* Status & Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Status</span>
              <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                  ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' :
                  booking.status === 'completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                {booking.status}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Date & Time</span>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                {new Date(booking.createdAt).toLocaleDateString()}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3 text-slate-400" />
                {booking.timeSlot} ({booking.duration})
              </div>
            </div>
          </div>

          {/* Client & Resource */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{booking.clientName}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {booking.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                {booking.type === 'pool' ? <MapPin className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{booking.resourceName}</p>
                <p className="text-xs text-slate-500">{booking.subType}</p>
              </div>
            </div>
          </div>

          {/* Separation Line */}
          <div className="border-t border-slate-100"></div>

          {/* Cafe Orders */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-slate-500" /> Cafe Orders
            </h3>
            {booking.pre_orders && booking.pre_orders.length > 0 ? (
              <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs text-slate-500 uppercase">
                    <tr>
                      <th className="px-3 py-2 font-medium">Item</th>
                      <th className="px-3 py-2 font-medium text-center">Qty</th>
                      <th className="px-3 py-2 font-medium text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {booking.pre_orders.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-slate-700 font-medium">{item.name}</td>
                        <td className="px-3 py-2 text-center text-slate-500">x{item.quantity}</td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                No cafe items ordered in this session.
              </div>
            )}
          </div>

          {/* Bill Summary */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 mt-4">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Table Charge</span>
              <span>₹{tableAmount}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Cafe Total</span>
              <span>₹{cafeTotal}</span>
            </div>
            <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-300 uppercase tracking-widest">Total Amount</span>
              <span className="text-xl font-bold text-white">₹{booking.amount}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
