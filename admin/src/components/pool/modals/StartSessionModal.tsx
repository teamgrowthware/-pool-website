'use client';

import React, { useState } from 'react';
import { X, User, Phone, Clock, Play } from 'lucide-react';
import { PoolTable } from '@/types';

interface StartSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (customerName: string, phone: string, duration: number) => void;
    table: PoolTable;
}

const DURATIONS = [
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: 'Custom', value: 0 }
];

const StartSessionModal: React.FC<StartSessionModalProps> = ({ isOpen, onClose, onStart, table }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [duration, setDuration] = useState(60);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && phone && duration > 0) {
            onStart(name, phone, duration);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Start Session</h2>
                        <p className="text-sm text-slate-500">{table.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Details</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Customer Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="tel"
                                placeholder="Mobile Number"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</label>
                        <div className="grid grid-cols-2 gap-3">
                            {DURATIONS.map((opt) => (
                                <button
                                    key={opt.label}
                                    type="button"
                                    onClick={() => setDuration(opt.value)}
                                    className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all border ${duration === opt.value
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        {duration === 0 && (
                            <div className="relative mt-2">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    placeholder="Enter minutes"
                                    onChange={e => setDuration(parseInt(e.target.value))}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        Start Session
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StartSessionModal;
