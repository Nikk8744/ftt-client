'use client';

import { useState } from 'react';
// import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 bg-[#0c1e36] h-16`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-full">
        <div className="flex items-center h-full">
          {/* Left - Logo */}
          <div className="flex-none w-40">
            <Link href="/" className="flex items-center">
              {/* <svg 
                className="h-7 w-7 text-blue-500 mr-2" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg> */}
              <span className="text-lg font-semibold text-white font-serif">TimeTracker</span>
            </Link>
          </div>

          {/* Center - Navigation Links */}
          <div className="flex-grow hidden md:flex justify-center font-serif">
            <div className="flex space-x-10">
              <Link href="#features" className="text-gray-300 hover:text-blue-500 text-sm transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-300 hover:text-blue-500 text-sm transition-colors">
                How It Works
              </Link>
              <Link href="#testimonials" className="text-gray-300 hover:text-blue-500 text-sm transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-blue-500 text-sm transition-colors">
                Pricing
              </Link>
            </div>
          </div>

          {/* Right - Login Button */}
          <div className="flex-none w-40 hidden md:flex justify-end">
            <Link 
              href="/login" 
              className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Log in
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="ml-auto md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#0c1e36] border-t border-gray-700 absolute w-full`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link href="#features" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md" onClick={() => setIsMenuOpen(false)}>
            Features
          </Link>
          <Link href="#how-it-works" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md" onClick={() => setIsMenuOpen(false)}>
            How It Works
          </Link>
          <Link href="#testimonials" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md" onClick={() => setIsMenuOpen(false)}>
            Testimonials
          </Link>
          <Link href="#pricing" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md" onClick={() => setIsMenuOpen(false)}>
            Pricing
          </Link>
          <Link href="/login" className="block px-3 py-2 mt-2 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-md" onClick={() => setIsMenuOpen(false)}>
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
} 