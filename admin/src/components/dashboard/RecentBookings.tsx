import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';

interface BookingUser {
    username: string;
    phone: string;
}

interface BookingTable {
    type: string;
    table_number: number;
}

interface RecentBooking {
    _id: string;
    user_id?: BookingUser;
    guest_name?: string;
    guest_phone?: string;
    table_id?: BookingTable;
    start_time: string;
    total_price: number;
    status: string;
}

interface RecentBookingsProps {
    bookings: RecentBooking[];
}

const RecentBookings = ({ bookings }: RecentBookingsProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-50 text-green-600 border-green-100';
            case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Recent Bookings</h3>
                <Link href="/bookings" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resource</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Slot</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {bookings.map((booking) => (
                            <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">
                                        {booking.user_id ? booking.user_id.username : (booking.guest_name || 'Guest')}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {booking.user_id ? booking.user_id.phone : (booking.guest_phone || 'N/A')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${booking.table_id?.type === 'Pool' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                        {booking.table_id?.type.toUpperCase() || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    Table {booking.table_id?.table_number}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{booking.total_price}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-md border ${getStatusColor(booking.status.toLowerCase())}`}>
                                        {booking.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentBookings;
