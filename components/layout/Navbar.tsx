"use client";

import { useState, useEffect } from "react";
// import Image from 'next/image';
import Link from "next/link";
import Button from "../ui/Button";
import Logo from "../ui/Logo";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;

      // True if scrolling up, false if scrolling down
      const visible = prevScrollPos > currentScrollPos || currentScrollPos < 10;

      setPrevScrollPos(currentScrollPos);
      setIsVisible(visible);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  return (
    <nav
      className={`w-full z-50 transition-all duration-500 rounded-b-3xl border-b-2 shadow-[3px_5px_7px_4px_#4c63f3e6] border-atlantis-500 bg-black h-20 fixed top-0 transform ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-full">
        <div className="flex items-center h-full">
          {/* Left - Logo */}
          <div className="flex-none w-44">
            <div className="flex items-center">
              {/* <Clock className="w-4 h-4 lg:w-6 lg:h-6 text-white mr-2 mb-0" /> */}
              <Logo size="md" />
              {/* <span className="text-xl lg:text-2xl font-semibold text-white pr-7 py-3 rounded-xl tracking-widest ml-3">
                Tracksy
              </span> */}
            </div>
          </div>

          {/* Center - Navigation Links */}
          <div className="flex-grow hidden md:flex justify-center text-xl tracking-wider">
            <div className="flex ">
              <Link
                href="#features"
                className="text-white hover:border-atlantis-400 border-b-2 border-transparent text-sm transition-colors px-5 py-3 rounded-xl"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-white hover:border-atlantis-400 border-b-2 border-transparent text-sm transition-colors px-5 py-3 rounded-xl"
              >
                How It Works
              </Link>
              <Link
                href="#testimonials"
                className="text-white hover:border-atlantis-400 border-b-2 border-transparent text-sm transition-colors px-5 py-3 rounded-xl"
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                className="text-white hover:border-atlantis-400 border-b-2 border-transparent text-sm transition-colors px-5 py-3 rounded-xl"
              >
                FAQs
              </Link>
            </div>
          </div>

          {/* Right - Login Button */}
          <div className="flex-none w-40 hidden md:flex justify-end">
            {/* <Link 
              href="/login" 
              className="px-5 py-3 rounded-xl border-2 border-atlantis-500 text-white text-base tracking-wider font-serif hover:bg-slate-800 hover:border-atlantis-400 transition-colors"
            >
              Log in
            </Link> */}
            <Button variant="brandBtn" className="py-4 px-6">
              <Link href="/login">Log in</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="ml-auto md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-atlantis-600/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:hidden bg-atlantis-400 border-t-2 border-atlantis-600/50 rounded-3xl absolute w-full`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 text-center text-lg tracking-wider">
          <Link
            href="#features"
            className="block px-3 py-2 text-white hover:bg-gray-100 rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="block px-3 py-2 text-white hover:bg-gray-100 rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="#testimonials"
            className="block px-3 py-2 text-white hover:bg-gray-100 rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            Testimonials
          </Link>
          <Link
            href="#pricing"
            className="block px-3 py-2 text-white hover:bg-gray-100 rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            FAQs
          </Link>
          <Link
            href="/login"
            className="block px-3 py-2 mt-2 text-center border-2 border-white text-white  hover:bg-white rounded-2xl"
            onClick={() => setIsMenuOpen(false)}
          >
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
}
