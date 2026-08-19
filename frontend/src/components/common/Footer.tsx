import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-brand-border/60 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-black text-sm">
              C
            </div>
            <div>
              <p className="text-sm font-bold text-brand-dark">CampiFa</p>
              <p className="text-xs text-brand-muted">
                Platform by <span className="font-semibold text-brand-primary">i-Fa Design</span> • Create • Personalize • Share
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-brand-muted">
            <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <Link to="/login" className="hover:text-brand-primary transition-colors">Customer Login</Link>
            <Link to="/register" className="hover:text-brand-primary transition-colors">Create Account</Link>
            <Link to="/admin/login" className="hover:text-brand-primary transition-colors">Super Admin</Link>
          </div>

          <p className="text-xs text-brand-muted text-center md:text-right">
            &copy; {new Date().getFullYear()} CampiFa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
