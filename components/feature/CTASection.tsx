'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <div className="py-16 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl sm:text-6xl font-bold text-atlantis-400 font-serif mb-10">
          Time tracking you <br />can rely on.
        </h2>
        <p className="max-w-2xl mx-auto text-xl text-gray-300 mb-10">
          From freelance work to agency projects, we have everything you
          need to take care of your time management needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/register" 
            className="rounded-md bg-[#f5fee7] px-6 py-3 text-base font-medium text-[#1e2e05] shadow-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-atlantis-500 focus:ring-offset-2 sm:inline-flex sm:items-center"
          >
            Get Started - It&apos; Free
          </Link>
          <Link 
            href="#how-it-works" 
            className="rounded-md border border-[#f5fee7] px-6 py-3 text-base font-medium text-[#f5fee7] hover:bg-atlantis-900/30 hover:border-white focus:outline-none focus:ring-2 focus:ring-atlantis-500 focus:ring-offset-2 sm:inline-flex sm:items-center"
          >
            See How It Works
          </Link>
        </div>
      </div>
    </div>
  );
} 