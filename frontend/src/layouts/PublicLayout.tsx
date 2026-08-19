import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-between">
      <Header isPublic={true} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
