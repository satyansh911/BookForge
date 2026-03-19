import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent selection:text-white">
      <Navbar />
      <main className="pt-24 px-8 pb-12 max-w-[1440px] mx-auto animate-in fade-in duration-700">
        {children}
      </main>
      
      <footer className="px-8 py-12 border-t border-border mt-auto">
        <div className="max-w-[1440px] mx-auto flex justify-between items-end">
          <div className="max-w-md">
            <h2 className="font-serif text-3xl mb-4">BOOKFORGE</h2>
            <p className="text-secondary text-sm leading-relaxed">
              A curated selection of titles that show design in ways the screen never could. 
              Inspiring, educating, and supporting the creators.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-[0.3em] text-muted mb-2">EST. 2026</p>
            <p className="text-xs text-secondary">© 2026 BOOKFORGE AGENCY</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
