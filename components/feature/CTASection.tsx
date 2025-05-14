'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <div className="py-16 bg-[#fff8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl sm:text-6xl font-bold text-[#660033] font-serif mb-10">
          Time tracking you <br />can rely on.
        </h2>
        <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
          From freelance work to agency projects, we have everything you
          need to take care of your time management needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/register" 
            className="rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:inline-flex sm:items-center"
          >
            Get Started - It's Free
          </Link>
          <Link 
            href="#how-it-works" 
            className="rounded-md border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:inline-flex sm:items-center"
          >
            See How It Works
          </Link>
        </div>
      </div>
    </div>
  );
} 