import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Shield, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Super Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@campifa.com');
    setPassword('AdminPassword123!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl text-white">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Super Administrator</h2>
          <p className="text-xs text-slate-400 mt-1">Platform Control &amp; Customer Oversight</p>
        </div>

        {/* Demo Admin Auto-fill */}
        <div className="mb-6 p-3.5 bg-slate-700/60 border border-slate-600 rounded-2xl flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs font-bold text-red-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Super Admin Credentials</span>
            </p>
            <p className="text-[10px] text-slate-400">admin@campifa.com</p>
          </div>
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Auto Fill
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/80 text-red-300 text-xs rounded-xl flex items-center space-x-2 border border-red-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@campifa.com"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating Admin...' : 'Sign In as Super Admin'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-700 text-center">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Customer Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
