import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Campaign } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, Layers, Eye, Sparkles, Download, Trash2, ExternalLink, PauseCircle, PlayCircle } from 'lucide-react';

export const AdminCampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCampaigns({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setCampaigns(res.campaigns);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns();
  };

  const handlePause = async (id: string, title: string) => {
    await adminService.pauseCampaign(id);
    setActionSuccess(`Campaign "${title}" paused by admin.`);
    fetchCampaigns();
  };

  const handleResume = async (id: string, title: string) => {
    await adminService.resumeCampaign(id);
    setActionSuccess(`Campaign "${title}" resumed by admin.`);
    fetchCampaigns();
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete campaign "${title}"?`)) {
      await adminService.deleteCampaign(id);
      setActionSuccess(`Campaign "${title}" deleted.`);
      fetchCampaigns();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Campaign Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Oversight of all poster campaigns across all customer organizations
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-green-50 text-green-700 text-xs font-semibold rounded-xl flex items-center space-x-2 border border-green-200">
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {['ALL', 'PUBLISHED', 'DRAFT', 'PAUSED'].map((st) => (
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
            placeholder="Search campaigns, slugs, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <LoadingSpinner size="md" text="Loading campaigns..." />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No campaigns found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Campaign &amp; Slug</th>
                  <th className="py-3 px-4">Customer Organization</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Views</th>
                  <th className="py-3 px-4 text-right">Generations</th>
                  <th className="py-3 px-4 text-right">Downloads</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{c.title}</p>
                      <a
                        href={`/c/${c.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-blue-600 hover:underline inline-flex items-center space-x-0.5 mt-0.5"
                      >
                        <span>/c/{c.slug}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">
                        {c.customer?.profile?.businessName || 'Unnamed'}
                      </p>
                      <p className="text-[11px] text-slate-400">{c.customer?.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          c.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : c.status === 'PAUSED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-slate-600">
                      {c.viewsCount}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-purple-600">
                      {c.generationsCount}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-emerald-600">
                      {c.downloadsCount}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {c.status === 'PUBLISHED' ? (
                        <button
                          onClick={() => handlePause(c.id, c.title)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          Pause
                        </button>
                      ) : c.status === 'PAUSED' ? (
                        <button
                          onClick={() => handleResume(c.id, c.title)}
                          className="px-2.5 py-1 bg-green-50 text-green-800 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          Resume
                        </button>
                      ) : null}

                      <button
                        onClick={() => handleDelete(c.id, c.title)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                        title="Delete Campaign"
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
