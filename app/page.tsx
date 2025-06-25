'use client';

import { useEffect, useState } from 'react';
import HeroSection from '@/components/feature/landing/HeroSection';
import FlowingFeaturesSection from '@/components/feature/landing/FlowingFeaturesSection';
import TestimonialsSection from '@/components/feature/landing/TestimonialsSection';
import FAQSection from '@/components/feature/landing/FAQSection';
import HowItWorksSection from '@/components/feature/landing/HowItWorksSection';
import CTASection from '@/components/feature/landing/CTASection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
      fontFamily: 'var(--font-dm-sans), sans-serif',
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
      background: 'rgba(186, 242, 100, 0.15)', // Using atlantis-300 with low opacity
    },
    orb2: {
      bottom: '20%',
      right: '10%',
      width: '400px',
      height: '400px',
      background: 'rgba(160, 230, 53, 0.1)', // Using atlantis-400 with low opacity
    },
    clockIcon: {
      display: 'inline-block',
      marginRight: '8px',
      verticalAlign: 'middle',
    }
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
          <FlowingFeaturesSection />
        </div>
        
        <div id="how-it-works" className="fade-in bg-[#0a0a0a]">
          <HowItWorksSection />
        </div>
        
        <div id="testimonials" className="fade-in">
          <TestimonialsSection />
        </div>
        
        <div id="pricing" className="fade-in">
          {/* <PricingSection /> */}
          <FAQSection />
        </div>
        
        <div className="fade-in">
          <CTASection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
