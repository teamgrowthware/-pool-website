import React from 'react';

interface ChartContainerProps {
    title: string;
    subtitle?: string;
    data?: any[];
    dataKey?: string;
    labelKey?: string;
    color?: string; // e.g. 'bg-blue-500'
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, subtitle, data = [], dataKey = 'value', labelKey = 'name', color = 'bg-blue-500' }) => {
    // Find max value for scaling
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d[dataKey] || 0)) : 100;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="mb-6">
                <h3 className="font-bold text-slate-900">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>

            {/* Chart Placeholder UI */}
            <div className="h-64 flex flex-col items-end gap-1.5 justify-end">
                <div className={`flex items-end justify-between w-full h-full px-2 ${data.length > 20 ? 'gap-[1px]' : 'gap-2'}`}>
                    {data.map((item, i) => {
                        const val = item[dataKey] || 0;
                        const height = maxValue > 0 ? (val / maxValue) * 100 : 0;

                        // Map tailwind classes to hex for fallback reliability
                        const colorMap: Record<string, string> = {
                            'bg-blue-500': '#3b82f6',
                            'bg-green-500': '#22c55e',
                            'bg-purple-500': '#a855f7',
                            'bg-orange-500': '#f97316',
                        };
                        const hexColor = colorMap[color || ''] || '#3b82f6';

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                <div
                                    className={`w-full rounded-t-[2px] transition-all duration-300 relative group-hover:opacity-80`}
                                    style={{
                                        height: `${Math.max(height, 2)}%`, // Ensure at least 2% height so 0 isn't invisible
                                        backgroundColor: hexColor,
                                        minWidth: '4px' // Force minimum width
                                    }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {val}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="w-full h-[1px] bg-slate-100"></div>
                <div className="flex justify-between w-full px-2">
                    {data.map((item, i) => {
                        // Logic to prevent label overlap:
                        // If more than 12 items, show every 4th label
                        // Always show the first and last label
                        const showLabel =
                            data.length <= 12 ||
                            i === 0 ||
                            i === data.length - 1 ||
                            i % 4 === 0;

                        return (
                            <span key={i} className="text-[10px] text-slate-400 font-medium text-center w-full">
                                {showLabel ? item[labelKey] : ''}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ChartContainer;
