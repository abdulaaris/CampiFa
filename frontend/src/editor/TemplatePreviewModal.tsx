import React, { useState, useRef } from 'react';
import { TemplateElement, CampaignField } from '../types';
import { InteractiveCanvas } from '../canvas/InteractiveCanvas';
import { X, Sparkles, Upload, RefreshCw, Sliders, Eye } from 'lucide-react';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  posterUrl: string;
  elements: TemplateElement[];
  fields: CampaignField[];
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  posterUrl,
  elements,
  fields,
}) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'form'>('canvas');
  const [formValues, setFormValues] = useState<Record<string, string>>({
    name: 'ABDUL AARIS',
    designation: 'General Secretary',
    organization: 'i-Fa Design Foundation',
  });
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserPhotoUrl(url);
    }
  };

  const handleCanvasPhotoClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Hidden file picker triggered by clicking canvas photo area */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      <div className="bg-white rounded-none sm:rounded-3xl shadow-elevated border-0 sm:border border-brand-border/60 max-w-5xl w-full h-[100dvh] sm:h-[90vh] flex flex-col overflow-hidden">
        {/* Compact Top Header */}
        <div className="px-3 py-2 sm:px-5 sm:py-3 border-b border-brand-border/40 flex items-center justify-between bg-brand-light/50 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-brand-dark leading-tight">
                Personalization Preview
              </h3>
              <p className="text-[10px] text-brand-muted hidden sm:block">
                Tap photo circle to upload &amp; preview in real time
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick mini mobile tab pills in header */}
            <div className="md:hidden flex bg-white/80 p-0.5 rounded-lg border border-brand-border/80 text-[11px] font-bold">
              <button
                onClick={() => setActiveTab('canvas')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'canvas' ? 'bg-brand-primary text-white' : 'text-brand-dark'
                }`}
              >
                Poster
              </button>
              <button
                onClick={() => setActiveTab('form')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'form' ? 'bg-brand-primary text-white' : 'text-brand-dark'
                }`}
              >
                Inputs
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 text-brand-muted hover:text-brand-dark rounded-lg hover:bg-brand-light transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Left Form: Visible on desktop or when form tab is active on mobile */}
          <div
            className={`w-full md:w-80 p-4 sm:p-5 bg-white border-r border-brand-border/40 overflow-y-auto space-y-3.5 text-xs shrink-0 ${
              activeTab === 'form' ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="flex items-center justify-between pb-1 border-b border-brand-border/30">
              <span className="font-bold text-brand-dark uppercase tracking-wider text-[10px]">
                Simulate Inputs
              </span>
              <button
                onClick={() =>
                  setFormValues({
                    name: 'ABDUL AARIS',
                    designation: 'General Secretary',
                    organization: 'i-Fa Design Foundation',
                  })
                }
                className="flex items-center space-x-1 text-brand-secondary hover:text-brand-primary text-[10px] font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Photo Field */}
            <div className="space-y-1">
              <label className="font-semibold text-brand-dark text-[11px] block">Sample Photo</label>
              <button
                type="button"
                onClick={handleCanvasPhotoClick}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 border-2 border-dashed border-brand-secondary/40 rounded-xl hover:bg-brand-light/40 cursor-pointer transition-colors bg-brand-light/10 text-xs"
              >
                <Upload className="w-3.5 h-3.5 text-brand-primary" />
                <span className="font-semibold text-brand-primary">
                  {userPhotoUrl ? 'Change Photo' : 'Upload Photo'}
                </span>
              </button>
              {userPhotoUrl && (
                <button
                  type="button"
                  onClick={() => setUserPhotoUrl(null)}
                  className="text-[10px] text-red-500 hover:underline block"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {/* Dynamic Text Fields */}
            {fields
              .filter((f) => f.type !== 'photo')
              .map((f) => (
                <div key={f.name} className="space-y-0.5">
                  <label className="font-semibold text-brand-dark text-[11px] block">{f.label}</label>
                  <input
                    id={`input-field-${f.name}`}
                    type="text"
                    value={formValues[f.name] || ''}
                    placeholder={f.placeholder || `Enter ${f.label}`}
                    onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-brand-border/80 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-hidden"
                  />
                </div>
              ))}

            <button
              onClick={() => setActiveTab('canvas')}
              className="md:hidden w-full py-2.5 bg-brand-primary text-white font-bold text-xs rounded-xl mt-3"
            >
              See Updated Poster &rarr;
            </button>
          </div>

          {/* Right Live Canvas (Tap photo area triggers upload, tap text focuses input!) */}
          <div
            className={`flex-1 bg-slate-900/90 sm:bg-slate-100 flex items-center justify-center p-1 sm:p-4 overflow-hidden ${
              activeTab === 'canvas' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <InteractiveCanvas
              posterUrl={posterUrl}
              elements={elements}
              fields={fields}
              selectedElementId={null}
              onSelectElement={() => {}}
              onUpdateElement={() => {}}
              zoom={0.45}
              showGrid={false}
              snapToGrid={false}
              sampleValues={formValues}
              userPhotoUrl={userPhotoUrl}
              onPhotoAreaClick={handleCanvasPhotoClick}
              onTextElementClick={(fieldName) => {
                setActiveTab('form');
                setTimeout(() => {
                  const inputEl = document.getElementById(`input-field-${fieldName}`);
                  inputEl?.focus();
                }, 100);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
