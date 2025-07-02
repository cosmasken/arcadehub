import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import type { User } from '../types/supabase';

interface LayoutProps {
  children?: React.ReactNode;
  userProfile?: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, userProfile }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 bg-grid-pattern">
      <Navigation userProfile={userProfile} />
      <main className="container mx-auto px-4 py-12 md:py-6">
        {children || <Outlet context={{ userProfile }} />}
      </main>
    </div>
  );
};

export default Layout;
