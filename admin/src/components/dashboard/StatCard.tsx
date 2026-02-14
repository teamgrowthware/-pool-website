import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color?: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color = 'blue', onClick }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-200 active:scale-[0.98]' : ''
                }`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {trend.isUp ? '↑' : '↓'} {trend.value}%
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
