import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, User as UserIcon, LogOut, Menu, Shield } from 'lucide-react';

export const Header: React.FC<{ onToggleSidebar?: () => void; isPublic?: boolean }> = ({
  onToggleSidebar,
  isPublic = false,
}) => {
  const { user, logout, isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const tapCountRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);

  const handleLogoTap = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTapTimeRef.current > 1200) {
      tapCountRef.current = 1;
    } else {
      tapCountRef.current += 1;
    }
    lastTapTimeRef.current = now;

    if (tapCountRef.current >= 5) {
      e.preventDefault();
      e.stopPropagation();
      tapCountRef.current = 0;
      navigate('/admin/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Mobile Sidebar Toggle */}
          <div className="flex items-center space-x-3">
            {!isPublic && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-brand-dark/70 hover:text-brand-dark hover:bg-brand-light transition-colors"
                aria-label="Toggle Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" onClick={handleLogoTap} className="flex items-center space-x-2.5 group select-none">
              <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-brand-light font-bold text-lg shadow-sm group-hover:scale-105 transition-transform active:scale-95">
                C
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl tracking-tight text-brand-dark group-hover:text-brand-primary transition-colors">
                  Campi<span className="text-brand-primary">Fa</span>
                </span>
                <span className="text-[10px] text-brand-muted font-medium tracking-wider -mt-1 uppercase">
                  by i-Fa Design
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {isSuperAdmin ? (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold hover:bg-amber-200 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 bg-brand-light text-brand-primary rounded-xl text-xs font-bold hover:bg-brand-light/80 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Customer Dashboard</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-brand-light text-brand-dark transition-colors"
                  title="Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-secondary/20 text-brand-secondary font-bold text-xs flex items-center justify-center">
                    {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-medium hidden md:inline truncate max-w-[120px]">
                    {user?.profile?.businessName || user?.profile?.fullName || user?.email}
                  </span>
                </Link>

                <button
                  onClick={() => logout()}
                  className="p-2 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-brand-dark hover:text-brand-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/90 shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
