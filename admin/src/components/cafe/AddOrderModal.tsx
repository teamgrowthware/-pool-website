import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Minus, User, Table, Coffee } from 'lucide-react';
import { CafeItem } from '@/types';
import { API_BASE_URL } from '@/lib/api';

interface AddOrderModalProps {
  items: CafeItem[];
  onClose: () => void;
  onOrderCreated: () => void;
}

export default function AddOrderModal({ items, onClose, onOrderCreated }: AddOrderModalProps) {
  const [orderType, setOrderType] = useState<'direct' | 'table'>('direct');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [activeTables, setActiveTables] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<{ item: CafeItem; quantity: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (orderType === 'table') {
      fetchActiveTables();
    }
  }, [orderType]);

  const fetchActiveTables = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tables`);
      if (res.ok) {
        const tables = await res.json();
        // Filter only active tables with running sessions
        const active = tables.filter((t: any) => t.isActive && t.currentSession);
        setActiveTables(active);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (item: CafeItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.item.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((total, { item, quantity }) => total + (item.price * quantity), 0);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return alert('Cart is empty!');

    try {
      if (orderType === 'table') {
        if (!selectedTable) return alert('Please select a table');

        const table = activeTables.find(t => t.id === selectedTable);
        if (!table?.currentSession?.bookingId) return alert('Invalid session');

        const res = await fetch(`${API_BASE_URL}/admin/bookings/${table.currentSession.bookingId}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.map(({ item, quantity }) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity
            }))
          })
        });

        if (res.ok) {
          onOrderCreated(); // Refresh parent
          onClose();
        } else {
          alert('Failed to add to table');
        }

      } else {
        // Direct Order
        const res = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customerName || 'Walk-in',
            items: cart.map(({ item, quantity }) => ({
              menuItem: item.id,
              name: item.name,
              price: item.price,
              quantity
            })),
            // Assuming backend handles total calculation or we send it
          })
        });

        if (res.ok) {
          onOrderCreated(); // Refresh parent
          onClose();
        } else {
          const err = await res.json();
          alert(err.message || 'Failed to create order');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Left: Menu Selection */}
        <div className="flex-1 flex flex-col border-r border-slate-100 bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                autoFocus
                placeholder="Search menu items..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group"
              >
                <div className="aspect-square rounded-lg bg-slate-100 mb-2 overflow-hidden">
                  <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                <p className="text-xs text-slate-500 font-medium">₹{item.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Order Details */}
        <div className="w-[350px] flex flex-col bg-white">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-lg">New Order</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4 border-b border-slate-100">
            {/* Order Type Toggle */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setOrderType('direct')}
                className={`py-1.5 px-3 rounded-lg text-sm font-bold transition-all ${orderType === 'direct' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Direct Order
              </button>
              <button
                onClick={() => setOrderType('table')}
                className={`py-1.5 px-3 rounded-lg text-sm font-bold transition-all ${orderType === 'table' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Link Table
              </button>
            </div>

            {/* Order Type Specific Inputs */}
            {orderType === 'table' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Active Table</label>
                {activeTables.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {activeTables.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTable(t.id)}
                        className={`p-2 rounded-xl border text-left transition-all ${selectedTable === t.id ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="font-bold text-xs text-slate-900">{t.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{t.currentSession.customerName}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-orange-50 text-orange-600 text-xs rounded-lg border border-orange-100">
                    No active tables found.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="Walk-in Customer"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length > 0 ? cart.map(({ item, quantity }) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <h5 className="font-bold text-sm text-slate-900">{item.name}</h5>
                  <p className="text-xs text-slate-500">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                  <button onClick={() => quantity > 1 ? updateQuantity(item.id, -1) : removeFromCart(item.id)} className="p-1 hover:bg-white rounded-md shadow-sm transition-all text-slate-500">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-md shadow-sm transition-all text-slate-500">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="font-bold text-sm min-w-[3rem] text-right">₹{item.price * quantity}</span>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50">
                <Coffee className="w-8 h-8" />
                <span className="text-xs">Cart is empty</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-500 font-medium">Total Amount</span>
              <span className="text-xl font-bold text-slate-900">₹{calculateTotal()}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={cart.length === 0 || (orderType === 'table' && !selectedTable)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-95"
            >
              {orderType === 'table' ? 'Add to Booking' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
