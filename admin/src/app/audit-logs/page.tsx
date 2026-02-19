'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';

export default function AuditLogsPage() {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filterAction && { action: filterAction }),
        ...(filterResource && { resource: filterResource }),
        ...(search && { search: search }),
      });

      const res = await fetch(`${API_BASE_URL}/audit?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch logs');

      const data = await res.json();
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLogs();
  }, [token, page, filterAction, filterResource]); // Refetch on filter change

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Audit Logs</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-800 p-4 rounded-lg">
        <select
          className="bg-gray-700 text-white p-2 rounded"
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>

        <select
          className="bg-gray-700 text-white p-2 rounded"
          value={filterResource}
          onChange={(e) => { setFilterResource(e.target.value); setPage(1); }}
        >
          <option value="">All Resources</option>
          <option value="Booking">Booking</option>
          <option value="Order">Order</option>
          <option value="Staff">Staff</option>
          <option value="Settings">Settings</option>
          <option value="Table">Table</option>
          <option value="Inventory">Inventory</option>
          <option value="Menu">Menu</option>
        </select>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search details or user..."
            className="bg-gray-700 text-white p-2 rounded px-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white">Search</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-900 text-gray-100 uppercase text-sm">
            <tr>
              <th className="p-4">Time</th>
              <th className="p-4">Actor</th>
              <th className="p-4">Action</th>
              <th className="p-4">Resource</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center">No logs found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-750">
                  <td className="p-4 text-sm font-mono text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{log.actor.username}</div>
                    <div className="text-xs text-gray-500">{log.actor.role}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold
                      ${log.action === 'CREATE' ? 'bg-green-900 text-green-300' :
                        log.action === 'DELETE' ? 'bg-red-900 text-red-300' :
                          'bg-blue-900 text-blue-300'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{log.resource}</td>
                  <td className="p-4 text-sm text-gray-400 max-w-md truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-400">Page {page} of {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
