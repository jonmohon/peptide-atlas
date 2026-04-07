import type { Metadata } from 'next';
import { glossaryTerms } from '@/data/glossary';
import { GlossaryClient } from './glossary-client';

export const metadata: Metadata = {
  title: 'Glossary | PeptideAtlas',
  description:
    'A comprehensive glossary of peptide terminology, from amino acids to stacking protocols.',
};

export default function GlossaryPage() {
  return <GlossaryClient terms={glossaryTerms} />;
}
