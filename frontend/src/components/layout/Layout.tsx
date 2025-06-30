// Rule applied: Use TypeScript for all code; prefer interfaces over types
import React, { ReactNode } from 'react';
// Rule applied: Use absolute imports for all files @/...
import Header from '@/components/layout/Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      {/* Rule applied: Use Tailwind classes for layout */}
      <div 
        className="container mx-auto max-w-7xl px-4 flex-1 py-8" 
        role="main"
      >
        {children}
      </div>
    </div>
  );

};

export default Layout; 