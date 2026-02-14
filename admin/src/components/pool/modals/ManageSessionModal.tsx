'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, StopCircle, Plus, Coffee, ChevronRight, Search, Receipt, CheckCircle2 } from 'lucide-react';
import { PoolTable, CafeItem } from '@/types';
import { mockCafeItems } from '@/mock/data';

interface ManageSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: PoolTable;
    onEndSession: () => void;
    onAddCafeOrder: (items: CafeItem[]) => void;
    onExtend: (minutes: number) => void;
}

const ManageSessionModal: React.FC<ManageSessionModalProps> = ({
    isOpen,
    onClose,
    table,
    onEndSession,
    onAddCafeOrder,
    onExtend
}) => {
    // =========================================================================
    // 1. ALL HOOKS DECLARATIONS (Must run on every render)
    // =========================================================================

    // View State
    const [activeTab, setActiveTab] = useState<'main' | 'cafe'>('main');

    // Timer State
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    // Cafe Filter State (Hoisted to top level)
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Cart State (New)
    const [cart, setCart] = useState<CafeItem[]>([]);

    // Feedback State
    const [justAddedId, setJustAddedId] = useState<string | null>(null);

    // Timer Effect
    useEffect(() => {
        if (!isOpen || !table.currentSession) return;

        const updateTimer = () => {
            const start = new Date(table.currentSession!.startTime).getTime();
            const now = new Date().getTime();
            const diff = now - start;

            if (diff < 0) {
                setElapsedTime('00:00:00');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer(); // Initial call
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [isOpen, table.currentSession]);

    // Data Preparation & Memoization
    const displayItems = useMemo(() => {
        const items = [...mockCafeItems];
        // Ensure dummy items are present for demo purposes
        if (!items.find(i => i.name === 'Choti Advance')) {
            items.push({ id: 'temp1', name: 'Choti Advance', category: 'Cigarettes', price: 12, inStock: true });
            items.push({ id: 'temp2', name: 'Masala Maggi', category: 'Maggi', price: 50, inStock: true });
            items.push({ id: 'temp3', name: 'Coke (Can)', category: 'Cold Drinks', price: 40, inStock: true });
        }
        return items;
    }, []);

    const filteredItems = useMemo(() => {
        return displayItems.filter(i =>
            (activeCategory === 'All' || i.category === activeCategory) &&
            i.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [displayItems, activeCategory, searchQuery]);

    // Session Data Derivation
    const sessionItems = table.currentSession?.cafeOrders || [];
    const sessionCafeTotal = sessionItems.reduce((acc, i) => acc + ((i.price || 0) * (i.quantity || 1)), 0);

    // Cart Data Derivation
    const cartTotal = cart.reduce((acc, i) => acc + i.price, 0);

    // =========================================================================
    // 2. HANDLERS
    // =========================================================================

    const handleCafeAdd = (item: CafeItem) => {
        // onAddCafeOrder([item]); // OLD: Immediate add
        setCart(prev => [...prev, item]); // NEW: Add to cart
        setJustAddedId(item.id);
        setTimeout(() => setJustAddedId(null), 1500);
    };

    const handleRemoveFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirmOrder = () => {
        if (cart.length === 0) return;
        onAddCafeOrder(cart);
        setCart([]);
        setActiveTab('main'); // Switch back to summary to see bill
    };

    const categories = ['All', 'Cigarettes', 'Maggi', 'Sandwich', 'Cold Drinks'];

    // =========================================================================
    // 3. SAFE RETURN (Conditional Rendering)
    // =========================================================================

    if (!isOpen || !table.currentSession) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">

                {/* ---------------- HEADER ---------------- */}
                <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            {activeTab === 'main' ? (
                                <>
                                    <span>{table.name}</span>
                                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                        Active Session
                                    </span>
                                </>
                            ) : (
                                'Add Cafe Items'
                            )}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ---------------- BODY ---------------- */}
                <div className="p-6 bg-white min-h-[400px]">

                    {activeTab === 'main' ? (
                        // ================= MAIN VIEW UI =================
                        <>
                            {/* Timer Display */}
                            <div className="flex flex-col items-center justify-center py-6 bg-slate-900 text-white rounded-2xl mb-6 relative overflow-hidden ring-1 ring-slate-800">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-slate-900 to-slate-900"></div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Elapsed Time</div>
                                <div className="text-4xl font-mono font-bold tracking-wider z-10">{elapsedTime}</div>
                                <div className="mt-2 flex items-center gap-2 text-slate-400 text-xs">
                                    <Clock className="w-3 h-3" />
                                    <span>Booked for {table.currentSession?.bookedDuration} mins</span>
                                </div>
                            </div>

                            {/* Actions Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setActiveTab('cafe')}
                                    className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-xl flex flex-col items-center gap-2 transition-all group active:scale-95"
                                >
                                    <div className="w-10 h-10 bg-orange-100 group-hover:bg-white rounded-full flex items-center justify-center text-orange-600 transition-colors shadow-sm">
                                        <Coffee className="w-5 h-5" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-bold text-orange-800 text-sm">Cafe Menu</span>
                                        <span className="text-[10px] text-orange-600/80 font-medium">Add snacks & drinks</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => onExtend(30)}
                                    className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl flex flex-col items-center gap-2 transition-all group active:scale-95"
                                >
                                    <div className="w-10 h-10 bg-blue-100 group-hover:bg-white rounded-full flex items-center justify-center text-blue-600 transition-colors shadow-sm">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-bold text-blue-800 text-sm">Extend Time</span>
                                        <span className="text-[10px] text-blue-600/80 font-medium">+30 Minutes</span>
                                    </div>
                                </button>
                            </div>

                            {/* Current Session Summary */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Bill</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Scheduled Time</span>
                                        <span className="font-semibold text-slate-700">{(table.currentSession!.bookedDuration / 60).toFixed(1)} hrs</span>
                                    </div>

                                    {sessionItems.length > 0 && (
                                        <div className="flex justify-between items-center text-sm animate-in slide-in-from-left-2 fade-in duration-300">
                                            <span className="text-slate-500 flex items-center gap-2">
                                                <Coffee className="w-3.5 h-3.5 text-orange-500" />
                                                Cafe Items ({sessionItems.length})
                                            </span>
                                            <span className="font-bold text-slate-700">₹{sessionCafeTotal}</span>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-slate-200 mt-1 flex justify-between items-center">
                                        <button
                                            onClick={onEndSession}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold rounded-lg text-xs transition-colors flex items-center gap-2"
                                        >
                                            <StopCircle className="w-3.5 h-3.5" />
                                            End Session
                                        </button>
                                        <span className="text-xs text-slate-400 font-medium">
                                            Customer: {table.currentSession?.customerName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        // ================= CAFE VIEW UI =================
                        <div className="h-[520px] flex flex-col">
                            {/* Header Controls */}
                            <div className="flex items-center gap-2 mb-4">
                                <button onClick={() => setActiveTab('main')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                    <ChevronRight className="w-5 h-5 rotate-180" />
                                </button>
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/10"
                                        placeholder="Search menu..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${activeCategory === cat
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-4 flex-1 overflow-hidden">
                                {/* Items List */}
                                <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                                    {filteredItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleCafeAdd(item)}
                                            className="w-full flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group relative overflow-hidden"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{item.category}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-700">₹{item.price}</span>
                                                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-colors">
                                                    <Plus className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                            {justAddedId === item.id && (
                                                <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in duration-200">
                                                    <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Added
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Live Cart Sidebar (NEW) */}
                                <div className="w-1/3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col overflow-hidden hidden md:flex">
                                    <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase">New Order</h3>
                                        <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{cart.length}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                        {cart.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-2">
                                                <Coffee className="w-8 h-8 opacity-20 mb-2" />
                                                <span className="text-[10px] font-medium opacity-60">Add items to cart</span>
                                            </div>
                                        ) : (
                                            cart.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start text-xs p-2 bg-white rounded-lg border border-slate-100 shadow-sm animate-in slide-in-from-right-2 fade-in duration-300 group">
                                                    <span className="font-medium text-slate-700 w-full truncate pr-2">{item.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900">₹{item.price}</span>
                                                        <button
                                                            onClick={() => handleRemoveFromCart(idx)}
                                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-3 bg-white border-t border-slate-200">
                                        <div className="flex justify-between items-center text-sm font-bold mb-3">
                                            <span className="text-slate-500">Total</span>
                                            <span className="text-orange-600">₹{cartTotal}</span>
                                        </div>
                                        <button
                                            onClick={handleConfirmOrder}
                                            disabled={cart.length === 0}
                                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Receipt className="w-3.5 h-3.5" />
                                            Add to Bill
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageSessionModal;
