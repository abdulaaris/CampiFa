import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('customer@campifa.com');
    setPassword('CustomerPassword123!');
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-brand-border/60 shadow-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            C
          </div>
          <h2 className="text-2xl font-extrabold text-brand-dark">Customer Login</h2>
          <p className="text-xs text-brand-muted mt-1">
            Access your campaign posters, editor, and live analytics
          </p>
        </div>

        {/* Demo Account Quick-Fill Card */}
        <div className="mb-6 p-3.5 bg-brand-light/60 border border-brand-secondary/30 rounded-2xl flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs font-bold text-brand-primary flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Customer Account</span>
            </p>
            <p className="text-[10px] text-brand-muted">customer@campifa.com</p>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/90 shadow-2xs transition-all"
          >
            Auto Fill
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-brand-dark block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.com"
              className="w-full px-3.5 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-brand-dark">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-brand-secondary hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-white border border-brand-border/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-brand-primary text-white font-bold text-xs rounded-xl hover:bg-brand-primary/90 shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Logging in...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-brand-border/40 text-center text-xs text-brand-muted">
          <span>Don&apos;t have a customer account? </span>
          <Link to="/register" className="font-bold text-brand-primary hover:underline">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};
