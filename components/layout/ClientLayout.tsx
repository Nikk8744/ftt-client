"use client"

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false
  });

  const handleSidebarChange = (isOpen: boolean, isMobile: boolean) => {
    setSidebarState({ isOpen, isMobile });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onSidebarChange={handleSidebarChange} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarState.isOpen} isMobile={sidebarState.isMobile} />
        
        <main className="flex-1 overflow-y-auto pt-16 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
} 