'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, User, Building, CreditCard, DollarSign, Table as TableIcon, Lock, Mail, CheckCircle, AlertCircle, Users, Edit2, Shield, X, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { PoolTable } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface UserData {
    _id: string;
    username: string;
    email: string;
    role: string;
}

export default function SettingsPage() {
    const { user, token, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('tables');
    const [tables, setTables] = useState<PoolTable[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Local state for table editing
    const [editingTable, setEditingTable] = useState<PoolTable | null>(null);
    const [editRate, setEditRate] = useState<string>('');

    // Business Profile State
    const [businessProfile, setBusinessProfile] = useState({
        name: 'Poolside Paradise',
        address: '123 Main St, City Center',
        phone: '+91 9876543210',
        email: 'contact@poolside.com'
    });

    // Account Settings State
    const [accountForm, setAccountForm] = useState({
        username: '',
        email: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [accountStatus, setAccountStatus] = useState({ type: '', message: '' });
    const [isSavingAccount, setIsSavingAccount] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Team Management State
    const [teamMembers, setTeamMembers] = useState<UserData[]>([]);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [userForm, setUserForm] = useState({
        username: '',
        email: '',
        role: 'staff',
        newPassword: ''
    });
    const [teamStatus, setTeamStatus] = useState({ type: '', message: '' });
    const [showUserPassword, setShowUserPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setAccountForm(prev => ({
                ...prev,
                username: user.username,
                email: user.email
            }));
        }
    }, [user]);

    const fetchTables = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/tables`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTables(data);
            }
        } catch (err) {
            console.error("Failed to fetch tables:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUniqueUsers = async () => {
        if (user?.role !== 'admin') return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/users`, {
                headers: {
                    'x-auth-token': token || '',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setTeamMembers(data);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBusinessProfile({
                    name: data.business_name || '',
                    address: data.business_address || '',
                    phone: data.business_phone || '',
                    email: data.business_email || ''
                });
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        }
    };

    useEffect(() => {
        if (token) {
            if (activeTab === 'tables') fetchTables();
            if (activeTab === 'business') fetchSettings();
            if (activeTab === 'team') fetchUniqueUsers();
        }
    }, [activeTab, token]);

    // Table Rate Listeners
    const handleEditRate = (table: PoolTable) => {
        setEditingTable(table);
        setEditRate(table.pricePerHour.toString());
    };

    const handleSaveRate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTable) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/tables/${editingTable.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rate_per_hour: parseFloat(editRate) })
            });

            if (res.ok) {
                setEditingTable(null);
                fetchTables();
            }
        } catch (err) {
            console.error("Failed to update rate:", err);
        }
    };

    // Account Updates
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setAccountStatus({ type: '', message: '' });

        if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
            setAccountStatus({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        setIsSavingAccount(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({
                    username: accountForm.username,
                    email: accountForm.email,
                    password: accountForm.newPassword || undefined
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to update profile');

            setAccountStatus({ type: 'success', message: 'Profile updated successfully' });
            const updatedUser = { ...user, ...data.user };
            // @ts-ignore
            updateUser(updatedUser);
            setAccountForm(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));

        } catch (err: any) {
            setAccountStatus({ type: 'error', message: err.message });
        } finally {
            setIsSavingAccount(false);
        }
    };

    // Team Management Logic
    const handleEditUser = (member: UserData) => {
        setEditingUser(member);
        setUserForm({
            username: member.username,
            email: member.email,
            role: member.role,
            newPassword: ''
        });
        setTeamStatus({ type: '', message: '' });
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setTeamStatus({ type: '', message: '' });

        try {
            const res = await fetch(`${API_BASE_URL}/auth/users/${editingUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({
                    username: userForm.username,
                    email: userForm.email,
                    role: userForm.role,
                    password: userForm.newPassword || undefined
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update user');

            setTeamStatus({ type: 'success', message: 'User updated successfully' });
            fetchUniqueUsers(); // Refresh list

            // Close modal after short delay if success
            setTimeout(() => setEditingUser(null), 1000);

        } catch (err: any) {
            setTeamStatus({ type: 'error', message: err.message });
        }
    };

    const handleSaveBusinessProfile = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    business_name: businessProfile.name,
                    business_address: businessProfile.address,
                    business_phone: businessProfile.phone,
                    business_email: businessProfile.email
                })
            });

            if (res.ok) {
                alert('Business profile updated successfully!');
            } else {
                alert('Failed to update profile.');
            }
        } catch (err) {
            console.error("Failed to save settings:", err);
            alert('Error saving settings.');
        }
    };

    // Renderers
    const renderTableSettings = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Pool Table Rates</h2>
                        <p className="text-sm text-slate-500">Configure hourly pricing for each table.</p>
                    </div>
                    <button onClick={fetchTables} className="text-sm text-blue-600 font-bold hover:underline">Refresh</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tables.map(table => (
                        <div key={table.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
                                        {table.name.replace('Table ', '')}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{table.name}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">{table.category}</p>
                                    </div>
                                </div>
                                <div className={`badge px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${table.isActive ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {table.isActive ? 'Active' : 'Ready'}
                                </div>
                            </div>

                            <div className="mt-2 pt-3 border-t border-slate-200 flex justify-between items-end">
                                <span className="text-xl font-bold text-slate-900">₹{table.pricePerHour}<span className="text-sm text-slate-400 font-medium">/hr</span></span>
                                <button
                                    onClick={() => handleEditRate(table)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Edit Price
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Rate Modal */}
            {editingTable && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Edit Table Rate</h3>
                            <button onClick={() => setEditingTable(null)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 text-lg font-bold shadow-sm">
                                {editingTable.name.replace('Table ', '')}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{editingTable.name}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">{editingTable.category} Table</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveRate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Hourly Rate (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                    <input
                                        type="number"
                                        value={editRate}
                                        onChange={(e) => setEditRate(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-lg font-bold"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    This will update the billing rate for all future sessions on this table.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingTable(null)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                >
                                    Save New Rate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    const renderBusinessProfile = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Building className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Business Profile</h2>
                        <p className="text-sm text-slate-500">Manage your business details displayed on invoices.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                        <input
                            type="text"
                            value={businessProfile.name}
                            onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                        <input
                            type="text"
                            value={businessProfile.phone}
                            onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea
                            value={businessProfile.address}
                            onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all h-24 resize-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                        <input
                            type="email"
                            value={businessProfile.email}
                            onChange={(e) => setBusinessProfile({ ...businessProfile, email: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSaveBusinessProfile}
                        className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );

    const renderAccountSettings = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Account Settings</h2>
                        <p className="text-sm text-slate-500">Manage your personal account information and security.</p>
                    </div>
                </div>

                {accountStatus.message && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${accountStatus.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}>
                        {accountStatus.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        <p className="text-sm font-medium">{accountStatus.message}</p>
                    </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={accountForm.username}
                                    onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={accountForm.email}
                                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 mt-6">
                        <h3 className="text-md font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-slate-500" /> Change Password
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={accountForm.newPassword}
                                        onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all pr-10"
                                        placeholder="Leave blank to keep current"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={accountForm.confirmPassword}
                                        onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all pr-10"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSavingAccount}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSavingAccount ? (
                                <>Saving...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderTeamSettings = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Team Management</h2>
                            <p className="text-sm text-slate-500">Manage user access, roles, and credentials.</p>
                        </div>
                    </div>
                    <button onClick={fetchUniqueUsers} className="text-sm text-blue-600 font-bold hover:underline">Refresh List</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {teamMembers.map(member => (
                                <tr key={member._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                                {member.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-slate-900">{member.username}</div>
                                                <div className="text-sm text-slate-500">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            member.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <button
                                            onClick={() => handleEditUser(member)}
                                            className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1"
                                        >
                                            <Edit2 className="w-4 h-4" /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Edit User: {editingUser.username}</h3>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {teamStatus.message && (
                            <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${teamStatus.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                }`}>
                                {teamStatus.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                <p className="text-sm font-medium">{teamStatus.message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={userForm.username}
                                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select
                                    value={userForm.role}
                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="pt-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-slate-500" /> Reset Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showUserPassword ? "text" : "password"}
                                        placeholder="Enter new password to reset"
                                        value={userForm.newPassword}
                                        onChange={(e) => setUserForm({ ...userForm, newPassword: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowUserPassword(!showUserPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Leave blank to keep current password.</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-slate-600" />
                    Settings
                </h1>
                <p className="text-slate-500">Configure system preferences and business details.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation for Settings */}
                <div className="md:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {[
                            { id: 'tables', label: 'Table Rates', icon: TableIcon },
                            { id: 'business', label: 'Business Profile', icon: Building },
                            { id: 'account', label: 'Account', icon: User },
                            ...(user?.role === 'admin' ? [{ id: 'team', label: 'Team', icon: Users }] : []),
                            { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === item.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-[500px]">
                    {activeTab === 'tables' && renderTableSettings()}
                    {activeTab === 'business' && renderBusinessProfile()}
                    {activeTab === 'account' && renderAccountSettings()}
                    {activeTab === 'team' && renderTeamSettings()}
                    {activeTab === 'billing' && (
                        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Settings className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Coming Soon</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                This settings module is currently under development. Please check back later for updates.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
