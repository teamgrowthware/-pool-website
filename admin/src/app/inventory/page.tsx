'use client';

import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, AlertTriangle, CheckCircle2, XCircle, Plus, Minus, Trash2 } from 'lucide-react';
import { InventoryItem } from '@/types';
import { API_BASE_URL } from '@/lib/api';

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<'all' | 'pool' | 'cafe'>('all');
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'general',
        totalStock: 0,
        minStock: 5,
        unit: 'units'
    });

    const fetchInventory = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/inventory`);
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map((item: any) => ({ ...item, id: item._id }));
                setInventory(mapped);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const updateUsedStock = async (id: string, delta: number) => {
        const item = inventory.find(i => i.id === id);
        if (!item) return;

        const newUsed = Math.max(0, Math.min(item.used + delta, item.totalStock));

        // Optimistic update
        setInventory(prev => prev.map(i => i.id === id ? { ...i, used: newUsed } : i));

        try {
            await fetch(`${API_BASE_URL}/inventory/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ used: newUsed })
            });
        } catch (err) {
            console.error('Failed to update stock:', err);
            fetchInventory(); // Revert on error
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/inventory/${id}`, { method: 'DELETE' });
            if (res.ok) fetchInventory();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            if (res.ok) {
                setShowModal(false);
                setNewItem({ name: '', category: 'general', totalStock: 0, minStock: 5, unit: 'units' });
                fetchInventory();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredItems = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (item: InventoryItem) => {
        const remaining = item.totalStock - item.used;
        if (remaining === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle };
        if (remaining <= item.minStock) return { label: 'Low Stock', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: AlertTriangle };
        return { label: 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="w-6 h-6 text-blue-600" />
                        Inventory Management
                    </h1>
                    <p className="text-slate-500">Track cafe ingredients and pool utilities.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </button>

                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        {(['all', 'pool', 'cafe'] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeCategory === cat
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {cat === 'pool' ? 'Snooker' : cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="Search item..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Item Name</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-center">Total Stock</th>
                                <th className="px-6 py-4 font-semibold text-center">Used</th>
                                <th className="px-6 py-4 font-semibold text-center">Remaining</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading inventory...</td></tr>
                            ) : filteredItems.length > 0 ? (
                                filteredItems.map((item) => {
                                    const status = getStockStatus(item);
                                    const StatusIcon = status.icon;
                                    const remaining = item.totalStock - item.used;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{item.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border capitalize ${item.category === 'pool'
                                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                    : 'bg-orange-50 text-orange-700 border-orange-100'
                                                    }`}>
                                                    {item.category === 'pool' ? 'Snooker' : item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {status.label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-slate-600">
                                                {item.totalStock} <span className="text-slate-400 text-xs">{item.unit}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-slate-600">
                                                {item.used} <span className="text-slate-400 text-xs">{item.unit}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`font-bold ${remaining === 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                                    {remaining}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => updateUsedStock(item.id, -1)}
                                                        className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-700 disabled:opacity-30"
                                                        disabled={item.used <= 0}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateUsedStock(item.id, 1)}
                                                        className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-700 disabled:opacity-30"
                                                        disabled={item.used >= item.totalStock}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors ml-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        No items found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Item Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4">Add Inventory Item</h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input className="w-full px-3 py-2 border rounded-xl" required
                                    value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select className="w-full px-3 py-2 border rounded-xl"
                                        value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                                        <option value="general">General</option>
                                        <option value="pool">Pool / Snooker</option>
                                        <option value="cafe">Cafe</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                                    <input className="w-full px-3 py-2 border rounded-xl" required placeholder="kg, pcs, ltr"
                                        value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Stock</label>
                                    <input type="number" className="w-full px-3 py-2 border rounded-xl" required min="0"
                                        value={newItem.totalStock} onChange={e => setNewItem({ ...newItem, totalStock: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Min Alert Lvl</label>
                                    <input type="number" className="w-full px-3 py-2 border rounded-xl" required min="0"
                                        value={newItem.minStock} onChange={e => setNewItem({ ...newItem, minStock: parseInt(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800">Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
