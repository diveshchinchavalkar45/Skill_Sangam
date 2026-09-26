import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative selection:bg-brand-500 selection:text-white">
      {/* Global Background Layer with Juggling Skills Graphic */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
        aria-hidden="true"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-20 filter contrast-125 saturate-125"
          style={{ backgroundImage: `url('/skill-bg.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-slate-50/90 to-slate-50/95" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
