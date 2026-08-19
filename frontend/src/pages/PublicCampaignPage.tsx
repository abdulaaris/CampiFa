import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignService } from '../services/campaignService';
import { generateService, GenerateResult } from '../services/generateService';
import { analyticsService } from '../services/analyticsService';
import { Campaign, TemplateElement, CampaignField } from '../types';
import { InteractiveCanvas } from '../canvas/InteractiveCanvas';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Upload,
  Camera,
  Image as ImageIcon,
  Download,
  Share2,
  Check,
  AlertCircle,
  RefreshCw,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export const PublicCampaignPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Form input values
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  // Generation state
  const [generating, setGenerating] = useState<boolean>(false);
  const [genResult, setGenResult] = useState<GenerateResult | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const c = await campaignService.getPublicCampaign(slug);
        setCampaign(c);

        // Pre-populate default field values
        const initialVals: Record<string, string> = {};
        c.fields?.forEach((f) => {
          if (f.name === 'name') initialVals.name = '';
          else if (f.name === 'designation') initialVals.designation = '';
          else initialVals[f.name] = '';
        });
        setFieldValues(initialVals);
      } catch (err: any) {
        setError(err.message || 'Failed to load campaign. It may be private, paused, or invalid.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [slug]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid JPG, PNG, or WEBP image.');
      return;
    }

    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreviewUrl(url);
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    // Validate required fields
    const photoRequired = campaign.fields?.some((f) => f.type === 'photo' && f.required);
    if (photoRequired && !photoFile) {
      alert('Please upload your photo to personalize the poster.');
      return;
    }

    for (const f of campaign.fields || []) {
      if (f.type !== 'photo' && f.required && !fieldValues[f.name]?.trim()) {
        alert(`Please enter ${f.label}.`);
        return;
      }
    }

    try {
      setGenerating(true);

      const result = await generateService.generatePoster({
        campaignId: campaign.id,
        fieldValues,
        photoFile,
        anonymousSessionId: `anon_${Date.now()}`,
      });

      setGenResult(result);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7B2525', '#BA6A4C', '#FFF4E5', '#F59E0B'],
        });
      } catch (e) {
        // Confetti fallback safe
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate poster. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadHD = () => {
    if (!genResult) return;
    const a = document.createElement('a');
    a.href = genResult.downloadUrl;
    a.download = genResult.filename || `CampiFa-${campaign?.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (campaign) {
      analyticsService.trackEvent(campaign.id, 'DOWNLOAD');
    }
  };

  const handleWhatsAppShare = () => {
    if (!campaign) return;
    const shareUrl = `${window.location.origin}/c/${campaign.slug}`;
    const text = encodeURIComponent(
      `I created my personalized campaign poster for "${campaign.title}" using CampiFa! Create yours here:\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    analyticsService.trackEvent(campaign.id, 'SHARE');
  };

  const handleNativeShare = async () => {
    if (!campaign) return;
    const shareUrl = `${window.location.origin}/c/${campaign.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: `I created my personalized campaign poster for "${campaign.title}" using CampiFa!`,
          url: shareUrl,
        });
        analyticsService.trackEvent(campaign.id, 'SHARE');
      } catch (err) {
        // user cancelled or share unsupported
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Campaign Poster..." />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-brand-border text-center shadow-card">
        <AlertCircle className="w-12 h-12 text-brand-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold text-brand-dark">Campaign Unavailable</h2>
        <p className="text-xs text-brand-muted mt-2 leading-relaxed">
          {error || 'This campaign is either paused by the organizer or does not exist.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl"
        >
          Return to CampiFa Home
        </button>
      </div>
    );
  }

  const posterUrl = campaign.posterFile?.url || campaign.template?.backgroundFile?.url || '';
  const elements = campaign.template?.elements || [];
  const fields = campaign.fields || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Campaign Banner Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-light border border-brand-secondary/30 rounded-full text-brand-primary text-[11px] font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          <span>{campaign.customer?.profile?.businessName || 'Official Campaign'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
          {campaign.title}
        </h1>
        {campaign.description && (
          <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto leading-relaxed">
            {campaign.description}
          </p>
        )}
      </div>

      {/* Main Personalization Studio: Form on Left, Live Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Personalization Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-brand-border/60 shadow-card space-y-6">
          <div>
            <h2 className="text-lg font-bold text-brand-dark flex items-center space-x-2">
              <span>Personalize Your Poster</span>
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Upload your photo and enter your details to preview and generate your personalized HD poster.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* 1. Photo Upload Field */}
            {fields.some((f) => f.type === 'photo') && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-dark flex items-center justify-between">
                  <span>Your Photograph *</span>
                  <span className="text-[10px] text-brand-muted">JPG, PNG, WEBP</span>
                </label>

                <div className="flex items-center gap-4">
                  {/* Photo Preview Thumbnail */}
                  <div className="w-20 h-20 rounded-2xl bg-brand-light/60 border-2 border-dashed border-brand-secondary/40 flex items-center justify-center overflow-hidden shrink-0 relative">
                    {photoPreviewUrl ? (
                      <img
                        src={photoPreviewUrl}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-7 h-7 text-brand-secondary/60" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    {/* Separate hidden input */}
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 bg-brand-light text-brand-primary font-bold text-xs rounded-xl hover:bg-brand-light/80 border border-brand-secondary/30 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{photoPreviewUrl ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>

                    {photoPreviewUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreviewUrl(null);
                        }}
                        className="text-[11px] text-red-500 hover:underline block"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Dynamic Text Fields */}
            {fields
              .filter((f) => f.type !== 'photo')
              .map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-dark block">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id={`input-field-${f.name}`}
                    type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : 'text'}
                    required={f.required}
                    maxLength={f.maxLength || 80}
                    placeholder={f.placeholder || `Enter your ${f.label.toLowerCase()}`}
                    value={fieldValues[f.name] || ''}
                    onChange={(e) => handleInputChange(f.name, e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
                  />
                </div>
              ))}

            {/* Generate Poster Button */}
            <button
              type="submit"
              disabled={generating}
              className="w-full py-3.5 bg-brand-primary text-white font-bold text-sm rounded-xl hover:bg-brand-primary/90 shadow-elevated transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? 'Rendering High-Res Poster...' : 'Generate Poster'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Live Poster Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-white p-4 rounded-3xl border border-brand-border/60 shadow-card flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full px-2 pb-3 mb-2 border-b border-brand-border/40 text-xs">
              <span className="font-bold text-brand-dark flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Live Real-Time Poster Preview</span>
              </span>
              <span className="text-brand-muted text-[11px]">Original artwork locked</span>
            </div>

            <InteractiveCanvas
              posterUrl={posterUrl}
              elements={elements}
              fields={fields}
              selectedElementId={null}
              onSelectElement={() => {}}
              onUpdateElement={() => {}}
              zoom={0.52}
              showGrid={false}
              snapToGrid={false}
              sampleValues={fieldValues}
              userPhotoUrl={photoPreviewUrl}
              onPhotoAreaClick={() => photoInputRef.current?.click()}
              onTextElementClick={(fieldName) => {
                const el = document.getElementById(`input-field-${fieldName}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.focus();
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Generation Result Modal */}
      {genResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-elevated border border-brand-border/60 max-w-2xl w-full p-6 sm:p-8 text-center relative overflow-hidden max-h-[95vh] flex flex-col justify-between">
            {/* Header */}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-brand-dark">Your Personalized Poster is Ready!</h3>
              <p className="text-xs text-brand-muted mt-1">
                Generated at exact full resolution ({campaign.template?.width || 1080} &times; {campaign.template?.height || 1350} px)
              </p>
            </div>

            {/* Generated Image Preview */}
            <div className="my-5 max-h-80 overflow-hidden flex items-center justify-center bg-brand-light/30 rounded-2xl border border-brand-border/60 p-2">
              <img
                src={genResult.outputUrl}
                alt="Generated Personalized Poster"
                className="max-h-72 w-auto object-contain rounded-xl shadow-md"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadHD}
                  className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-brand-primary text-white font-bold text-xs rounded-xl hover:bg-brand-primary/90 shadow-elevated transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download HD PNG</span>
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700 shadow-sm transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>

              <div className="flex items-center justify-center space-x-4 pt-2">
                <button
                  onClick={handleNativeShare}
                  className="text-xs font-semibold text-brand-secondary hover:text-brand-primary flex items-center space-x-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShare ? 'Link Copied!' : 'Share via Device / Copy Link'}</span>
                </button>

                <span className="text-gray-300">•</span>

                <button
                  onClick={() => setGenResult(null)}
                  className="text-xs font-semibold text-brand-muted hover:text-brand-dark"
                >
                  Create Another Poster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
