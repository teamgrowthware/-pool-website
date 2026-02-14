'use client';

import React from 'react';
import { PoolTable } from '@/types';

interface PoolTableCardProps {
    table: PoolTable;
    onClick?: () => void;
}

const PoolTableCard: React.FC<PoolTableCardProps> = ({ table, onClick }) => {
    const getTableColor = (category: string) => {
        switch (category) {
            case '8-Ball': return 'bg-emerald-600';
            case 'Snooker': return 'bg-green-700';
            case 'Small': return 'bg-teal-600';
            case 'King Size': return 'bg-blue-700';
            case 'Premium': return 'bg-slate-800';
            default: return 'bg-green-600';
        }
    };

    const getTableProportion = (category: string) => {
        switch (category) {
            case 'Snooker': return 'aspect-[2/1]';
            case 'King Size': return 'aspect-[1.8/1]';
            case 'Small': return 'aspect-[1.5/1]';
            default: return 'aspect-[1.7/1]';
        }
    };

    const [elapsed, setElapsed] = React.useState('00:00:00');

    React.useEffect(() => {
        if (!table.isActive && table.currentSession) {
            const interval = setInterval(() => {
                const start = new Date(table.currentSession!.startTime).getTime();
                const now = new Date().getTime();
                const diff = now - start;
                const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
                setElapsed(`${h}:${m}:${s}`);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [table.isActive, table.currentSession]);

    return (
        <div
            onClick={onClick}
            className={`relative flex flex-col items-center group transition-all duration-300 cursor-pointer ${table.isActive
                ? 'scale-105 filter-none' // Active/Running -> Highlight
                : 'hover:scale-105 active:scale-95'
                }`}
        >
            {/* Table Name Label */}
            <span className={`mb-2 text-xs font-bold uppercase tracking-widest ${table.isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                {table.name}
            </span>

            {/* 2D Top-Down View Pool Table Card */}
            <div className={`relative w-full ${getTableProportion(table.category)} rounded-lg p-2 shadow-xl border-t-2 ${table.isActive ? 'bg-slate-800 border-slate-700 ring-4 ring-blue-500/20' : 'bg-amber-900 border-amber-800/50'
                }`}>
                {/* Table Surface */}
                <div className={`w-full h-full rounded-md shadow-inner flex flex-col items-center justify-center relative overflow-hidden ${getTableColor(table.category)} ${!table.isActive ? 'opacity-80 saturate-[0.75]' : ''}`}>

                    {/* Corner Pockets */}
                    <div className="absolute top-0 left-0 w-4 h-4 bg-slate-900 rounded-br-xl"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 bg-slate-900 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 bg-slate-900 rounded-tr-xl"></div>
                    <div className="absolute bottom-4 right-0 w-4 h-4 translate-y-4 bg-slate-900 rounded-tl-xl"></div>

                    {/* Middle Pockets */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-slate-900 rounded-b-md"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-slate-900 rounded-t-md"></div>

                    {/* Table Markings (Optional subtlety) */}
                    <div className="absolute left-[20%] top-0 bottom-0 w-[1px] bg-white/10"></div>

                    {/* Price and Status Overlay */}
                    <div className="z-10 text-center flex flex-col items-center">
                        {table.isActive && table.currentSession ? (
                            <>
                                <span className="text-white text-2xl font-mono font-bold tracking-widest drop-shadow-md">
                                    {elapsed}
                                </span>
                                <span className="text-[10px] text-white/80 font-semibold mt-1">
                                    {table.currentSession.customerName}
                                </span>
                            </>
                        ) : (
                            <span className="text-white text-lg font-black tracking-tighter drop-shadow-md">
                                ₹{table.pricePerHour}
                                <span className="text-[10px] opacity-70 font-normal">/hr</span>
                            </span>
                        )}

                        <div className={`mt-2 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border ${!table.isActive
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                            : 'bg-blue-600/80 text-white border-blue-400/50 shadow-lg shadow-blue-900/50 animate-pulse'
                            }`}>
                            {table.isActive ? 'Running' : 'Available'}
                        </div>
                    </div>
                </div>

                {/* Table Leg Shadows / Depth (Subtle) */}
                <div className="absolute -bottom-1 left-2 right-2 h-1 bg-black/20 rounded-full blur-sm"></div>
            </div>

            {/* Table Type Tag */}
            <div className={`mt-3 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${table.isActive
                ? 'bg-white text-slate-600 border-slate-100 shadow-sm'
                : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                {table.category}
            </div>
        </div>
    );
};

export default PoolTableCard;
