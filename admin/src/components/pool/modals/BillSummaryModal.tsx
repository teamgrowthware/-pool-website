'use client';

import React, { useState } from 'react';
import { X, Receipt, CheckCircle, CreditCard, Banknote } from 'lucide-react';
import { PoolTable } from '@/types';

interface BillSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: PoolTable;
    onPaymentComplete: (method: 'cash' | 'online') => void;
}

const BillSummaryModal: React.FC<BillSummaryModalProps> = ({ isOpen, onClose, table, onPaymentComplete }) => {
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | null>(null);

    if (!isOpen || !table.currentSession) return null;

    // Calculate Bill Logic
    const start = new Date(table.currentSession.startTime).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = (now - start) / 1000;

    // Pricing Rule: Base rate / 3600 per second
    const ratePerSecond = table.pricePerHour / 3600;
    const tableAmount = Math.round(elapsedSeconds * ratePerSecond);

    // Format Duration HH:MM:SS
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = Math.floor(elapsedSeconds % 60);
    const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Cafe Total
    // Flatten approach similar to ManageSessionModal if needed, or rely on active session structure
    // CafeOrders is Array<{items: CafeItem[], totalAmount}> usually.
    // Let's re-verify structure. Data.ts has `cafeOrders: CafeOrder[]`. `CafeOrder` has `items` and `totalAmount`.
    // Yes, reduce on orders totalAmount is correct.
    // Cafe Total
    // Backend returns flat array of items in cafeOrders
    const cafeOrders = table.currentSession.cafeOrders || [];
    const cafeCost = cafeOrders.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
    const cafeItemCount = cafeOrders.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const totalAmount = tableAmount + cafeCost;

    const handleConfirm = () => {
        if (paymentMethod) {
            onPaymentComplete(paymentMethod);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-900 p-6 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-slate-900 to-slate-900"></div>
                    <Receipt className="w-12 h-12 mx-auto mb-3 opacity-80" />
                    <h2 className="text-2xl font-bold tracking-tight">Bill Summary</h2>
                    <p className="text-slate-400 text-sm">{table.name}</p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100">
                        <span className="text-slate-500">Customer</span>
                        <span className="font-bold text-slate-900">{table.currentSession.customerName}</span>
                    </div>

                    <div className="space-y-3 py-2 border-b border-slate-100">
                        {/* Table Time Breakdown */}
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex flex-col">
                                <span className="text-slate-500">Table Time Used</span>
                                <span className="text-xs text-slate-400 font-mono">{formattedDuration}</span>
                            </div>
                            <span className="font-bold text-slate-900">₹{tableAmount}</span>
                        </div>

                        {/* Cafe Breakdown */}
                        {cafeItemCount > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex flex-col">
                                    <span className="text-slate-500">Cafe Items</span>
                                    <span className="text-xs text-slate-400">{cafeItemCount} items</span>
                                </div>
                                <span className="font-bold text-slate-900">₹{cafeCost}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <span className="text-lg font-bold text-slate-600">Grand Total</span>
                        <span className="text-3xl font-black text-slate-900">₹{totalAmount}</span>
                    </div>

                    <div className="space-y-3 pt-4">
                        <p className="text-xs font-bold text-slate-500 uppercase text-center">Select Payment Method</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setPaymentMethod('cash')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cash'
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Banknote className="w-6 h-6" />
                                <span className="text-xs font-bold">Cash</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('online')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'online'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <CreditCard className="w-6 h-6" />
                                <span className="text-xs font-bold">Online</span>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={!paymentMethod}
                        className="w-full mt-4 py-3 bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Complete Payment
                    </button>

                    <button onClick={onClose} className="w-full py-2 text-slate-400 text-xs font-bold hover:text-slate-600">
                        Cancel & Return
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillSummaryModal;
