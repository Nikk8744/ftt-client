'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      quote: "TimeTracker has completely transformed how I manage my freelance business. I can now accurately track hours and bill clients with confidence.",
      name: "Sarah Johnson",
      role: "Freelance Designer",
      image: "https://images.unsplash.com/photo-1550682290-d071c75759f9?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 2,
      quote: "As a small agency owner, I needed a simple way to track team productivity. This platform gives me all the insights I need without the complexity.",
      name: "Michael Chen",
      role: "Agency Owner",
      image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      id: 3,
      quote: "I've tried multiple time tracking tools, but this one stands out for its intuitive interface and comprehensive project management features.",
      name: "Emily Rodriguez",
      role: "Project Manager",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const next = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-12 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-white font-semibold tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-lime-400 sm:text-4xl">
            What our users are saying
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
            Don&apos;t just take our word for it. See what our satisfied users have to say about TimeTracker.
          </p>
        </div>

        <div className="mt-16">
          <div className="relative bg-gray-50 rounded-xl overflow-hidden shadow-lg">
            <div className="relative lg:grid lg:grid-cols-12">
              <div className="hidden lg:block lg:col-span-4 bg-indigo-600 relative">
                <div className="relative" style={{ paddingBottom: '150%' }}>
                  <div className="absolute inset-0">
                    <Image 
                      className="object-cover  filter brightness-100 "
                      src={testimonials[activeTestimonial].image}
                      alt={testimonials[activeTestimonial].name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-700/70 to-indigo-900/90 mix-blend-multiply" />
                  </div>
                </div>
              </div>
              <div className="relative lg:col-span-8 px-6 py-12 lg:p-16">
                <div className="relative">
                  <svg
                    className="absolute top-0 left-0 transform -translate-x-6 -translate-y-8 h-16 w-16 text-indigo-200"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="relative text-xl lg:text-2xl font-medium text-gray-700 mt-8">
                    {testimonials[activeTestimonial].quote}
                  </p>
                  <div className="mt-8 flex items-center">
                    <div className="flex-shrink-0 lg:hidden relative w-12 h-12">
                      <Image
                        className="rounded-full object-cover"
                        src={testimonials[activeTestimonial].image}
                        alt={testimonials[activeTestimonial].name}
                        fill
                        sizes="48px"
                      />
                    </div>
                    <div className="ml-4 lg:ml-0">
                      <div className="text-base font-medium text-gray-900">{testimonials[activeTestimonial].name}</div>
                      <div className="text-sm font-medium text-indigo-600">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center px-6 py-4 bg-gray-100">
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`h-2 w-2 rounded-full ${
                      index === activeTestimonial ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                    onClick={() => setActiveTestimonial(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50"
                  onClick={prev}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50"
                  onClick={next}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 