import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ChatWidget } from '@/components/ai/chat-widget';
import { SessionProvider } from '@/components/auth/session-provider';
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration';
import { ReminderScheduler } from '@/components/pwa/reminder-scheduler';
import { AchievementToast } from '@/components/engagement/achievement-toast';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'PeptideAtlas - Interactive Peptide Education Platform',
    template: '%s | PeptideAtlas',
  },
  description:
    'Explore how peptides affect the body through our interactive visual atlas. Build stacks, compare peptides, and discover the right protocol for your goals.',
  keywords: [
    'peptides',
    'peptide guide',
    'BPC-157',
    'peptide stacks',
    'growth hormone peptides',
    'healing peptides',
    'peptide education',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PeptideAtlas',
  },
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/app-icon-1024.webp',
  },
  openGraph: {
    title: 'PeptideAtlas — The peptide reference, personalized to you.',
    description:
      'Track your protocol, log doses, run AI safety checks on your stack, and interpret bloodwork — grounded in 33 peptides with verified citations.',
    url: 'https://peptideatlas.ai',
    siteName: 'PeptideAtlas',
    images: [
      {
        url: '/og/og-default.webp',
        width: 2048,
        height: 2048,
        alt: 'PeptideAtlas — The peptide reference, personalized to you.',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PeptideAtlas — The peptide reference, personalized to you.',
    description:
      'AI protocol generator, bloodwork interpretation, daily journal, body map. 33 peptides with verified citations.',
    images: ['/og/og-default.webp'],
  },
};

export const viewport: Viewport = {
  themeColor: '#00d4ff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-background text-foreground font-sans antialiased">
        <SessionProvider>
          {children}
          <ChatWidget />
          <ServiceWorkerRegistration />
          <ReminderScheduler />
          <AchievementToast />
        </SessionProvider>
      </body>
    </html>
  );
}
