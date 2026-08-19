import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { campaignService } from '../services/campaignService';
import { uploadService } from '../services/uploadService';
import { Upload, ArrowRight, Image as ImageIcon, AlertCircle, ChevronLeft, Check } from 'lucide-react';

export const CampaignNewPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('general');

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterMetadata, setPosterMetadata] = useState<{ width: number; height: number } | null>(null);

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid JPG, PNG, or WEBP image.');
      return;
    }

    setPosterFile(file);
    const url = URL.createObjectURL(file);
    setPosterPreview(url);

    // Read natural dimensions
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setPosterMetadata({ width: img.naturalWidth, height: img.naturalHeight });
    };

    setError('');
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a campaign name.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCreate = async () => {
    if (!posterFile) {
      setError('Please select a ready-made poster image to upload.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Upload Poster Asset
      const uploadRes = await uploadService.uploadPoster(posterFile);

      // 2. Create Campaign
      const newCampaign = await campaignService.createCampaign({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        posterFileId: uploadRes.fileAsset.id,
      });

      // 3. Navigate directly to Template Editor
      navigate(`/campaigns/${newCampaign.id}/template`);
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-brand-muted">
        <Link to="/campaigns" className="hover:text-brand-primary flex items-center space-x-1">
          <ChevronLeft className="w-4 h-4" />
          <span>Campaigns</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-brand-dark">New Campaign</span>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-brand-border/60 shadow-card">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border/40">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark">Create Campaign</h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Step {step} of 2: {step === 1 ? 'Campaign Information' : 'Upload Ready-Made Poster'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'
              }`}
            >
              1
            </span>
            <div className="w-8 h-0.5 bg-brand-border" />
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2 ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'
              }`}
            >
              2
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: Campaign Info */
          <form onSubmit={handleStep1Next} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1.5">
                Campaign Name / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Milad-un-Nabi 2026 / Annual Sports Gala"
                className="w-full px-4 py-3 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
              />
              <p className="text-[11px] text-brand-muted mt-1">
                A public web link slug will automatically be generated from this name.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1.5">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description or greetings shown on the public campaign page..."
                className="w-full px-4 py-3 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-brand-border/80 rounded-xl text-xs font-medium"
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

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 bg-brand-primary text-white font-bold text-xs rounded-xl hover:bg-brand-primary/90 shadow-sm transition-all"
              >
                <span>Continue to Poster Upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: Poster Upload */
          <div className="space-y-6">
            <div className="p-4 bg-brand-light/50 border border-brand-secondary/20 rounded-2xl">
              <h4 className="font-bold text-xs text-brand-primary flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Ready-Made Poster Base Layer</span>
              </h4>
              <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">
                Upload the finalized graphic designed externally in Photoshop, CorelDRAW, or Canva.
                CampiFa does not redesign or alter your poster; it serves as the locked foundation for personalization.
              </p>
            </div>

            {/* Drag and Drop / File Picker Area */}
            <div className="border-2 border-dashed border-brand-secondary/40 rounded-3xl p-8 text-center bg-white hover:bg-brand-light/20 transition-colors relative">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-brand-light text-brand-primary flex items-center justify-center">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-sm text-brand-dark">
                    Click or Drag &amp; Drop Ready-Made Poster Image
                  </p>
                  <p className="text-xs text-brand-muted mt-0.5">Supports high-resolution JPG, PNG, WEBP (up to 15MB)</p>
                </div>
              </div>
            </div>

            {/* Poster Preview */}
            {posterPreview && (
              <div className="p-4 bg-white border border-brand-border/80 rounded-2xl shadow-subtle flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  className="w-32 h-40 object-cover object-top rounded-xl border border-brand-border"
                />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-brand-dark text-sm">{posterFile?.name}</p>
                  <p className="text-brand-muted">
                    Size: {((posterFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {posterMetadata && (
                    <p className="text-brand-primary font-mono font-semibold">
                      Dimensions: {posterMetadata.width} &times; {posterMetadata.height} px
                    </p>
                  )}
                  <p className="text-green-700 font-semibold flex items-center space-x-1 pt-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Artwork ready for template configuration</span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-brand-border/40">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-gray-100 text-brand-dark font-semibold text-xs rounded-xl hover:bg-gray-200"
              >
                &larr; Back
              </button>

              <button
                type="button"
                disabled={!posterFile || loading}
                onClick={handleCreate}
                className="flex items-center space-x-2 px-6 py-3 bg-brand-primary text-white font-bold text-xs rounded-xl hover:bg-brand-primary/90 shadow-sm transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Uploading & Creating...' : 'Create & Open Template Editor'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
