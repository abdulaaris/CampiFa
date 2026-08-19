import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, UserCheck, UserX, Trash2, Shield, AlertCircle, Check } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCustomers({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setCustomers(res.customers);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleSuspend = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to suspend account for "${name}"?`)) {
      await adminService.suspendCustomer(id);
      setActionSuccess(`Customer "${name}" suspended.`);
      fetchCustomers();
    }
  };

  const handleActivate = async (id: string, name: string) => {
    await adminService.activateCustomer(id);
    setActionSuccess(`Customer "${name}" reactivated.`);
    fetchCustomers();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Permanently delete customer "${name}" and all their campaigns? This cannot be undone.`)) {
      await adminService.deleteCustomer(id);
      setActionSuccess(`Customer "${name}" deleted.`);
      fetchCustomers();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Customer Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View, suspend, reactivate, or delete customer tenant accounts
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-green-50 text-green-700 text-xs font-semibold rounded-xl flex items-center space-x-2 border border-green-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, business, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <LoadingSpinner size="md" text="Loading customer accounts..." />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Customer &amp; Business</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Campaigns</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">
                        {c.profile?.businessName || 'Unnamed Business'}
                      </p>
                      <p className="text-[11px] text-slate-400">{c.profile?.fullName || 'Customer'}</p>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-600">{c.email}</td>
                    <td className="py-4 px-4 text-center font-bold text-slate-900">
                      {c._count?.campaigns || 0}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          c.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {c.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleSuspend(c.id, c.profile?.businessName || c.email)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(c.id, c.profile?.businessName || c.email)}
                          className="px-2.5 py-1 bg-green-50 text-green-800 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          Reactivate
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(c.id, c.profile?.businessName || c.email)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
