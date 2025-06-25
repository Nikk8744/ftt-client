'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqData = [
  {
    id: "item-1",
    question: "What is Tracksy and how does it work?",
    answer: "Tracksy is a comprehensive time management solution designed for freelancers and small teams. It allows you to track time spent on projects, manage tasks, generate detailed reports, and streamline your workflow. Simply create projects, add tasks, and start tracking time with our intuitive interface."
  },
  {
    id: "item-2",
    question: "Is Tracksy suitable for teams or just individual users?",
    answer: "Tracksy is perfect for both individual freelancers and teams. You can invite team members to projects, assign tasks, track collective progress, and generate team reports. Our collaboration features make it easy to manage projects with multiple contributors."
  },
  {
    id: "item-3",
    question: "Can I generate reports and invoices?",
    answer: "Yes! Tracksy provides comprehensive reporting features. You can generate detailed time reports, project summaries, and export data in various formats (PDF, CSV, Excel). While we don't have built-in invoicing yet, our reports contain all the information you need for billing clients."
  },
  {
    id: "item-4",
    question: "Is my data secure and private?",
    answer: "Absolutely. We take data security seriously. All your data is encrypted in transit and at rest. We use industry-standard security practices, regular backups, and comply with data protection regulations. Your time tracking data and project information are completely private and secure."
  },
  {
    id: "item-5",
    question: "Do you offer mobile apps?",
    answer: "Currently, Tracksy is a web-based application that works perfectly on mobile browsers. We're working on dedicated mobile apps for iOS and Android, which will be available soon. The web version is fully responsive and provides a great mobile experience."
  },
  {
    id: "item-6",
    question: "Is there a free trial or free plan?",
    answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required. After the trial, you can choose from our flexible pricing plans that scale with your needs. We also offer special discounts for students and non-profit organizations."
  },
  {
    id: "item-7",
    question: "How do I get started with Tracksy?",
    answer: "Getting started is easy! Simply sign up for a free account, create your first project, add some tasks, and start tracking time. Our onboarding process will guide you through the key features. You can also check our documentation and video tutorials for detailed guidance."
  }
];

export default function FAQSection() {
  return (
    <section className="py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(56,189,248,0.1),transparent_50%)]"></div> */}
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked{' '}
            <span className="bg-atlantis-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Got questions? We&apos;ve got answers. Find everything you need to know about TimeTracker and how it can transform your productivity.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="rounded-lg backdrop-blur-sm transition-all duration-300"
              >
                <AccordionTrigger className="text-left bg-atlantis-400/75 text-white px-6 py-4 text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-900 px-6 pb-4 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA Section */}
        {/* <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-slate-300 mb-6">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help you get the most out of TimeTracker.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@timetracker.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Contact Support
              </a>
              <a
                href="/docs"
                className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-slate-600 hover:border-slate-500 text-white font-medium rounded-lg transition-colors duration-200"
              >
                View Documentation
              </a>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}
