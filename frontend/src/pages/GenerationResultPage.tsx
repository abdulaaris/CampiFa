import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateService } from '../services/generateService';
import { analyticsService } from '../services/analyticsService';
import { Generation } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import confetti from 'canvas-confetti';
import { Download, Share2, Check, ArrowLeft, ExternalLink } from 'lucide-react';

export const GenerationResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchGeneration = async () => {
      try {
        setLoading(true);
        const gen = await generateService.getGeneration(id);
        setGeneration(gen);

        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#7B2525', '#BA6A4C', '#FFF4E5', '#F59E0B'],
          });
        } catch {}
      } catch (err) {
        console.error('Failed to load generation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGeneration();
  }, [id]);

  const handleDownload = () => {
    if (!generation) return;
    const a = document.createElement('a');
    a.href = generation.outputUrl;
    a.download = `CampiFa-${generation.campaign?.slug || 'poster'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (generation.campaignId) {
      analyticsService.trackEvent(generation.campaignId, 'DOWNLOAD');
    }
  };

  const handleWhatsApp = () => {
    if (!generation?.campaign) return;
    const url = `${window.location.origin}/c/${generation.campaign.slug}`;
    const text = encodeURIComponent(
      `I created my personalized campaign poster for "${generation.campaign.title}" using CampiFa!\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your personalized poster..." />
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center shadow-card border">
        <h2 className="text-xl font-bold">Poster Not Found</h2>
        <p className="text-xs text-brand-muted mt-2">The requested poster generation does not exist.</p>
        <Link to="/" className="mt-6 inline-block px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-brand-border/60 shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-brand-dark">
          {generation.campaign?.title || 'Personalized Poster'}
        </h1>
        <p className="text-xs text-brand-muted mt-1">Your high-resolution poster is ready to download and share.</p>

        <div className="my-6 max-h-96 overflow-hidden flex items-center justify-center bg-brand-light/30 rounded-2xl border p-2">
          <img
            src={generation.outputUrl}
            alt="Personalized Poster"
            className="max-h-88 w-auto object-contain rounded-xl shadow-md"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-brand-primary text-white font-bold text-xs rounded-xl hover:bg-brand-primary/90 shadow-elevated transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download HD PNG</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700 shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-brand-border/40">
          {generation.campaign?.slug && (
            <Link
              to={`/c/${generation.campaign.slug}`}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-secondary hover:text-brand-primary"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Create Another Poster for this Campaign</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
