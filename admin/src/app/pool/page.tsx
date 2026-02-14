'use client';

import React from 'react';
import { usePool } from '@/context/PoolContext';
import { PoolTable } from '@/types';
import PoolTableCard from '@/components/pool/PoolTableCard';
import StartSessionModal from '@/components/pool/modals/StartSessionModal';
import ManageSessionModal from '@/components/pool/modals/ManageSessionModal';
import BillSummaryModal from '@/components/pool/modals/BillSummaryModal';
import { LayoutGrid, Filter, Plus } from 'lucide-react';

// const CATEGORIES = ['All', 'Snooker'];

export default function PoolManagement() {
    // const [activeCategory, setActiveCategory] = useState('All');
    // const filteredTables = mockPoolTables;
    // Actually just remove the state.
    const { tables, startSession, endSession, addCafeOrder, extendTime } = usePool();
    const [startModalTable, setStartModalTable] = React.useState<PoolTable | null>(null);
    const [manageModalId, setManageModalId] = React.useState<string | null>(null);
    const [billModalTable, setBillModalTable] = React.useState<PoolTable | null>(null);

    // Filter to show only relevant tables if needed, but for now we show all from context
    // We already limited mock data to 2 Snooker tables, so 'tables' from context should be correct.
    const filteredTables = tables;

    // Derived active table for management to ensure live updates
    const activeManageTable = React.useMemo(() =>
        tables.find(t => t.id === manageModalId) || null
        , [tables, manageModalId]);

    const handleTableClick = (table: PoolTable) => {
        if (table.isActive) {
            setManageModalId(table.id);
        } else {
            setStartModalTable(table);
        }
    };

    const onStartSession = (name: string, phone: string, duration: number) => {
        if (startModalTable) {
            startSession(startModalTable.id, name, phone, duration);
            setStartModalTable(null);
        }
    };

    const onEndSessionRequest = () => {
        if (activeManageTable) {
            setBillModalTable(activeManageTable); // Snapshot for bill
            setManageModalId(null);
        }
    };

    const onPaymentComplete = () => {
        if (billModalTable) {
            endSession(billModalTable.id);
            setBillModalTable(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <LayoutGrid className="w-6 h-6 text-blue-600" />
                        Pool Table Management
                    </h1>
                    <p className="text-slate-500">Real-time status of all pool and snooker tables.</p>
                </div>
            </div>

            {/* Legend & Summary */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 border-dashed">
                <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
                        <span>Running</span>
                    </div>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Showing {filteredTables.length} tables
                </div>
            </div>

            {/* 2D Table Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto min-h-[400px]">
                {filteredTables.length > 0 ? (
                    filteredTables.map((table) => (
                        <PoolTableCard
                            key={table.id}
                            table={table}
                            onClick={() => handleTableClick(table)}
                        />
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Filter className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="font-bold">No tables found</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {startModalTable && (
                <StartSessionModal
                    isOpen={!!startModalTable}
                    onClose={() => setStartModalTable(null)}
                    onStart={onStartSession}
                    table={startModalTable}
                />
            )}

            {activeManageTable && (
                <ManageSessionModal
                    isOpen={!!activeManageTable}
                    onClose={() => setManageModalId(null)}
                    table={activeManageTable}
                    onEndSession={onEndSessionRequest}
                    onAddCafeOrder={(items) => addCafeOrder(activeManageTable.id, items)}
                    onExtend={(mins) => extendTime(activeManageTable.id, mins)}
                />
            )}

            {billModalTable && (
                <BillSummaryModal
                    isOpen={!!billModalTable}
                    onClose={() => setBillModalTable(null)}
                    table={billModalTable}
                    onPaymentComplete={onPaymentComplete}
                />
            )}
        </div>
    );
}

