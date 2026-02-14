import Link from 'next/link';
import { AlertTriangle, Package } from 'lucide-react';

// ... (interfaces remain)

const InventoryWidget = ({ inventory }: InventoryWidgetProps) => {
    const lowStockItems = inventory.filter(item => item.totalStock <= item.minStock);

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            {/* ... (header remains) */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-slate-700" />
                    <h3 className="font-bold text-slate-900">Inventory Status</h3>
                </div>
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    {lowStockItems.length} Low Stock Alert
                </span>
            </div>

            <div className="space-y-4">
                {inventory.slice(0, 5).map(item => (
                    <div key={item._id} className="group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                                {item.totalStock <= item.minStock && (
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                )}
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                                {item.totalStock} / {item.minStock} {item.unit}
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${item.totalStock <= item.minStock ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}
                                style={{ width: `${Math.min((item.totalStock / (item.minStock * 2)) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <Link href="/inventory" className="block text-center w-full mt-6 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl transition-colors">
                Manage Inventory
            </Link>
        </div>
    );
};

export default InventoryWidget;
