import React from 'react';
import Navigation from './Navigation';
import type { User } from '../types/supabase';

interface LayoutProps {
  children?: React.ReactNode;
  userProfile?: any; // Adjust type as per your UserProfile structure
}

const Layout: React.FC<LayoutProps> = ({ children, userProfile }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 bg-grid-pattern">
      <Navigation userProfile={userProfile} />
      <main className="container mx-auto px-4 py-24 md:py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
