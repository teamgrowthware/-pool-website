'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Trash2, Shield, Mail, Phone, User as UserIcon } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

// Reusing types locally or importing if available
interface StaffUser {
  _id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff'
  });

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/staff`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ username: '', email: '', phone: '', password: '', role: 'staff' });
        fetchStaff();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create staff');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/staff/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStaff = staff.filter(s =>
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pool_staff': return 'bg-green-100 text-green-700 border-green-200';
      case 'cafe_staff': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Staff Management
          </h1>
          <p className="text-slate-500">Manage employees, roles, and access.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Staff
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search staff by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
        />
      </div>

      {/* Grid showing staff cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading staff...</div>
        ) : filteredStaff.length > 0 ? (
          filteredStaff.map(member => (
            <div key={member._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{member.username}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getRoleColor(member.role)}`}>
                      {formatRole(member.role)}
                    </span>
                  </div>
                </div>
                {member.role !== 'admin' && (
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  {member.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  {member.phone || 'N/A'}
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-full -z-10"></div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No staff members found.
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Staff</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input
                  required type="email"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                <input
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                  <select
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="staff">Staff</option>
                    <option value="pool_staff">Pool Staff</option>
                    <option value="cafe_staff">Cafe Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                  <input
                    required type="password"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                >
                  Create Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
