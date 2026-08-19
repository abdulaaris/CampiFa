import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignService } from '../services/campaignService';
import { Campaign } from '../types';
import { QRCodeModal } from '../components/common/QRCodeModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Layers,
  PlusCircle,
  Search,
  Sliders,
  QrCode,
  Copy,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  CheckCircle,
  Trash2,
  MoreVertical,
  Check,
  AlertCircle,
} from 'lucide-react';

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // QR Modal
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; title: string; slug: string }>({
    isOpen: false,
    title: '',
    slug: '',
  });

  // Copied link toast
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await campaignService.getCampaigns({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search.trim() || undefined,
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

  const handleCopyLink = (c: Campaign) => {
    const url = `${window.location.origin}/c/${c.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePause = async (id: string) => {
    await campaignService.pauseCampaign(id);
    fetchCampaigns();
  };

  const handleResume = async (id: string) => {
    await campaignService.resumeCampaign(id);
    fetchCampaigns();
  };

  const handleDuplicate = async (id: string) => {
    await campaignService.duplicateCampaign(id);
    fetchCampaigns();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      await campaignService.deleteCampaign(id);
      fetchCampaigns();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Campaigns</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Manage your ready-made posters, personalization templates, and public links
          </p>
        </div>

        <Link
          to="/campaigns/new"
          className="flex items-center space-x-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/90 shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Campaign</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border/60 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'PUBLISHED', 'DRAFT', 'PAUSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-brand-primary text-white shadow-2xs'
                  : 'bg-brand-light/60 text-brand-dark hover:bg-brand-light'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-light/30 border border-brand-border/80 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
          />
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Campaign List */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="md" text="Loading campaigns..." />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-brand-border/60 shadow-subtle">
          <Layers className="w-12 h-12 text-brand-muted/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-brand-dark">No campaigns found</h3>
          <p className="text-xs text-brand-muted mt-1 mb-6">
            Try adjusting your search criteria or create a new campaign.
          </p>
          <Link
            to="/campaigns/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/90"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Campaign</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-brand-border/60 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Poster Header */}
              <div className="relative h-48 bg-brand-light/40 overflow-hidden border-b border-brand-border/40">
                {c.posterFile?.url ? (
                  <img
                    src={c.posterFile.url}
                    alt={c.title}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-brand-muted">
                    <Layers className="w-8 h-8 opacity-40 mb-1" />
                    <span className="text-xs">No Poster Artwork</span>
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

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-brand-dark line-clamp-1">{c.title}</h3>
                  <p className="text-xs text-brand-muted line-clamp-2 mt-1">
                    {c.description || 'No description entered.'}
                  </p>
                  <p className="text-[11px] font-mono text-brand-secondary/80 mt-2">
                    /c/{c.slug}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-brand-border/40">
                  <Link
                    to={`/campaigns/${c.id}/template`}
                    className="flex items-center justify-center space-x-1.5 py-2 bg-brand-light text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-light/80 border border-brand-secondary/30 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Template Editor</span>
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

                {/* Quick Secondary Actions Toolbar */}
                <div className="flex items-center justify-between pt-3 mt-2 text-xs text-brand-muted">
                  <div className="flex items-center space-x-2">
                    {c.status === 'PUBLISHED' && (
                      <button
                        onClick={() => handleCopyLink(c)}
                        className="flex items-center space-x-1 text-[11px] font-semibold text-brand-secondary hover:text-brand-primary"
                        title="Copy Public Link"
                      >
                        {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === c.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}

                    {c.status === 'PUBLISHED' ? (
                      <button
                        onClick={() => handlePause(c.id)}
                        className="text-[11px] font-semibold text-amber-700 hover:underline"
                      >
                        Pause
                      </button>
                    ) : c.status === 'PAUSED' ? (
                      <button
                        onClick={() => handleResume(c.id)}
                        className="text-[11px] font-semibold text-green-700 hover:underline"
                      >
                        Resume
                      </button>
                    ) : null}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDuplicate(c.id)}
                      className="text-[11px] text-brand-muted hover:text-brand-dark"
                      title="Duplicate Campaign"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[11px] text-red-500 hover:text-red-700"
                      title="Delete Campaign"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <QRCodeModal
        isOpen={qrModal.isOpen}
        onClose={() => setQrModal({ isOpen: false, title: '', slug: '' })}
        campaignTitle={qrModal.title}
        campaignSlug={qrModal.slug}
      />
    </div>
  );
};
