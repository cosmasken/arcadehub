import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 bg-grid-pattern">
      <Navigation />
      <main className="container mx-auto px-4 py-24 md:py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
