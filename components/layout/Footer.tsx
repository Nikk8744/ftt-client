"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
// import Threads from '@/components/ui/Threads/Threads';
import { ChevronUp, Clock } from "lucide-react";
import Button from "@/components/ui/Button";

// Social media icons as separate components for better organization
const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

// Footer link component for consistent styling
const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="text-slate-900 font-mono hover:text-atlantis-700 transition-colors duration-300 text-sm hover:translate-x-1 inline-block transform"
  >
    {children}
  </Link>
);

// Social link component
const SocialLink = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:text-blue-300 transition-all duration-300 ease-in-out hover:-translate-y-1 transform"
    aria-label={label}
  >
    {children}
  </a>
);

export default function Footer() {
  // Animation state for the footer
  const [visible, setVisible] = useState(false);
  // State for the back to top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth animation after page loads
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);

    // Function to handle scroll event
    const handleScroll = () => {
      // Show button when user scrolls down 300px from the top
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Function to scroll back to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="px-4 md:px-6 lg:px-12 xl:px-12 pb-6 md:pb-12 pt-6 md:pt-12 bg-[#0a0a0a]">
      <div
        className={`relative py-12 md:py-16 px-5 md:px-8 bg-atlantis-400 border border-atlantis-500/50 rounded-3xl overflow-hidden transition-opacity duration-1000 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Threads animation background */}
        {/* <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <Threads 
            color={[0.2, 0.4, 0.8]}
            amplitude={0.8}
            distance={0}
            enableMouseInteraction={true}
          />  
        </div> */}

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Company name and description at the top */}
          <div className="mb-10 flex flex-col items-center text-center gap-4">
            <div className="flex items-center space-x-2 justify-center">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br flex items-center justify-center">
                <Clock className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 font-serif tracking-wide">
                Tracksy
              </h3>
            </div>
            <p className="text-slate-800 font-serif font-semibold tracking-wider max-w-xl mx-auto">
              The best time tracking solution for freelancers and small teams.
              Track time, manage projects, and get paid.
            </p>
            {/* Social links */}
            <div className="flex space-x-3 pt-2 justify-center">
              <SocialLink href="#" label="Twitter">
                <TwitterIcon />
              </SocialLink>
              <SocialLink href="#" label="LinkedIn">
                <LinkedInIcon />
              </SocialLink>
              <SocialLink href="#" label="GitHub">
                <GitHubIcon />
              </SocialLink>
            </div>
          </div>

          {/* Footer content grid - centered */}
          <div className="flex justify-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-16 mt-8 items-start max-w-6xl w-full mx-auto">
              {/* Product column */}
              <div
                className="space-y-4 items-center text-center
              "
              >
                <h3 className="text-base md:text-lg font-bold uppercase text-slate-900 tracking-wider font-serif">
                  Product
                </h3>
                <div className="flex flex-col space-y-2">
                  <FooterLink href="#features">Features</FooterLink>
                  <FooterLink href="#pricing">Pricing</FooterLink>
                  <FooterLink href="/dashboard">Dashboard</FooterLink>
                  <FooterLink href="#integrations">Integrations</FooterLink>
                  <FooterLink href="#updates">Updates</FooterLink>
                </div>
              </div>

              {/* Resources column */}
              <div className="space-y-4 items-center text-center">
                <h3 className="text-base md:text-lg font-bold uppercase text-slate-900 tracking-wider font-serif">
                  Resources
                </h3>
                <div className="flex flex-col space-y-2">
                  <FooterLink href="#blog">Blog</FooterLink>
                  <FooterLink href="#help">Help Center</FooterLink>
                  <FooterLink href="#guides">Guides</FooterLink>
                  <FooterLink href="#api">API Docs</FooterLink>
                </div>
              </div>

              {/* Company column */}
              <div className="space-y-4 items-center text-center">
                <h3 className="text-base md:text-lg font-bold uppercase text-slate-900 tracking-wider font-serif">
                  Company
                </h3>
                <div className="flex flex-col space-y-2">
                  <FooterLink href="#about">About</FooterLink>
                  <FooterLink href="#careers">Careers</FooterLink>
                  <FooterLink href="#privacy">Privacy</FooterLink>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter signup */}
          {/* <div className="mt-12 p-6 rounded-2xl bg-slate-800 border border-slate-700/50 backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2">
                <h4 className="text-white font-medium text-lg mb-1">Stay up to date</h4>
                <p className="text-slate-200 text-sm">Get product updates, company news, and more.</p>
              </div>
              <div>
                <div className="flex space-x-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                  <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-300">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div> */}

          {/* Bottom bar with copyright and Back to Top */}
          <div className="mt-12 pt-8 border-t border-atlantis-600/50 flex flex-col md:flex-row justify-between items-center text-slate-800 text-sm gap-4 md:gap-0 font-sans font-normal">
            <div className="mb-2 md:mb-0">
              © {new Date().getFullYear()} TimeTracker. All rights reserved.
            </div>
            <div className="flex flex-wrap space-x-6 items-center justify-center">
              <FooterLink href="#terms">Terms</FooterLink>
              <FooterLink href="#privacy">Privacy</FooterLink>
              <FooterLink href="#cookies">Cookies</FooterLink>
            </div>
          </div>
        </div>
      </div>

      {/* Floating back to top button with animation */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out transform ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "translate-y-16 opacity-0"
        }`}
      >
        <Button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-atlantis-500 hover:bg-atlantis-600 text-white font-bold shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Back to top"
        >
          <ChevronUp className="w-8 h-8 stroke-[3]" />
        </Button>
      </div>
    </div>
  );
}
