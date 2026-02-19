'use client';

import React, { useState, useEffect } from 'react';
import { Coffee, Utensils, ClipboardList, Package, Plus, Search, Filter, TrendingUp, IndianRupee, Users } from 'lucide-react';
import { mockCafeItems, mockCafeOrders, mockInventory } from '@/mock/data';
import { CafeItem, CafeOrder } from '@/types';
import { API_BASE_URL } from '@/lib/api';
import AddOrderModal from '@/components/cafe/AddOrderModal';
import { useAuth } from '@/context/AuthContext';

const TABS = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'menu', label: 'Menu & Categories', icon: Utensils },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'inventory', label: 'Inventory', icon: Package },
];

export default function CafeManagement() {
    const { token } = useAuth();
    const [items, setItems] = useState<CafeItem[]>([]);
    const [orders, setOrders] = useState<CafeOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        category: 'Food',
        price: '',
        description: '',
        image: '',
        inStock: true
    });

    const [editingId, setEditingId] = useState<string | null>(null);

    const [stats, setStats] = useState({ revenue: 0, activeOrders: 0, lowStock: 0 });

    // Fetch Menu Items & Stats
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const [menuRes, statsRes, ordersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/menu`, { headers }),
                fetch(`${API_BASE_URL}/admin/cafe-stats`, { headers }),
                fetch(`${API_BASE_URL}/orders`, { headers })
            ]);

            if (menuRes.ok) {
                const data = await menuRes.json();
                const mappedData = data.map((item: any) => ({
                    ...item,
                    id: item._id,
                    inStock: item.inStock !== false // Handle undefined as true if default
                }));
                setItems(mappedData);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                // Map backend order to frontend interface if needed
                // Backend: _id, table_id, customer_name, items, total_amount, status
                // Frontend: id, tableId, customerName, items, totalAmount, status
                const mappedOrders = ordersData.map((o: any) => ({
                    id: o._id,
                    tableId: o.table_id || 'Walk-in', // Or fetch table name if possible
                    customerName: o.customer_name || 'Guest',
                    items: o.items,
                    totalAmount: o.total_amount,
                    status: o.status,
                    createdAt: o.created_at
                }));
                setOrders(mappedOrders);
            }
        } catch (err) {
            console.error("Failed to fetch cafe data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleEdit = (item: CafeItem) => {
        setFormData({
            name: item.name,
            category: item.category,
            price: item.price.toString(),
            description: item.description || '',
            image: item.image || '',
            inStock: item.inStock
        });
        setEditingId(item.id);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `${API_BASE_URL}/menu/${editingId}`
                : `${API_BASE_URL}/menu`;

            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price)
                })
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ name: '', category: 'Food', price: '', description: '', image: '', inStock: true });
                setEditingId(null);
                fetchData(); // Refresh data
            }
        } catch (err) {
            console.error("Failed to save item:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await fetch(`${API_BASE_URL}/menu/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData(); // Refresh data
        } catch (err) {
            console.error("Failed to delete item:", err);
        }
    };

    // Filter items based on search
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteOrder = async (id: string) => {
        if (!confirm('Are you sure you want to delete this order history?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData(); // Refresh data
            } else {
                alert('Failed to delete order');
            }
        } catch (err) {
            console.error("Failed to delete order:", err);
        }
    };

    const cafeInventory = mockInventory.filter(item => item.category === 'cafe');
    // const pendingOrders = mockCafeOrders.filter(o => o.status === 'pending' || o.status === 'preparing'); // Using backend stats now

    const renderOverview = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Active Orders', value: stats.activeOrders, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Items', value: items.length, icon: Coffee, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Low Stock Items', value: stats.lowStock, icon: Package, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Popular Items */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Popular Items</h3>
                    <div className="space-y-4">
                        {items.slice(0, 3).map((item, i) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <div className="font-bold text-slate-400 w-6">#{i + 1}</div>
                                <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900">{item.name}</h4>
                                    <p className="text-xs text-slate-500">{item.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">₹{item.price}</p>
                                    <p className={`text-xs ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>{item.inStock ? 'In Stock' : 'Out of Stock'}</p>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && <p className="text-slate-500 text-sm">No items found. Add some!</p>}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button onClick={() => setShowOrderModal(true)} className="w-full flex items-center gap-3 p-3 text-left rounded-xl hover:bg-slate-50 transition-colors border border-dashed border-slate-200 hover:border-blue-300 group">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">Add New Order</p>
                                <p className="text-xs text-slate-500">Create order for walk-in</p>
                            </div>
                        </button>

                        <button onClick={() => setShowModal(true)} className="w-full flex items-center gap-3 p-3 text-left rounded-xl hover:bg-slate-50 transition-colors border border-dashed border-slate-200 hover:border-orange-300 group">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <Utensils className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">Add Menu Item</p>
                                <p className="text-xs text-slate-500">Update cafe menu</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMenu = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '', category: 'Food', price: '', description: '', image: '', inStock: true });
                        setEditingId(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Item
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-slate-500">Loading menu...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all relative">
                            <div className="h-40 overflow-hidden relative">
                                <img src={item.image || 'https://via.placeholder.com/300?text=No+Image'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${item.inStock ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-900">{item.name}</h4>
                                        <p className="text-xs text-slate-500">{item.category}</p>
                                    </div>
                                    <span className="font-bold text-slate-900">₹{item.price}</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{item.description}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderOrders = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer / Table</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {orders.length > 0 ? orders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs font-medium text-slate-500">#{order.id.slice(-6)}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-700">{order.tableId === 'Walk-in' ? 'Walk-in' : 'Table Order'}</div>
                                    <div className="text-xs text-slate-500">{order.customerName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        {order.items.map((item, i) => (
                                            <span key={i} className="text-xs text-slate-600">
                                                {item.quantity}x {item.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-900">₹{order.totalAmount}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.status === 'served' ? 'bg-green-50 text-green-600 border border-green-100' :
                                        order.status === 'preparing' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                            'bg-slate-50 text-slate-500'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                    No active orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderInventory = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cafeInventory.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.category}</p>
                            <h4 className="font-bold text-slate-900 text-lg">{item.name}</h4>
                            <p className="text-sm text-slate-500 mt-1">
                                <span className={`font-bold ${item.totalStock <= item.minStock ? 'text-red-500' : 'text-slate-700'}`}>
                                    {item.totalStock} {item.unit}
                                </span> available
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.totalStock <= item.minStock ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                            }`}>
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                ))}

                <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 hover:bg-slate-100 hover:border-slate-300 transition-all group">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-slate-400" />
                    </div>
                    <span className="font-semibold text-slate-500">Add Stock Item</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Coffee className="w-7 h-7 text-orange-600" />
                        Cafe Management
                    </h1>
                    <p className="text-slate-500">Manage menu, orders, and cafe inventory.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 overflow-x-auto">
                <div className="flex space-x-8 min-w-max">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-4 px-1 text-sm font-bold transition-all border-b-2 ${isActive
                                    ? 'text-orange-600 border-orange-600'
                                    : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'menu' && renderMenu()}
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'inventory' && renderInventory()}
            </div>

            {/* Add Item Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Menu Item' : 'Edit Menu Item'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* ... form fields ... */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-xl"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-xl"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Food</option>
                                    <option>Beverages</option>
                                    <option>Sides</option>
                                    <option>Dessert</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-3 py-2 border rounded-xl"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-xl"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-xl"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                                >
                                    Add Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Order Modal */}
            {showOrderModal && (
                <AddOrderModal
                    items={items}
                    onClose={() => setShowOrderModal(false)}
                    onOrderCreated={() => {
                        setShowOrderModal(false);
                        fetchData(); // Refresh stats
                    }}
                />
            )}
        </div>
    );
}
