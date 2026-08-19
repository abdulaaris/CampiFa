import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { campaignService } from '../services/campaignService';
import { analyticsService } from '../services/analyticsService';
import { Campaign, AnalyticsSummary } from '../types';
import { QRCodeModal } from '../components/common/QRCodeModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Layers,
  CheckCircle,
  Clock,
  Eye,
  Sparkles,
  Download,
  PlusCircle,
  BarChart3,
  QrCode,
  ArrowRight,
  ExternalLink,
  Sliders,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // QR Modal State
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; title: string; slug: string }>({
    isOpen: false,
    title: '',
    slug: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cRes, aRes] = await Promise.all([
          campaignService.getCampaigns({ limit: 6 }),
          analyticsService.getCustomerAnalytics('all'),
        ]);
        setCampaigns(cRes.campaigns);
        setAnalytics(aRes);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Customer Dashboard..." />
      </div>
    );
  }

  const totals = analytics?.totals || {
    campaigns: campaigns.length,
    published: campaigns.filter((c) => c.status === 'PUBLISHED').length,
    drafts: campaigns.filter((c) => c.status === 'DRAFT').length,
    views: campaigns.reduce((a, b) => a + b.viewsCount, 0),
    generations: campaigns.reduce((a, b) => a + b.generationsCount, 0),
    downloads: campaigns.reduce((a, b) => a + b.downloadsCount, 0),
    shares: campaigns.reduce((a, b) => a + b.sharesCount, 0),
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-6 sm:p-8 rounded-3xl shadow-elevated flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-light/80">
            Customer Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome, {user?.profile?.businessName || user?.profile?.fullName || 'Organizer'}!
          </h1>
          <p className="text-xs sm:text-sm text-white/80 mt-2 leading-relaxed">
            Create high-impact campaign posters, map dynamic photo &amp; name fields, and share public links for instant personalization.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <Link
            to="/campaigns/new"
            className="flex items-center space-x-2 px-5 py-2.5 bg-white text-brand-primary font-bold text-xs rounded-xl hover:bg-brand-light transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
          <Link
            to="/analytics"
            className="flex items-center space-x-2 px-4 py-2.5 bg-black/20 text-white font-bold text-xs rounded-xl hover:bg-black/30 border border-white/20 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[11px] font-bold">Total</span>
            <Layers className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-brand-dark">{totals.campaigns}</p>
            <p className="text-[10px] text-brand-muted mt-0.5">Campaigns</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[11px] font-bold">Published</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-green-700">{totals.published}</p>
            <p className="text-[10px] text-brand-muted mt-0.5">Active Links</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[11px] font-bold">Drafts</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-amber-700">{totals.drafts}</p>
            <p className="text-[10px] text-brand-muted mt-0.5">In Progress</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[11px] font-bold">Views</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-blue-700">{totals.views}</p>
            <p className="text-[10px] text-brand-muted mt-0.5">Page Visits</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[11px] font-bold">Generations</span>
            <Sparkles className="w-4 h-4 text-brand-secondary" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-brand-secondary">{totals.generations}</p>
            <p className="text-[10px] text-brand-muted mt-0.5">Personalized</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-[11px] font-bold">Downloads</span>
            <Download className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-emerald-700">{totals.downloads}</p>
            <p className="text-[10px] text-brand-muted mt-0.5">HD Posters</p>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-dark">Recent Campaigns</h2>
            <p className="text-xs text-brand-muted">Manage your posters and open the interactive template editor</p>
          </div>
          <Link
            to="/campaigns"
            className="text-xs font-bold text-brand-secondary hover:text-brand-primary flex items-center space-x-1"
          >
            <span>View All Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-brand-border/60 shadow-subtle">
            <Layers className="w-12 h-12 text-brand-secondary/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-brand-dark">No campaigns created yet</h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto mt-1 mb-6">
              Upload your first ready-made campaign poster and configure personalization areas.
            </p>
            <Link
              to="/campaigns/new"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-primary text-white font-bold text-xs rounded-xl hover:bg-brand-primary/90 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Campaign</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-brand-border/60 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Poster Preview Header */}
                <div className="relative h-44 bg-brand-light/40 overflow-hidden flex items-center justify-center border-b border-brand-border/40">
                  {c.posterFile?.url ? (
                    <img
                      src={c.posterFile.url}
                      alt={c.title}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Layers className="w-8 h-8 text-brand-muted/50 mx-auto mb-1" />
                      <span className="text-xs text-brand-muted">No poster uploaded</span>
                    </div>
                  )}

                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs ${
                      c.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : c.status === 'PAUSED'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-brand-dark line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-brand-muted line-clamp-2 mt-1">
                      {c.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div className="flex items-center justify-between text-[11px] text-brand-muted pt-4 border-t border-brand-border/40 mt-4">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>{c.viewsCount} views</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
                      <span>{c.generationsCount} gens</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Download className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{c.downloadsCount} dl</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-brand-border/40">
                    <Link
                      to={`/campaigns/${c.id}/template`}
                      className="flex items-center justify-center space-x-1.5 py-2 bg-brand-light text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-light/80 border border-brand-secondary/30 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Editor</span>
                    </Link>

                    {c.status === 'PUBLISHED' ? (
                      <button
                        onClick={() =>
                          setQrModal({
                            isOpen: true,
                            title: c.title,
                            slug: c.slug,
                          })
                        }
                        className="flex items-center justify-center space-x-1.5 py-2 bg-white text-brand-dark border border-brand-border/80 text-xs font-bold rounded-xl hover:bg-brand-light transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5 text-brand-secondary" />
                        <span>QR &amp; Link</span>
                      </button>
                    ) : (
                      <Link
                        to={`/campaigns/${c.id}/edit`}
                        className="flex items-center justify-center space-x-1.5 py-2 bg-white text-brand-dark border border-brand-border/80 text-xs font-bold rounded-xl hover:bg-brand-light transition-colors"
                      >
                        <span>Edit Details</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModal.isOpen}
        onClose={() => setQrModal({ isOpen: false, title: '', slug: '' })}
        campaignTitle={qrModal.title}
        campaignSlug={qrModal.slug}
      />
    </div>
  );
};
