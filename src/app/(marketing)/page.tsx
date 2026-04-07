import { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/hero-section';
import { StatsBar } from '@/components/marketing/stats-bar';
import { FeatureShowcase } from '@/components/marketing/feature-showcase';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { AtlasPreview } from '@/components/marketing/atlas-preview';
import { CTASection } from '@/components/marketing/cta-section';

export const metadata: Metadata = {
  title: 'PeptideAtlas - Interactive Peptide Education Platform',
  description:
    'Explore how peptides affect the body through our interactive visual atlas. Build stacks, compare peptides, and discover the right protocol for your goals.',
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <FeatureShowcase />
      <HowItWorks />
      <AtlasPreview />
      <CTASection />
    </>
  );
}
