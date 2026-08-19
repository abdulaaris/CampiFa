import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, ExternalLink } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  campaignSlug: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  campaignTitle,
  campaignSlug,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fullUrl = `${window.location.origin}/c/${campaignSlug}`;

  useEffect(() => {
    if (isOpen && campaignSlug) {
      QRCode.toDataURL(fullUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#7B2525',
          light: '#FFFFFF',
        },
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [isOpen, campaignSlug, fullUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `CampiFa-QR-${campaignSlug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-elevated border border-brand-border/60 max-w-md w-full p-6 text-center relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/40">
          <div className="text-left">
            <h3 className="text-lg font-bold text-brand-dark">Campaign QR & Link</h3>
            <p className="text-xs text-brand-muted truncate max-w-[280px]">{campaignTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-dark/60 hover:text-brand-dark hover:bg-brand-light/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Display */}
        <div className="my-6 flex flex-col items-center justify-center p-4 bg-brand-light/30 border border-brand-border/40 rounded-xl">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code for ${campaignTitle}`}
              className="w-56 h-56 rounded-lg shadow-sm border border-brand-border/60"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-400">Generating QR...</span>
            </div>
          )}
          <span className="text-xs text-brand-muted mt-3 font-mono break-all px-2">{fullUrl}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-light text-brand-primary font-semibold text-sm rounded-xl hover:bg-brand-light/80 border border-brand-secondary/30 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-primary text-white font-semibold text-sm rounded-xl hover:bg-brand-primary/90 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download QR</span>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-brand-border/40">
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-brand-secondary hover:text-brand-primary font-medium space-x-1"
          >
            <span>Open Public Campaign Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
