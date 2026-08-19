import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { uploadService } from '../services/uploadService';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { UserCheck, Save, Upload, Check, AlertCircle, Building2, Phone, Globe, MessageSquare } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [brandColor, setBrandColor] = useState<string>('#7B2525');
  const [address, setAddress] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; data: { profile: any } }>('/customer/profile');
        const p = res.data.profile;
        if (p) {
          setFullName(p.fullName || '');
          setBusinessName(p.businessName || '');
          setPhone(p.phone || '');
          setBrandColor(p.brandColor || '#7B2525');
          setAddress(p.address || '');
          setWebsite(p.website || '');
          setWhatsappNumber(p.whatsappNumber || '');
          setLogoUrl(p.logoUrl || '');
        }
      } catch (err: any) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const res = await uploadService.uploadLogo(file);
      setLogoUrl(res.url);
      setSuccess('Logo uploaded! Click "Save Changes" to apply.');
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.put('/customer/profile', {
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        phone: phone.trim() || null,
        brandColor,
        address: address.trim() || null,
        website: website.trim() || null,
        whatsappNumber: whatsappNumber.trim() || null,
        logoUrl: logoUrl || null,
      });

      await refreshUser();
      setSuccess('Customer profile and branding updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="md" text="Loading profile details..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark">Customer Profile &amp; Branding</h1>
        <p className="text-xs text-brand-muted mt-0.5">
          Manage your organization details, brand colors, and contact info
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-brand-border/60 shadow-card">
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

        <form onSubmit={handleSave} className="space-y-6">
          {/* Logo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-brand-light/30 border border-brand-border/60 rounded-2xl">
            <div className="w-20 h-20 rounded-2xl bg-white border border-brand-border/80 flex items-center justify-center overflow-hidden shadow-2xs">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 className="w-8 h-8 text-brand-muted/40" />
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <label className="text-xs font-bold text-brand-dark block">Organization Logo</label>
              <p className="text-[11px] text-brand-muted">
                Optional badge shown on your customer workspace and landing preview.
              </p>
              <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-brand-border/80 text-brand-dark font-bold text-xs rounded-lg hover:bg-brand-light cursor-pointer mt-2 transition-colors">
                <Upload className="w-3.5 h-3.5 text-brand-primary" />
                <span>Upload Logo (PNG/JPG)</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Name & Business */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1.5">
                Business / Organization *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
              />
            </div>
          </div>

          {/* Email (Readonly) & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 bg-gray-100 border border-brand-border/80 rounded-xl text-xs font-medium text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
              />
            </div>
          </div>

          {/* Brand Color & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1.5">Primary Brand Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-9 h-9 p-0 border border-brand-border/80 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-brand-border/80 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1.5">
                Official WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. +15552345678"
                className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
              />
            </div>
          </div>

          {/* Website & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1.5">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://myorganization.org"
                className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1.5">Office Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 100 Main Street, City"
                className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-brand-primary text-white font-bold text-xs rounded-xl hover:bg-brand-primary/90 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
