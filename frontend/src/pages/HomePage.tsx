import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Upload,
  Sliders,
  Share2,
  Download,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  CheckCircle,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-light/50 via-transparent to-transparent -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-brand-light border border-brand-secondary/30 rounded-full text-brand-primary text-xs font-bold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campaign Poster Personalization Platform by i-Fa Design</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black text-brand-dark tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Create <span className="text-brand-primary">&bull;</span> Personalize{' '}
            <span className="text-brand-primary">&bull;</span> Share
          </h1>

          <p className="mt-6 text-base sm:text-xl text-brand-dark/75 max-w-2xl mx-auto font-medium leading-relaxed">
            Upload your finished campaign artwork from Photoshop, CorelDRAW, or Canva. Define personalization areas, and empower your audience to generate and share branded posters in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-primary text-white font-bold text-sm rounded-xl hover:bg-brand-primary/90 shadow-elevated transition-all flex items-center justify-center space-x-2"
            >
              <span>Create Campaign Poster</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/c/milad-un-nabi-2026"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-brand-dark font-bold text-sm rounded-xl border border-brand-border hover:bg-brand-light/80 transition-all flex items-center justify-center space-x-2"
            >
              <span>Try Live Demo Poster</span>
            </Link>
          </div>

          {/* Key Distinction Callout */}
          <div className="mt-12 max-w-3xl mx-auto p-4 bg-white/80 backdrop-blur-xs border border-brand-border/80 rounded-2xl shadow-card text-xs text-brand-muted flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center space-x-2 text-brand-dark font-semibold">
              <CheckCircle className="w-4 h-4 text-brand-primary" />
              <span>Original artwork 100% preserved</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-brand-border" />
            <div className="flex items-center space-x-2 text-brand-dark font-semibold">
              <CheckCircle className="w-4 h-4 text-brand-primary" />
              <span>Zero AI hallucination or redesign</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-brand-border" />
            <div className="flex items-center space-x-2 text-brand-dark font-semibold">
              <CheckCircle className="w-4 h-4 text-brand-primary" />
              <span>No subscriptions or hidden fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-dark">
            How CampiFa Works
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-2">
            A seamless workflow designed for organizers, institutions, and marketing teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border border-brand-border/60 shadow-card hover:shadow-elevated transition-all flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-light text-brand-primary flex items-center justify-center mb-6">
              <Upload className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-extrabold tracking-widest text-brand-secondary uppercase">Step 01</span>
            <h3 className="text-lg font-bold text-brand-dark mt-1">Upload Finished Poster</h3>
            <p className="text-xs text-brand-muted mt-2 leading-relaxed">
              Design your poster in Photoshop or Canva and upload the JPG/PNG. The base design is locked and never altered.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border border-brand-border/60 shadow-card hover:shadow-elevated transition-all flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-light text-brand-primary flex items-center justify-center mb-6">
              <Sliders className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-extrabold tracking-widest text-brand-secondary uppercase">Step 02</span>
            <h3 className="text-lg font-bold text-brand-dark mt-1">Set Personalization Areas</h3>
            <p className="text-xs text-brand-muted mt-2 leading-relaxed">
              Define photo areas (circle, rounded, or rectangle) and dynamic text areas (Name, Designation, Organization).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border border-brand-border/60 shadow-card hover:shadow-elevated transition-all flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-light text-brand-primary flex items-center justify-center mb-6">
              <Share2 className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-extrabold tracking-widest text-brand-secondary uppercase">Step 03</span>
            <h3 className="text-lg font-bold text-brand-dark mt-1">Share &amp; Celebrate</h3>
            <p className="text-xs text-brand-muted mt-2 leading-relaxed">
              Publish your campaign link &amp; QR code. Supporters upload their photo and download their personalized HD poster.
            </p>
          </div>
        </div>
      </section>

      {/* Live Sample Campaigns Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-dark text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative shadow-elevated">
          <div className="max-w-xl">
            <span className="text-xs font-extrabold text-brand-secondary tracking-widest uppercase">
              Pre-Configured Demos
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">
              Try Out Pre-Built Campaigns
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed">
              Experience the fast personalization workflow right now on these demo campaign posters.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              to="/c/milad-un-nabi-2026"
              className="group bg-white/10 hover:bg-white/15 backdrop-blur-md p-5 rounded-2xl border border-white/10 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400">Celebration</span>
                <h4 className="font-bold text-base mt-1 group-hover:text-amber-300 transition-colors">
                  Milad-un-Nabi 2026
                </h4>
                <p className="text-xs text-gray-300 mt-1">Photo + Name + Designation</p>
              </div>
              <span className="text-xs font-semibold text-amber-400 mt-4 flex items-center space-x-1">
                <span>Personalize Now &rarr;</span>
              </span>
            </Link>

            <Link
              to="/c/independence-day-2026"
              className="group bg-white/10 hover:bg-white/15 backdrop-blur-md p-5 rounded-2xl border border-white/10 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400">National</span>
                <h4 className="font-bold text-base mt-1 group-hover:text-blue-300 transition-colors">
                  Independence Day 2026
                </h4>
                <p className="text-xs text-gray-300 mt-1">Commemorative Patriot Poster</p>
              </div>
              <span className="text-xs font-semibold text-blue-400 mt-4 flex items-center space-x-1">
                <span>Personalize Now &rarr;</span>
              </span>
            </Link>

            <Link
              to="/c/school-achievement-2026"
              className="group bg-white/10 hover:bg-white/15 backdrop-blur-md p-5 rounded-2xl border border-white/10 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400">Education</span>
                <h4 className="font-bold text-base mt-1 group-hover:text-emerald-300 transition-colors">
                  School Achievement 2026
                </h4>
                <p className="text-xs text-gray-300 mt-1">Academic Honors &amp; Recognition</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 mt-4 flex items-center space-x-1">
                <span>Personalize Now &rarr;</span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
