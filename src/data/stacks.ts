import type { Stack } from '@/types';

export const stacks: Stack[] = [
  // 1. Healing Stack
  {
    id: 'healing',
    name: 'Ultimate Healing Stack',
    slug: 'ultimate-healing-stack',
    goal: 'Maximize tissue repair and recovery',
    description:
      'A comprehensive healing protocol combining the most potent tissue-repair peptides. BPC-157 drives systemic healing through angiogenesis and growth factor modulation, TB-500 promotes cellular migration to injury sites, and GHK-Cu stimulates collagen remodeling and antioxidant defenses.',
    peptides: [
      {
        peptideId: 'bpc-157',
        role: 'primary',
        notes: 'Core healing agent — promotes angiogenesis, modulates growth factors, and protects the GI tract.',
      },
      {
        peptideId: 'tb-500',
        role: 'synergist',
        notes: 'Enhances cell migration to injury sites and reduces inflammation systemically.',
      },
      {
        peptideId: 'ghk-cu',
        role: 'support',
        notes: 'Stimulates collagen synthesis, tissue remodeling, and antioxidant enzyme production.',
      },
    ],
    combinedEffects: [
      'healing',
      'joint-repair',
      'wound-healing',
      'anti-inflammatory',
    ],
    highlightedRegions: [
      { regionId: 'joints', intensity: 5 },
      { regionId: 'muscles', intensity: 4 },
      { regionId: 'skin', intensity: 3 },
      { regionId: 'gut', intensity: 3 },
    ],
    icon: '🩹',
  },

  // 2. Anti-Aging Stack
  {
    id: 'anti-aging',
    name: 'Longevity Protocol',
    slug: 'longevity-protocol',
    goal: 'Slow biological aging and promote cellular vitality',
    description:
      'A multi-pathway longevity stack targeting the hallmarks of aging. Epithalon reactivates telomerase to maintain chromosome integrity, GHK-Cu remodels aged tissue and resets gene expression toward a youthful profile, MOTS-c optimizes metabolic function, and SS-31 rescues declining mitochondria.',
    peptides: [
      {
        peptideId: 'epithalon',
        role: 'primary',
        notes: 'Activates telomerase to maintain telomere length, the master clock of cellular aging.',
      },
      {
        peptideId: 'ghk-cu',
        role: 'synergist',
        notes: 'Resets gene expression toward a youthful profile and stimulates collagen remodeling.',
      },
      {
        peptideId: 'mots-c',
        role: 'support',
        notes: 'Mitochondria-derived peptide that optimizes metabolic function and insulin sensitivity.',
      },
      {
        peptideId: 'ss-31',
        role: 'support',
        notes: 'Targets the inner mitochondrial membrane to restore energy production and reduce oxidative stress.',
      },
    ],
    combinedEffects: [
      'anti-aging',
      'telomere',
      'mitochondrial',
      'skin-rejuvenation',
    ],
    highlightedRegions: [
      { regionId: 'skin', intensity: 4 },
      { regionId: 'immune-system', intensity: 3 },
      { regionId: 'heart', intensity: 3 },
      { regionId: 'muscles', intensity: 3 },
    ],
    icon: '⏳',
  },

  // 3. Cognitive Stack
  {
    id: 'cognitive',
    name: 'Cognitive Enhancement Stack',
    slug: 'cognitive-enhancement-stack',
    goal: 'Enhance mental performance, memory, and neuroprotection',
    description:
      'A nootropic peptide stack designed for peak cognitive function. Semax boosts BDNF and enhances focus, Selank provides anxiolytic support while improving memory consolidation, and Dihexa — one of the most potent nootropic peptides known — dramatically amplifies synaptic connections.',
    peptides: [
      {
        peptideId: 'semax',
        role: 'primary',
        notes: 'Increases BDNF expression, enhances attention, and provides neuroprotective effects.',
      },
      {
        peptideId: 'selank',
        role: 'synergist',
        notes: 'Reduces anxiety via GABA modulation while improving memory and immune function.',
      },
      {
        peptideId: 'dihexa',
        role: 'support',
        notes: 'Potent angiotensin IV analog that dramatically enhances synaptic connectivity and memory.',
      },
    ],
    combinedEffects: [
      'cognition',
      'focus',
      'memory',
      'neuroprotection',
      'mood',
      'anxiolytic',
    ],
    highlightedRegions: [
      { regionId: 'brain', intensity: 5 },
    ],
    icon: '🧠',
  },

  // 4. Fat Loss Stack
  {
    id: 'fat-loss',
    name: 'Fat Loss Stack',
    slug: 'fat-loss-stack',
    goal: 'Accelerate fat metabolism and improve body composition',
    description:
      'A targeted fat-loss protocol that attacks adipose tissue from multiple angles. AOD-9604 directly stimulates lipolysis without affecting blood sugar, Tesamorelin reduces visceral fat through growth hormone release, and the CJC-1295/Ipamorelin combination amplifies natural GH pulsatility for sustained metabolic benefits.',
    peptides: [
      {
        peptideId: 'aod-9604',
        role: 'primary',
        notes: 'Modified GH fragment that directly stimulates lipolysis and inhibits lipogenesis.',
      },
      {
        peptideId: 'tesamorelin',
        role: 'synergist',
        notes: 'GHRH analog FDA-approved for visceral fat reduction; stimulates pulsatile GH release.',
      },
      {
        peptideId: 'cjc-1295',
        role: 'support',
        notes: 'Long-acting GHRH analog that sustains elevated GH levels for enhanced fat metabolism.',
      },
      {
        peptideId: 'ipamorelin',
        role: 'support',
        notes: 'Selective ghrelin receptor agonist that amplifies GH pulses without cortisol or prolactin spikes.',
      },
    ],
    combinedEffects: ['fat-loss', 'muscle-growth', 'recovery'],
    highlightedRegions: [
      { regionId: 'liver', intensity: 4 },
      { regionId: 'muscles', intensity: 3 },
      { regionId: 'pituitary', intensity: 3 },
    ],
    icon: '🔥',
  },

  // 5. GH Optimization Stack
  {
    id: 'gh-optimization',
    name: 'GH Optimization Stack',
    slug: 'gh-optimization-stack',
    goal: 'Maximize natural growth hormone production',
    description:
      'The gold-standard growth hormone secretagogue combination. CJC-1295 provides sustained GHRH signaling while Ipamorelin delivers clean, selective GH pulses. Together they synergistically amplify the natural GH axis without desensitization, supporting muscle growth, fat loss, sleep quality, and tissue repair.',
    peptides: [
      {
        peptideId: 'cjc-1295',
        role: 'primary',
        notes: 'Long-acting GHRH analog — provides sustained baseline GH elevation via pituitary stimulation.',
      },
      {
        peptideId: 'ipamorelin',
        role: 'synergist',
        notes: 'Selective GHSR agonist — amplifies GH pulse amplitude without cortisol or prolactin side effects.',
      },
    ],
    combinedEffects: [
      'muscle-growth',
      'fat-loss',
      'sleep',
      'recovery',
      'anti-aging',
      'skin-rejuvenation',
    ],
    highlightedRegions: [
      { regionId: 'pituitary', intensity: 5 },
      { regionId: 'muscles', intensity: 4 },
      { regionId: 'skin', intensity: 3 },
      { regionId: 'bones', intensity: 3 },
    ],
    icon: '📈',
  },

  // 6. Immune Boost Stack
  {
    id: 'immune-boost',
    name: 'Immune Restoration Stack',
    slug: 'immune-restoration-stack',
    goal: 'Strengthen immune defenses and fight infections',
    description:
      'A potent immune-restoration protocol for compromised or aging immune systems. Thymosin Alpha-1 rebalances T-cell subsets and enhances dendritic cell function, LL-37 provides broad-spectrum antimicrobial activity, and KPV suppresses inflammatory cytokines while supporting mucosal immunity.',
    peptides: [
      {
        peptideId: 'thymosin-alpha-1',
        role: 'primary',
        notes: 'Thymic peptide that modulates T-cell maturation, NK cell activity, and dendritic cell function.',
      },
      {
        peptideId: 'll-37',
        role: 'synergist',
        notes: 'Human cathelicidin with direct antimicrobial activity against bacteria, viruses, and fungi.',
      },
      {
        peptideId: 'kpv',
        role: 'support',
        notes: 'Alpha-MSH fragment with potent anti-inflammatory effects; suppresses NF-kB signaling.',
      },
    ],
    combinedEffects: ['immune-boost', 'antimicrobial', 'anti-inflammatory'],
    highlightedRegions: [
      { regionId: 'immune-system', intensity: 5 },
      { regionId: 'gut', intensity: 3 },
    ],
    icon: '🛡️',
  },

  // 7. Gut Healing Stack
  {
    id: 'gut-healing',
    name: 'Gut Healing Stack',
    slug: 'gut-healing-stack',
    goal: 'Restore intestinal integrity and reduce gut inflammation',
    description:
      'A gut-focused healing protocol for leaky gut, IBS, and inflammatory bowel conditions. BPC-157 is the cornerstone — it repairs intestinal mucosa, restores the gut-brain axis, and counteracts NSAID damage. KPV calms mucosal inflammation via NF-kB suppression, and LL-37 provides antimicrobial defense against dysbiotic bacteria.',
    peptides: [
      {
        peptideId: 'bpc-157',
        role: 'primary',
        notes: 'Gastric pentadecapeptide that repairs intestinal mucosa and restores the gut-brain axis.',
      },
      {
        peptideId: 'kpv',
        role: 'synergist',
        notes: 'Calms gut mucosal inflammation by suppressing NF-kB and pro-inflammatory cytokines.',
      },
      {
        peptideId: 'll-37',
        role: 'support',
        notes: 'Antimicrobial peptide that addresses dysbiosis and supports mucosal immune defenses.',
      },
    ],
    combinedEffects: [
      'gut-health',
      'healing',
      'anti-inflammatory',
      'antimicrobial',
    ],
    highlightedRegions: [
      { regionId: 'gut', intensity: 5 },
      { regionId: 'immune-system', intensity: 3 },
    ],
    icon: '🫄',
  },

  // 8. Sleep & Recovery Stack
  {
    id: 'sleep-recovery',
    name: 'Sleep & Recovery Stack',
    slug: 'sleep-recovery-stack',
    goal: 'Optimize sleep quality and overnight recovery',
    description:
      'A sleep-focused stack that transforms rest into a recovery powerhouse. DSIP induces natural delta-wave sleep, CJC-1295 and Ipamorelin maximize the nocturnal GH surge that drives overnight tissue repair, and Epithalon helps restore circadian rhythm regulation through pineal gland support.',
    peptides: [
      {
        peptideId: 'dsip',
        role: 'primary',
        notes: 'Delta sleep-inducing peptide — promotes deep, restorative delta-wave sleep patterns.',
      },
      {
        peptideId: 'cjc-1295',
        role: 'synergist',
        notes: 'Amplifies the natural nocturnal GH surge for enhanced overnight tissue repair.',
      },
      {
        peptideId: 'ipamorelin',
        role: 'synergist',
        notes: 'Pairs with CJC-1295 to maximize GH pulse amplitude during deep sleep phases.',
      },
      {
        peptideId: 'epithalon',
        role: 'support',
        notes: 'Supports pineal gland function and melatonin production for circadian rhythm regulation.',
      },
    ],
    combinedEffects: ['sleep', 'recovery', 'anti-aging', 'muscle-growth'],
    highlightedRegions: [
      { regionId: 'brain', intensity: 4 },
      { regionId: 'pituitary', intensity: 4 },
      { regionId: 'muscles', intensity: 3 },
    ],
    icon: '😴',
  },

  // 9. Sexual Health Stack
  {
    id: 'sexual-health',
    name: 'Sexual Health Stack',
    slug: 'sexual-health-stack',
    goal: 'Enhance sexual function, desire, and hormonal balance',
    description:
      'A comprehensive sexual wellness protocol targeting both central and peripheral pathways. PT-141 activates melanocortin receptors in the brain to stimulate arousal independent of hormones, Oxytocin enhances bonding and orgasm intensity, and Kisspeptin-10 naturally stimulates the GnRH axis for hormonal optimization.',
    peptides: [
      {
        peptideId: 'pt-141',
        role: 'primary',
        notes: 'Melanocortin receptor agonist that stimulates sexual arousal through central nervous system activation.',
      },
      {
        peptideId: 'oxytocin',
        role: 'synergist',
        notes: 'Enhances emotional bonding, sexual satisfaction, and orgasm intensity.',
      },
      {
        peptideId: 'kisspeptin-10',
        role: 'support',
        notes: 'Stimulates GnRH release to naturally optimize LH, FSH, and downstream sex hormones.',
      },
    ],
    combinedEffects: [
      'sexual-function',
      'libido',
      'hormonal-balance',
      'mood',
    ],
    highlightedRegions: [
      { regionId: 'brain', intensity: 4 },
      { regionId: 'reproductive', intensity: 5 },
    ],
    icon: '❤️',
  },

  // 10. Athletic Performance Stack
  {
    id: 'athletic-performance',
    name: 'Athletic Performance Stack',
    slug: 'athletic-performance-stack',
    goal: 'Maximize athletic output, recovery, and injury resilience',
    description:
      'An athlete-focused protocol for peak performance and injury prevention. BPC-157 provides systemic tissue protection and accelerates repair, the CJC-1295/Ipamorelin duo optimizes growth hormone for muscle development and recovery, and TB-500 keeps connective tissue resilient under heavy training loads.',
    peptides: [
      {
        peptideId: 'bpc-157',
        role: 'primary',
        notes: 'Systemic healing agent — protects tendons, ligaments, and muscles from training-induced damage.',
      },
      {
        peptideId: 'cjc-1295',
        role: 'synergist',
        notes: 'Sustains elevated GH for muscle recovery, collagen synthesis, and performance adaptation.',
      },
      {
        peptideId: 'ipamorelin',
        role: 'synergist',
        notes: 'Clean GH secretagogue that amplifies recovery without unwanted hormonal side effects.',
      },
      {
        peptideId: 'tb-500',
        role: 'support',
        notes: 'Promotes flexibility, reduces inflammation, and supports connective tissue resilience.',
      },
    ],
    combinedEffects: [
      'recovery',
      'muscle-growth',
      'healing',
      'joint-repair',
      'sleep',
    ],
    highlightedRegions: [
      { regionId: 'muscles', intensity: 5 },
      { regionId: 'joints', intensity: 4 },
      { regionId: 'pituitary', intensity: 3 },
      { regionId: 'bones', intensity: 3 },
    ],
    icon: '🏋️',
  },
];

export function getStackById(id: string): Stack | undefined {
  return stacks.find((stack) => stack.id === id);
}
