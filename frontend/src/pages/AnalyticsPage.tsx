import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { AnalyticsSummary } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BarChart3,
  Eye,
  Sparkles,
  Download,
  Share2,
  Calendar,
  Layers,
  TrendingUp,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('30d');
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getCustomerAnalytics(period);
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Campaign Analytics..." />
      </div>
    );
  }

  const totals = data?.totals || {
    views: 0,
    generations: 0,
    downloads: 0,
    shares: 0,
    campaigns: 0,
    published: 0,
    drafts: 0,
  };

  const timeSeries = data?.timeSeries || [];
  const maxEvents = Math.max(1, ...timeSeries.map((t) => t.views + t.generations + t.downloads));

  return (
    <div className="space-y-8">
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Campaign Analytics</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Monitor real-time views, poster personalizations, and downloads
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center space-x-1 p-1 bg-white border border-brand-border/80 rounded-2xl shadow-2xs self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'all', label: 'All Time' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === p.id
                  ? 'bg-brand-primary text-white shadow-2xs'
                  : 'text-brand-dark hover:bg-brand-light/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-brand-border/60 shadow-card flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-brand-dark">{totals.views}</p>
            <p className="text-xs font-semibold text-brand-muted mt-0.5">Total Campaign Views</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border/60 shadow-card flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-brand-primary">{totals.generations}</p>
            <p className="text-xs font-semibold text-brand-muted mt-0.5">Posters Generated</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border/60 shadow-card flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-emerald-700">{totals.downloads}</p>
            <p className="text-xs font-semibold text-brand-muted mt-0.5">PNG Downloads</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border/60 shadow-card flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-purple-700">{totals.shares}</p>
            <p className="text-xs font-semibold text-brand-muted mt-0.5">WhatsApp / Web Shares</p>
          </div>
        </div>
      </div>

      {/* Activity Timeline Bar Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border/60 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            <div>
              <h3 className="text-base font-bold text-brand-dark">Personalization Activity Over Time</h3>
              <p className="text-xs text-brand-muted">Daily breakdown of views vs generations vs downloads</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Views</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-brand-primary" />
              <span>Generations</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Downloads</span>
            </span>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="pt-8 pb-4 flex items-end justify-between gap-2 h-64 border-b border-brand-border/40 overflow-x-auto">
          {timeSeries.map((item) => {
            const viewHeight = Math.min(100, Math.round((item.views / maxEvents) * 100));
            const genHeight = Math.min(100, Math.round((item.generations / maxEvents) * 100));
            const dlHeight = Math.min(100, Math.round((item.downloads / maxEvents) * 100));

            return (
              <div key={item.date} className="flex-1 flex flex-col items-center min-w-[28px] group relative">
                {/* Tooltip */}
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-brand-dark text-white text-[10px] p-2 rounded-lg whitespace-nowrap shadow-lg z-20">
                  <p className="font-bold">{item.date}</p>
                  <p>Views: {item.views} | Gens: {item.generations} | DL: {item.downloads}</p>
                </div>

                {/* Bars */}
                <div className="w-full flex items-end justify-center gap-0.5 h-48">
                  <div
                    style={{ height: `${Math.max(4, viewHeight)}%` }}
                    className="w-1.5 bg-blue-400 rounded-t-sm"
                  />
                  <div
                    style={{ height: `${Math.max(4, genHeight)}%` }}
                    className="w-1.5 bg-brand-primary rounded-t-sm"
                  />
                  <div
                    style={{ height: `${Math.max(4, dlHeight)}%` }}
                    className="w-1.5 bg-emerald-500 rounded-t-sm"
                  />
                </div>

                {/* Date Label */}
                <span className="text-[9px] text-brand-muted mt-2 font-mono truncate w-full text-center">
                  {item.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white rounded-3xl border border-brand-border/60 shadow-card overflow-hidden">
        <div className="p-6 border-b border-brand-border/40">
          <h3 className="text-base font-bold text-brand-dark">Campaign Performance Breakdown</h3>
          <p className="text-xs text-brand-muted">Individual engagement metrics per campaign</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-light/40 text-brand-muted font-bold uppercase tracking-wider text-[10px] border-b border-brand-border/40">
              <tr>
                <th className="py-3 px-6">Campaign</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Views</th>
                <th className="py-3 px-4 text-right">Generations</th>
                <th className="py-3 px-4 text-right">Downloads</th>
                <th className="py-3 px-4 text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/30">
              {data?.campaignPerformance?.map((c) => {
                const convRate = c.viewsCount > 0 ? ((c.generationsCount / c.viewsCount) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={c.id} className="hover:bg-brand-light/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-brand-dark">{c.title}</td>
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
                    <td className="py-4 px-4 text-right font-mono font-semibold text-blue-700">
                      {c.viewsCount}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-brand-primary">
                      {c.generationsCount}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-emerald-700">
                      {c.downloadsCount}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-brand-dark">
                      {convRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
