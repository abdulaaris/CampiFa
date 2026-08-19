import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  BarChart3,
  UserCheck,
  Settings,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Campaigns', icon: Layers, path: '/campaigns' },
    { label: 'Create Campaign', icon: PlusCircle, path: '/campaigns/new' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Profile', icon: UserCheck, path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-brand-border/60 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Top Logo and Close on Mobile */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-brand-border/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-brand-light font-bold text-base">
                C
              </div>
              <span className="font-display font-black text-lg text-brand-dark">
                Campi<span className="text-brand-primary">Fa</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-brand-muted hover:text-brand-dark rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Workspace Badge */}
          <div className="p-4 mx-3 my-3 bg-brand-light/60 border border-brand-border/40 rounded-xl">
            <p className="text-[11px] uppercase tracking-wider text-brand-muted font-bold">Workspace</p>
            <p className="text-sm font-bold text-brand-dark truncate mt-0.5">
              {user?.profile?.businessName || 'My Events & Campaigns'}
            </p>
            <p className="text-xs text-brand-muted truncate">
              {user?.profile?.fullName || user?.email}
            </p>
          </div>

          {/* Nav Links */}
          <nav className="px-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-brand-dark/70 hover:bg-brand-light/80 hover:text-brand-dark'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-secondary'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Logout */}
        <div className="p-4 border-t border-brand-border/40 space-y-2">
          <button
            onClick={() => logout()}
            className="flex items-center space-x-3 w-full px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
          <p className="text-[10px] text-brand-muted text-center pt-2">
            CampiFa v1.0 • i-Fa Design
          </p>
        </div>
      </aside>
    </>
  );
};
