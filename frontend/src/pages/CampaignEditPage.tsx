import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { campaignService } from '../services/campaignService';
import { uploadService } from '../services/uploadService';
import { Campaign } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ChevronLeft, Save, AlertCircle, Upload, Check, Sliders } from 'lucide-react';

export const CampaignEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('general');

  const [newPosterFile, setNewPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const c = await campaignService.getCampaignById(id);
        setCampaign(c);
        setTitle(c.title);
        setDescription(c.description || '');
        setCategory(c.category || 'general');
        if (c.posterFile?.url) {
          setPosterPreview(c.posterFile.url);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      let posterFileId = campaign?.posterFileId;

      if (newPosterFile) {
        const uploadRes = await uploadService.uploadPoster(newPosterFile);
        posterFileId = uploadRes.fileAsset.id;
      }

      await campaignService.updateCampaign(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        posterFileId: posterFileId || undefined,
      });

      setSuccess('Campaign details updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="md" text="Loading campaign details..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-brand-muted">
          <Link to="/campaigns" className="hover:text-brand-primary flex items-center space-x-1">
            <ChevronLeft className="w-4 h-4" />
            <span>Campaigns</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-brand-dark">Edit Campaign</span>
        </div>

        {id && (
          <Link
            to={`/campaigns/${id}/template`}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-light text-brand-primary font-bold text-xs rounded-xl hover:bg-brand-light/80 border border-brand-secondary/30 transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Open Template Editor</span>
          </Link>
        )}
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-brand-border/60 shadow-card">
        <h1 className="text-xl font-extrabold text-brand-dark mb-1">Edit Campaign Settings</h1>
        <p className="text-xs text-brand-muted mb-6">
          Update campaign title, description, or replace base poster artwork.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-green-50 text-green-700 text-xs rounded-xl flex items-center space-x-2 border border-green-200">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-brand-dark block mb-1.5">Campaign Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-brand-dark block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-brand-dark block mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium"
            >
              <option value="general">General Campaign</option>
              <option value="celebration">Celebration / Festival</option>
              <option value="religious">Religious Occasion</option>
              <option value="national">National / Patriot Day</option>
              <option value="education">Education &amp; Academic</option>
              <option value="corporate">Corporate / Business</option>
              <option value="sports">Sports &amp; Athletics</option>
            </select>
          </div>

          {/* Poster Artwork Preview & Change */}
          <div className="pt-2 border-t border-brand-border/40 space-y-3">
            <label className="text-xs font-bold text-brand-dark block">Base Poster Artwork</label>
            <div className="flex items-center gap-4">
              {posterPreview ? (
                <img
                  src={posterPreview}
                  alt="Poster"
                  className="w-24 h-32 object-cover object-top rounded-xl border border-brand-border"
                />
              ) : (
                <div className="w-24 h-32 bg-brand-light rounded-xl border border-brand-border flex items-center justify-center text-brand-muted text-[10px]">
                  No image
                </div>
              )}

              <label className="flex items-center space-x-2 px-4 py-2.5 bg-brand-light text-brand-primary font-bold text-xs rounded-xl hover:bg-brand-light/80 border border-brand-secondary/30 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Replace Poster Image</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 bg-brand-primary text-white font-bold text-xs rounded-xl hover:bg-brand-primary/90 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
