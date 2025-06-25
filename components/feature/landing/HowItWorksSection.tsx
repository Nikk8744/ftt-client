'use client';

import { useState, useEffect, useRef } from 'react';

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<Array<HTMLDivElement | null>>([]);

  const steps = [
    {
      title: "Track Time",
      description: "Easily log hours with one click. Track time for any project or client with our intuitive timer.",
      icon: (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      status: "Generating"
    },
    {
      title: "Analyze Data",
      description: "Get detailed insights about how your time is spent. Identify trends and optimize your productivity.",
      icon: (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
      ),
      status: "Checking"
    },
    {
      title: "Generate Reports",
      description: "Create professional reports for clients and stakeholders. Export in multiple formats for easy sharing.",
      icon: (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      status: "Submitting"
    },
    {
      title: "Get Paid",
      description: "Turn tracked time into invoices with a few clicks. Integrate with popular payment platforms for faster payments.",
      icon: (
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="12" y1="16" x2="12" y2="16" />
          <path d="M17 8h1a2 2 0 1 1 0 4h-1" />
          <path d="M7 12h3a2 2 0 1 0 0-4H7h1a2 2 0 1 1 0 4h-1" />
        </svg>
      ),
      status: "Completed"
    }
  ];

  // Handle scroll-based animation
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const sectionTop = sectionRef.current.getBoundingClientRect().top;
      const sectionHeight = sectionRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Check if section is in viewport
      if (sectionTop < windowHeight * 0.75 && sectionTop > -sectionHeight * 0.5) {
        // Section is visible, determine which step should be active based on scroll position
        const scrollProgress = Math.abs(sectionTop - windowHeight * 0.5) / (sectionHeight * 0.75);
        const newActiveStep = Math.min(
          steps.length - 1,
          Math.floor(scrollProgress * steps.length)
        );
        setActiveStep(newActiveStep);
        
        // Add animation class to steps
        stepsRef.current.forEach((step, index) => {
          if (!step) return;
          
          if (index <= newActiveStep) {
            step.classList.add('active');
          } else {
            step.classList.remove('active');
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [steps.length]);

  // Function to set refs properly
  const setStepRef = (el: HTMLDivElement | null, index: number) => {
    stepsRef.current[index] = el;
  };

  return (
    <section ref={sectionRef} className="py-12 px-6 max-w-7xl mx-auto relative" id="how-it-works">
      <h2 className="text-4xl font-bold text-slate-50 text-center mb-6">
        How <span className="text-atlantis-500 bg-clip-text">TimeTracker</span> Works
      </h2>
      <p className="text-xl text-atlantis-400 text-center max-w-2xl mx-auto mb-20">
        Our simple 4-step process helps you track time efficiently and get paid faster
      </p>
      
      <div className="max-w-4xl mx-auto relative pt-8">
        {/* Vertical progress line - moves to right on small screens, center on large screens */}
        <div className="absolute md:left-1/2 right-[21px] top-0 bottom-0 w-0.5 bg-slate-700/30 md:-translate-x-1/2"></div>
        <div 
          className="absolute md:left-1/2 right-[21px] top-0 w-0.5 bg-sky-400 md:-translate-x-1/2 transition-all duration-500 ease-out"
          style={{ 
            height: activeStep < steps.length - 1 
              ? `calc(${(activeStep + 1) * 100 / steps.length}% - 10px)` 
              : `calc(${(activeStep + 1) * 100 / steps.length}% - 20px)` 
          }}
        ></div>
        
        {steps.map((step, index) => (
          <div 
            key={index}
            ref={(el) => setStepRef(el, index)}
            className={`flex items-start mb-28 relative opacity-40 translate-y-5 transition-all duration-500 ease-out ${index <= activeStep ? 'opacity-100 translate-y-0' : ''} ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
          >
            {/* Circle marker - moves to right on small screens, centered on large screens */}
            <div 
              className={`absolute md:left-1/2 right-[14px] md:-translate-x-1/2 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 z-10 top-[17px] transition-all duration-300 ${
                index <= activeStep ? 'bg-sky-400 border-slate-50 shadow-[0_0_15px_rgba(56,189,248,0.5)]' : ''
              }`}
            ></div>
            
            {/* Status badge */}
            <div
              className={`absolute top-[15px] md:left-1/2 right-[10px] md:-translate-x-1/2 py-1 px-4 bg-sky-500/25 text-atlantis-400 md:text-sky-400 rounded-full text-sm font-bold whitespace-nowrap opacity-0 transition-all duration-300 ${
                index === activeStep ? 'opacity-100 md:-translate-y-10 -translate-x-24' : ''
              }`}
            >
              {step.status}
            </div>
            
            {/* Icon - always on left for mobile, alternates for desktop */}
            <div 
              className={`w-12 h-12 rounded-full bg-slate-800/70 flex items-center justify-center text-sky-400 ml-0 mr-6 transition-all duration-300 ${
                index <= activeStep ? 'bg-sky-500/20 text-slate-50 scale-110 shadow-[0_0_20px_rgba(56,189,248,0.3)]' : ''
              }`}
            >
              {index < activeStep ? (
                <svg
                  className="w-5 h-5 text-slate-50"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : step.icon}
            </div>
            
            {/* Content */}
            <div 
              className={`flex-1 pr-12 md:px-6 text-left md:${index % 2 !== 0 ? 'text-right' : 'text-left'}`}
            >
              <h3 className="text-2xl font-bold text-slate-50 mb-2">{step.title}</h3>
              <p className="text-slate-300 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
} 