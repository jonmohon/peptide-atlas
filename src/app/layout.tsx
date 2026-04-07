import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ChatWidget } from '@/components/ai/chat-widget';
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
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
