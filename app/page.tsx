'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import HeroSection from '@/components/feature/HeroSection';
import FeaturesSection from '@/components/feature/FeaturesSection';
import TestimonialsSection from '@/components/feature/TestimonialsSection';
import PricingSection from '@/components/feature/PricingSection';
import HowItWorksSection from '@/components/feature/HowItWorksSection';
import CTASection from '@/components/feature/CTASection';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Add simple animation for elements with fade-in class
    const fadeElems = document.querySelectorAll('.fade-in');
    fadeElems.forEach((elem, index) => {
      setTimeout(() => {
        if (elem instanceof HTMLElement) {
          elem.style.opacity = '1';
          elem.style.transform = 'translateY(0)';
        }
      }, 100 * (index + 1));
    });
  }, []);

  // Initial styles object
  const styles = {
    container: {
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
      color: '#f8fafc',
      position: 'relative' as const,
      overflow: 'hidden',
      margin: 0,
      padding: 0,
    },
    main: {
      width: '100%',
      position: 'relative' as const,
      zIndex: 1,
      margin: 0,
      padding: 0,
    },
    footer: {
      padding: '4rem 2rem 2rem',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      color: '#cbd5e1',
      textAlign: 'center' as const,
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    },
    footerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      textAlign: 'left' as const,
    },
    footerColumn: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    footerTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#f8fafc',
    },
    footerLink: {
      color: '#94a3b8',
      textDecoration: 'none',
      transition: 'color 0.2s ease',
    },
    footerLinkHover: {
      color: '#e0f2fe',
    },
    copyright: {
      marginTop: '3rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      color: '#94a3b8',
      fontSize: '0.875rem',
    },
    socialLinks: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginTop: '1.5rem',
    },
    socialIcon: {
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#cbd5e1',
      transition: 'all 0.3s ease',
    },
    socialIconHover: {
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
      color: '#e0f2fe',
      transform: 'translateY(-3px)',
    },
    orb: {
      position: 'absolute' as const,
      borderRadius: '50%',
      filter: 'blur(60px)',
      zIndex: 0,
    },
    orb1: {
      top: '10%',
      left: '10%',
      width: '300px',
      height: '300px',
      background: 'rgba(56, 189, 248, 0.15)',
    },
    orb2: {
      bottom: '20%',
      right: '10%',
      width: '400px',
      height: '400px',
      background: 'rgba(168, 85, 247, 0.1)',
    },
    clockIcon: {
      display: 'inline-block',
      marginRight: '8px',
      verticalAlign: 'middle',
    }
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLElement>, hoverStyle: React.CSSProperties) => {
    // Type-safe way to set style properties
    const style = e.currentTarget.style;
    Object.entries(hoverStyle).forEach(([key, value]) => {
      if (value !== undefined && !['length', 'parentRule'].includes(key)) {
        style.setProperty(
          key.replace(/([A-Z])/g, '-$1').toLowerCase(),
          value as string
        );
      }
    });
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLElement>, originalStyle: React.CSSProperties) => {
    // Type-safe way to set style properties
    const style = e.currentTarget.style;
    Object.entries(originalStyle).forEach(([key, value]) => {
      if (value !== undefined && !['length', 'parentRule'].includes(key)) {
        style.setProperty(
          key.replace(/([A-Z])/g, '-$1').toLowerCase(), 
          value as string
        );
      }
    });
  };

  // Only render content when mounted to prevent hydration errors
  if (!mounted) {
    return <div style={styles.container}></div>;
  }

  return (
    <div style={styles.container}>
      <div style={{...styles.orb, ...styles.orb1}}></div>
      <div style={{...styles.orb, ...styles.orb2}}></div>
      
      <Navbar />
      
      <main style={styles.main}>
        <div className="fade-in">
          <HeroSection />
        </div>
        
        <div id="features" className="fade-in">
          <FeaturesSection />
        </div>
        
        <div id="how-it-works" className="fade-in">
          <HowItWorksSection />
        </div>
        
        <div id="testimonials" className="fade-in">
          <TestimonialsSection />
        </div>
        
        <div id="pricing" className="fade-in">
          <PricingSection />
        </div>
        
        <div className="fade-in">
          <CTASection />
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>TimeTracker</h3>
            <p>The best time tracking solution for freelancers and small teams. Track time, manage projects, and get paid.</p>
            <div style={styles.socialLinks}>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseOver={(e) => handleMouseOver(e, styles.socialIconHover)}
                onMouseOut={(e) => handleMouseOut(e, styles.socialIcon)}
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseOver={(e) => handleMouseOver(e, styles.socialIconHover)}
                onMouseOut={(e) => handleMouseOut(e, styles.socialIcon)}
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseOver={(e) => handleMouseOver(e, styles.socialIconHover)}
                onMouseOut={(e) => handleMouseOut(e, styles.socialIcon)}
                aria-label="GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Product</h3>
            <Link 
              href="#features" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              Pricing
            </Link>
            <Link 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              Integrations
            </Link>
            <Link 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              Updates
            </Link>
          </div>
          
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Resources</h3>
            <Link 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              Blog
            </Link>
            <Link 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              Help Center
            </Link>
            <Link 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              Guides
            </Link>
            <Link 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              API Docs
            </Link>
          </div>
          
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Company</h3>
            <Link 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              About
            </Link>
            <Link 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              Careers
            </Link>
            <Link 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              Contact
            </Link>
            <Link 
              href="#" 
              style={styles.footerLink}
              onMouseOver={(e) => handleMouseOver(e, styles.footerLinkHover)}
              onMouseOut={(e) => handleMouseOut(e, styles.footerLink)}
            >
              Privacy
            </Link>
          </div>
        </div>
        
        <div style={styles.copyright}>
          © {new Date().getFullYear()} TimeTracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
