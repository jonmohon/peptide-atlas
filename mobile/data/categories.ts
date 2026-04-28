import type { PeptideCategory } from '@/types';

export interface CategoryInfo {
  id: PeptideCategory;
  label: string;
  description: string;
  color: string;
  icon: string;
}

export const categories: CategoryInfo[] = [
  {
    id: 'growth-hormone',
    label: 'Growth Hormone',
    description: 'Peptides that stimulate natural growth hormone production and release',
    color: '#6366f1',
    icon: '📈',
  },
  {
    id: 'healing-repair',
    label: 'Healing & Repair',
    description: 'Peptides that accelerate tissue repair, reduce inflammation, and promote recovery',
    color: '#22c55e',
    icon: '🩹',
  },
  {
    id: 'cognitive',
    label: 'Cognitive',
    description: 'Nootropic peptides that enhance memory, focus, and neuroprotection',
    color: '#8b5cf6',
    icon: '🧠',
  },
  {
    id: 'metabolic',
    label: 'Metabolic & Fat Loss',
    description: 'Peptides that optimize metabolism, promote fat oxidation, and support body composition',
    color: '#f59e0b',
    icon: '🔥',
  },
  {
    id: 'immune',
    label: 'Immune',
    description: 'Peptides that modulate and strengthen immune system function',
    color: '#06b6d4',
    icon: '🛡️',
  },
  {
    id: 'sexual-health',
    label: 'Sexual Health',
    description: 'Peptides that enhance libido, arousal, and reproductive function',
    color: '#ec4899',
    icon: '❤️',
  },
  {
    id: 'longevity',
    label: 'Longevity & Anti-Aging',
    description: 'Peptides that target cellular aging, telomere maintenance, and mitochondrial health',
    color: '#14b8a6',
    icon: '⏳',
  },
  {
    id: 'sleep-recovery',
    label: 'Sleep & Recovery',
    description: 'Peptides that improve sleep quality, circadian rhythm, and overnight recovery',
    color: '#3b82f6',
    icon: '🌙',
  },
];

export function getCategoryInfo(id: PeptideCategory): CategoryInfo | undefined {
  return categories.find((c) => c.id === id);
}
