'use client';

import React from 'react';
import { Search, Bell, Moon, Sun, ChevronDown, Menu } from 'lucide-react';

import { useSearch } from '@/context/SearchContext';

interface TopbarProps {
    onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
    const { searchQuery, setSearchQuery } = useSearch();

    return (
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 z-40 transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="max-w-xl">
                    {/* Search bar removed as per request */}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notification button and Admin button removed */}
            </div>
        </header>
    );
};

export default Topbar;
