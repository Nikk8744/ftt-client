'use client';

import FlowingMenu from '../../ui/FlowingMenu/FlowingMenu';

export default function FlowingFeaturesSection() {
  // Feature items for the flowing menu
  const featureItems = [
    { 
      link: '#time-tracking', 
      text: 'Time Tracking', 
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' 
    },
    { 
      link: '#project-management', 
      text: 'Project Management', 
      image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' 
    },
    { 
      link: '#task-management', 
      text: 'Task Management', 
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' 
    },
    { 
      link: '#reporting', 
      text: 'Reporting', 
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' 
    },
    { 
      link: '#collaboration', 
      text: 'Team Collaboration', 
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' 
    },
    { 
      link: '#ai-assistant', 
      text: 'AI Assistant', 
      image: 'https://plus.unsplash.com/premium_photo-1683121710572-7723bd2e235d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
    },
  ];

  return (
    <section id="features" className="py-24 bg-neutral-950">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16 max-w-5xl mx-auto">
          <h2 className="text-base text-white font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-lime-500 sm:text-4xl">
            Everything you need to manage your time
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
            Our comprehensive set of features helps freelancers and teams track time, manage projects, and improve productivity.
          </p>
        </div>

        <div className="h-[600px] w-full relative rounded-xl overflow-hidden border border-neutral-800">
          <FlowingMenu items={featureItems} />
        </div>
        
        {/* <div className="mt-12 lg:text-center max-w-5xl mx-auto">
          <p className="text-base text-gray-400">
            Hover over each feature to learn more about how TimeTracker can boost your productivity.
          </p>
        </div> */}
      </div>
    </section>
  );
} 