import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  Layers,
  Sparkles,
  Download,
  Shield,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        setLoading(true);
        const res = await adminService.getOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminOverview();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Platform Statistics..." />
      </div>
    );
  }

  const stats = data?.stats || {
    totalCustomers: 0,
    totalCampaigns: 0,
    publishedCampaigns: 0,
    totalGenerations: 0,
    totalDownloads: 0,
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Platform Super Administration</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Global overview across all customer tenants, campaigns, and poster generation metrics
        </p>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Customers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">{stats.totalCustomers}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Registered accounts</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Campaigns</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">{stats.totalCampaigns}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Total created</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Published</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-green-700">{stats.publishedCampaigns}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Active public links</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Generations</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-700">{stats.totalGenerations}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Posters rendered</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Downloads</span>
            <Download className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-700">{stats.totalDownloads}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">HD PNG saves</p>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Customers & Recent Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Customer Accounts</h3>
              <p className="text-xs text-slate-400">Latest registered organizers &amp; institutions</p>
            </div>
            <Link
              to="/admin/customers"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentCustomers?.map((c: any) => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="font-bold text-xs text-slate-900">
                    {c.profile?.businessName || c.profile?.fullName || c.email}
                  </p>
                  <p className="text-[11px] text-slate-500">{c.email}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {c.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {c._count?.campaigns || 0} campaigns
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Campaigns</h3>
              <p className="text-xs text-slate-400">All customer poster projects</p>
            </div>
            <Link
              to="/admin/campaigns"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentCampaigns?.map((camp: any) => (
              <div key={camp.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="font-bold text-xs text-slate-900">{camp.title}</p>
                  <p className="text-[11px] text-slate-500">
                    Customer: {camp.customer?.profile?.businessName || camp.customer?.email}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      camp.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : camp.status === 'PAUSED'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {camp.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {camp.generationsCount} gens
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
