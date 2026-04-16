/**
 * Tools hub page — grid of available and coming-soon peptide utility tools
 * (reconstitution calculator, cycle planner, dosing schedule).
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tools',
  description: 'Practical peptide tools — reconstitution calculator, cycle planner, dosing schedule, and more.',
};

const tools = [
  {
    href: '/atlas/tools/reconstitution',
    title: 'Reconstitution Calculator',
    description: 'Calculate exact injection volumes for reconstituted peptide vials. Supports all common vial sizes and syringe types.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    available: true,
  },
  {
    href: '/atlas/tools/cycle-planner',
    title: 'Cycle Planner',
    description: 'Plan multi-peptide on/off cycles with an interactive calendar. Get AI analysis of sequencing and timing.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    available: false,
  },
  {
    href: '/atlas/tools/schedule',
    title: 'Dosing Schedule',
    description: 'Generate a daily dosing schedule from your protocol. Morning, afternoon, evening, and bedtime time blocks.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    available: false,
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Tools</h1>
        <p className="text-sm text-text-secondary mt-1">
          Practical calculators and planners for your peptide protocol.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <div key={tool.href} className="relative">
            {tool.available ? (
              <Link
                href={tool.href}
                className="block glass rounded-xl p-5 hover:bg-white/[0.04] transition-colors group h-full"
              >
                <div className="text-neon-cyan mb-3 group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <h3 className="text-sm font-semibold text-foreground">{tool.title}</h3>
                <p className="text-xs text-text-secondary mt-1">{tool.description}</p>
              </Link>
            ) : (
              <div className="block glass rounded-xl p-5 opacity-60 h-full">
                <div className="text-text-secondary mb-3">{tool.icon}</div>
                <h3 className="text-sm font-semibold text-foreground">{tool.title}</h3>
                <p className="text-xs text-text-secondary mt-1">{tool.description}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] font-medium text-text-secondary border border-white/[0.06]">
                  Coming Soon
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
