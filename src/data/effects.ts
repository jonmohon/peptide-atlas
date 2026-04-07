import type { RegionId } from '@/types/body';

export type EffectCategory =
  | 'body-composition'
  | 'healing'
  | 'cognitive'
  | 'longevity'
  | 'sleep'
  | 'sexual'
  | 'immune';

export interface Effect {
  id: string;
  label: string;
  category: EffectCategory;
  description: string;
  primaryRegions: RegionId[];
  relatedPeptideIds: string[];
  icon: string;
}

export const effects: Effect[] = [
  // ── Body Composition ──────────────────────────────────────────────────
  {
    id: 'fat-loss',
    label: 'Fat Loss',
    category: 'body-composition',
    description:
      'Targets adipose tissue and metabolism to promote fat oxidation and reduce body fat percentage.',
    primaryRegions: ['liver', 'muscles'],
    relatedPeptideIds: [
      'aod-9604',
      'tesamorelin',
      'mots-c',
      'mk-677',
      'cjc-1295',
      'ipamorelin',
      'melanotan-ii',
    ],
    icon: '🔥',
  },
  {
    id: 'muscle-growth',
    label: 'Muscle Growth',
    category: 'body-composition',
    description:
      'Stimulates muscle protein synthesis and growth hormone release to support lean muscle development.',
    primaryRegions: ['muscles', 'bones'],
    relatedPeptideIds: [
      'cjc-1295',
      'ipamorelin',
      'sermorelin',
      'mk-677',
      'ghrp-2',
      'ghrp-6',
      'hexarelin',
    ],
    icon: '💪',
  },

  // ── Healing ───────────────────────────────────────────────────────────
  {
    id: 'healing',
    label: 'Tissue Healing',
    category: 'healing',
    description:
      'Accelerates the repair of damaged muscles, tendons, ligaments, and skin tissue.',
    primaryRegions: ['muscles', 'joints', 'skin'],
    relatedPeptideIds: ['bpc-157', 'tb-500', 'ghk-cu'],
    icon: '🩹',
  },
  {
    id: 'gut-health',
    label: 'Gut Health',
    category: 'healing',
    description:
      'Supports intestinal lining integrity, reduces gut inflammation, and promotes digestive healing.',
    primaryRegions: ['gut'],
    relatedPeptideIds: ['bpc-157', 'kpv', 'll-37', 'vip'],
    icon: '🫄',
  },
  {
    id: 'joint-repair',
    label: 'Joint Repair',
    category: 'healing',
    description:
      'Promotes cartilage regeneration and reduces joint inflammation for improved mobility.',
    primaryRegions: ['joints'],
    relatedPeptideIds: ['bpc-157', 'tb-500', 'ghk-cu'],
    icon: '🦴',
  },
  {
    id: 'wound-healing',
    label: 'Wound Healing',
    category: 'healing',
    description:
      'Enhances skin wound closure, reduces scarring, and accelerates dermal tissue repair.',
    primaryRegions: ['skin'],
    relatedPeptideIds: ['bpc-157', 'tb-500', 'ghk-cu', 'll-37'],
    icon: '🩺',
  },
  {
    id: 'anti-inflammatory',
    label: 'Anti-Inflammatory',
    category: 'healing',
    description:
      'Reduces systemic and localized inflammation through multiple immune-modulating pathways.',
    primaryRegions: ['immune-system', 'gut', 'joints'],
    relatedPeptideIds: ['bpc-157', 'kpv', 'vip', 'ghk-cu', 'tb-500'],
    icon: '🛡️',
  },

  // ── Cognitive ─────────────────────────────────────────────────────────
  {
    id: 'cognition',
    label: 'Cognitive Enhancement',
    category: 'cognitive',
    description:
      'Broadly improves cognitive function including processing speed, mental clarity, and brain-derived neurotrophic factor levels.',
    primaryRegions: ['brain'],
    relatedPeptideIds: [
      'semax',
      'selank',
      'dihexa',
      'na-semax',
      'na-selank',
      'cerebrolysin',
    ],
    icon: '🧠',
  },
  {
    id: 'focus',
    label: 'Focus & Attention',
    category: 'cognitive',
    description:
      'Enhances sustained attention, concentration, and executive function for improved productivity.',
    primaryRegions: ['brain'],
    relatedPeptideIds: ['semax', 'na-semax', 'dihexa', 'cerebrolysin'],
    icon: '🎯',
  },
  {
    id: 'memory',
    label: 'Memory Enhancement',
    category: 'cognitive',
    description:
      'Supports short-term and long-term memory formation, recall, and consolidation.',
    primaryRegions: ['brain'],
    relatedPeptideIds: [
      'semax',
      'selank',
      'dihexa',
      'cerebrolysin',
      'na-semax',
      'na-selank',
    ],
    icon: '📚',
  },
  {
    id: 'neuroprotection',
    label: 'Neuroprotection',
    category: 'cognitive',
    description:
      'Protects neurons from oxidative stress, excitotoxicity, and neurodegeneration.',
    primaryRegions: ['brain'],
    relatedPeptideIds: [
      'semax',
      'selank',
      'cerebrolysin',
      'ss-31',
      'bpc-157',
    ],
    icon: '🔒',
  },
  {
    id: 'mood',
    label: 'Mood & Anxiety',
    category: 'cognitive',
    description:
      'Modulates serotonin, dopamine, and GABA pathways to improve mood stability and reduce anxiety.',
    primaryRegions: ['brain'],
    relatedPeptideIds: ['selank', 'na-selank', 'oxytocin'],
    icon: '😊',
  },
  {
    id: 'anxiolytic',
    label: 'Anti-Anxiety',
    category: 'cognitive',
    description:
      'Provides anxiolytic effects by modulating GABA and enkephalin systems without sedation.',
    primaryRegions: ['brain'],
    relatedPeptideIds: ['selank', 'na-selank'],
    icon: '🧘',
  },

  // ── Longevity ─────────────────────────────────────────────────────────
  {
    id: 'anti-aging',
    label: 'Anti-Aging',
    category: 'longevity',
    description:
      'Combats biological aging through telomere maintenance, antioxidant defense, and cellular repair mechanisms.',
    primaryRegions: ['skin', 'immune-system', 'pituitary'],
    relatedPeptideIds: [
      'epithalon',
      'ghk-cu',
      'mots-c',
      'ss-31',
      'cjc-1295',
      'ipamorelin',
    ],
    icon: '⏳',
  },
  {
    id: 'skin-rejuvenation',
    label: 'Skin Rejuvenation',
    category: 'longevity',
    description:
      'Stimulates collagen synthesis, improves skin elasticity, and reduces visible signs of aging.',
    primaryRegions: ['skin'],
    relatedPeptideIds: ['ghk-cu', 'epithalon', 'cjc-1295', 'ipamorelin'],
    icon: '✨',
  },
  {
    id: 'hair-growth',
    label: 'Hair Growth',
    category: 'longevity',
    description:
      'Promotes hair follicle stem cell activity and improves scalp blood flow to support hair regrowth.',
    primaryRegions: ['skin'],
    relatedPeptideIds: ['ghk-cu', 'tb-500'],
    icon: '💇',
  },
  {
    id: 'telomere',
    label: 'Telomere Support',
    category: 'longevity',
    description:
      'Activates telomerase to maintain telomere length, a key biomarker of cellular aging.',
    primaryRegions: ['immune-system'],
    relatedPeptideIds: ['epithalon'],
    icon: '🧬',
  },
  {
    id: 'mitochondrial',
    label: 'Mitochondrial Health',
    category: 'longevity',
    description:
      'Protects and restores mitochondrial function, improving cellular energy production and reducing oxidative damage.',
    primaryRegions: ['heart', 'muscles'],
    relatedPeptideIds: ['ss-31', 'mots-c'],
    icon: '⚡',
  },

  // ── Sleep ─────────────────────────────────────────────────────────────
  {
    id: 'sleep',
    label: 'Sleep Quality',
    category: 'sleep',
    description:
      'Improves sleep onset, deep sleep duration, and overall sleep architecture for restorative rest.',
    primaryRegions: ['brain', 'pituitary'],
    relatedPeptideIds: [
      'dsip',
      'cjc-1295',
      'ipamorelin',
      'mk-677',
      'epithalon',
    ],
    icon: '😴',
  },
  {
    id: 'recovery',
    label: 'Recovery',
    category: 'sleep',
    description:
      'Accelerates post-exercise recovery through growth hormone optimization and tissue repair.',
    primaryRegions: ['muscles', 'joints'],
    relatedPeptideIds: [
      'bpc-157',
      'tb-500',
      'cjc-1295',
      'ipamorelin',
      'mk-677',
    ],
    icon: '🔄',
  },

  // ── Sexual ────────────────────────────────────────────────────────────
  {
    id: 'sexual-function',
    label: 'Sexual Function',
    category: 'sexual',
    description:
      'Enhances sexual arousal, performance, and satisfaction through central nervous system activation.',
    primaryRegions: ['reproductive', 'brain'],
    relatedPeptideIds: [
      'pt-141',
      'melanotan-ii',
      'oxytocin',
      'kisspeptin-10',
    ],
    icon: '❤️',
  },
  {
    id: 'libido',
    label: 'Libido Enhancement',
    category: 'sexual',
    description:
      'Increases sexual desire and drive by activating melanocortin and hypothalamic pathways.',
    primaryRegions: ['brain', 'reproductive'],
    relatedPeptideIds: ['pt-141', 'melanotan-ii', 'kisspeptin-10'],
    icon: '🔥',
  },
  {
    id: 'hormonal-balance',
    label: 'Hormonal Balance',
    category: 'sexual',
    description:
      'Supports healthy hormone levels including LH, FSH, and GnRH for reproductive and metabolic health.',
    primaryRegions: ['pituitary', 'reproductive'],
    relatedPeptideIds: ['kisspeptin-10', 'cjc-1295', 'ipamorelin'],
    icon: '⚖️',
  },

  // ── Immune ────────────────────────────────────────────────────────────
  {
    id: 'immune-boost',
    label: 'Immune Enhancement',
    category: 'immune',
    description:
      'Strengthens innate and adaptive immune responses by modulating T-cell activity and cytokine production.',
    primaryRegions: ['immune-system'],
    relatedPeptideIds: ['thymosin-alpha-1', 'll-37', 'kpv', 'selank'],
    icon: '🛡️',
  },
  {
    id: 'antimicrobial',
    label: 'Antimicrobial',
    category: 'immune',
    description:
      'Provides direct antimicrobial activity against bacteria, viruses, and fungi through membrane disruption and immune activation.',
    primaryRegions: ['immune-system', 'gut'],
    relatedPeptideIds: ['ll-37', 'kpv', 'thymosin-alpha-1'],
    icon: '🦠',
  },
];

export function getEffectById(id: string): Effect | undefined {
  return effects.find((effect) => effect.id === id);
}
