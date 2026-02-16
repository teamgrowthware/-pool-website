'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PoolTable, TableSession, CafeItem } from '@/types';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface PoolContextType {
    tables: PoolTable[];
    startSession: (tableId: string, customerName: string, phone: string, durationMinutes: number) => void;
    endSession: (tableId: string) => void;
    addCafeOrder: (tableId: string, items: CafeItem[]) => void;
    extendTime: (tableId: string, additionalMinutes: number) => void;
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

export const PoolProvider = ({ children }: { children: ReactNode }) => {
    // Initialize with empty array
    const [tables, setTables] = useState<PoolTable[]>([]);
    const { token } = useAuth();

    const fetchTables = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/tables`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setTables(data);
            }
        } catch (err) {
            console.error("Failed to fetch admin tables:", err);
        }
    }, [token]);

    // Initial Fetch & Polling
    useEffect(() => {
        if (token) {
            fetchTables();
            const interval = setInterval(fetchTables, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [token, fetchTables]);

    const startSession = async (tableId: string, customerName: string, phone: string, durationMinutes: number) => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/bookings/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tableId, customerName, phone, duration: durationMinutes })
            });
            if (res.ok) fetchTables();
        } catch (err) {
            console.error("Failed to start session:", err);
        }
    };

    const endSession = async (tableId: string) => {
        if (!token) return;
        // Find booking ID from table state
        const table = tables.find(t => t.id === tableId);
        if (!table?.currentSession?.bookingId) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/bookings/${table.currentSession.bookingId}/end`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) fetchTables();
        } catch (err) {
            console.error("Failed to end session:", err);
        }
    };

    const addCafeOrder = async (tableId: string, items: CafeItem[]) => {
        if (!token) return;
        // Optimistic Update
        setTables(prevTables => prevTables.map(t => {
            if (t.id === tableId && t.currentSession) {
                return {
                    ...t,
                    currentSession: {
                        ...t.currentSession,
                        cafeOrders: [...(t.currentSession.cafeOrders || []), ...items.map(i => ({
                            menu_item_id: i.id,
                            name: i.name,
                            price: i.price,
                            quantity: 1
                        }))]
                    }
                };
            }
            return t;
        }));

        const table = tables.find(t => t.id === tableId);
        if (!table?.currentSession?.bookingId) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/bookings/${table.currentSession.bookingId}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ items })
            });
            if (res.ok) fetchTables();
        } catch (err) {
            console.error("Failed to add orders:", err);
            fetchTables(); // Revert on error
        }
    };

    const extendTime = async (tableId: string, additionalMinutes: number) => {
        if (!token) return;
        const table = tables.find(t => t.id === tableId);
        if (!table?.currentSession?.bookingId) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/bookings/${table.currentSession.bookingId}/extend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ minutes: additionalMinutes })
            });
            if (res.ok) fetchTables();
        } catch (err) {
            console.error("Failed to extend time:", err);
        }
    };

    return (
        <PoolContext.Provider value={{ tables, startSession, endSession, addCafeOrder, extendTime }}>
            {children}
        </PoolContext.Provider>
    );
};

export const usePool = () => {
    const context = useContext(PoolContext);
    if (!context) {
        throw new Error('usePool must be used within a PoolProvider');
    }
    return context;
};
