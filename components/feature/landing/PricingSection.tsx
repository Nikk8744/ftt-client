'use client';

import { useState } from 'react';

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for freelancers just getting started',
      price: { monthly: 0, annual: 0 },
      features: [
        'Track time for up to 3 projects',
        'Basic project management',
        'Up to 2 team members',
        'Basic reporting',
        'Email support',
      ],
      cta: 'Start for Free',
      highlight: false,
    },
    {
      name: 'Professional',
      description: 'Everything you need for growing businesses',
      price: { monthly: 19, annual: 15 },
      features: [
        'Unlimited projects',
        'Advanced project management',
        'Up to 10 team members',
        'Advanced reporting',
        'Priority email support',
        'Client management',
        'Invoicing',
      ],
      cta: 'Start Free Trial',
      highlight: true,
    },
    {
      name: 'Enterprise',
      description: 'Advanced features for large teams and organizations',
      price: { monthly: 49, annual: 39 },
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'Custom permissions',
        'API access',
        'Dedicated account manager',
        'Single sign-on (SSO)',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-white font-semibold tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-lime-400 sm:text-4xl">
            Plans for teams of all sizes
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
            Choose the perfect plan for your needs. Start with our free tier and upgrade as you grow.
          </p>
          
          <div className="mt-12 flex justify-center">
            <div className="relative bg-gray-300 p-1 flex rounded-lg text-black">
              <button
                type="button"
                className={`${
                  !annual ? 'bg-white shadow-sm' : 'bg-transparent'
                } relative py-2 px-6 rounded-md transition-colors duration-200 font-medium text-sm focus:outline-none`}
                onClick={() => setAnnual(false)}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`${
                  annual ? 'bg-white shadow-sm' : 'bg-transparent'
                } relative py-2 px-6 rounded-md transition-colors duration-200 font-medium text-sm focus:outline-none`}
                onClick={() => setAnnual(true)}
              >
                Annual <span className="text-indigo-600 font-semibold">(20% off)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-lg ${
                plan.highlight
                  ? 'border-2 border-indigo-600 shadow-xl scale-105 lg:scale-110 z-10'
                  : 'border border-gray-200 shadow-md'
              } bg-white overflow-hidden transition-all hover:shadow-xl`}
            >
              {plan.highlight && (
                <div className="absolute top-0 inset-x-0 px-4 py-1 bg-indigo-600 text-white text-xs text-center font-semibold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div className="p-6 bg-gray-50">
                <h3 className={`text-2xl font-bold ${plan.highlight ? 'text-indigo-600' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {plan.description}
                </p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="ml-1 text-xl font-medium text-gray-500">
                    {plan.price.annual === 0 ? '' : '/month'}
                  </span>
                </div>
                {plan.price.annual > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    {annual ? 'Billed annually' : 'Billed monthly'}
                  </p>
                )}
              </div>
              <div className="p-6 space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex">
                      <svg
                        className={`flex-shrink-0 h-5 w-5 ${plan.highlight ? 'text-indigo-500' : 'text-green-500'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <button
                    type="button"
                    className={`w-full rounded-md px-4 py-2 text-sm font-medium ${
                      plan.highlight
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 