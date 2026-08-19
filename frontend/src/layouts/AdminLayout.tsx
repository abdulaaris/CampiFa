import React from 'react';
import { Outlet, Navigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/common/Header';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Users, Layers, LayoutDashboard, Shield, ArrowLeft } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, loading, isAuthenticated, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <LoadingSpinner size="lg" text="Authenticating Administrator..." />
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-display font-bold text-base tracking-tight text-white">
                    CampiFa <span className="text-red-400 text-xs uppercase px-2 py-0.5 bg-red-950/60 rounded">Super Admin</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Admin Nav */}
            <nav className="flex items-center space-x-2 sm:space-x-4 text-xs font-semibold">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/customers"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                Customers
              </NavLink>
              <NavLink
                to="/admin/campaigns"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                Campaigns
              </NavLink>
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors ml-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Customer View</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
