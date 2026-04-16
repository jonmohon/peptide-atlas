import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ChatWidget } from '@/components/ai/chat-widget';
import { SessionProvider } from '@/components/auth/session-provider';
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
        </SessionProvider>
      </body>
    </html>
  );
}
