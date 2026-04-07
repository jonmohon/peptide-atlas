import type { BodyRegion } from '@/types';

// Positions mapped to viewBox 0 0 100 210
// Body polygons center around x=50, head y≈10, feet y≈200
export const bodyRegions: BodyRegion[] = [
  {
    id: 'brain',
    label: 'Brain & CNS',
    svgGroupId: 'region-brain',
    description: 'Central nervous system including cerebral cortex, hippocampus, and neural networks',
    position: { x: 50, y: 10 },
    relatedEffects: ['cognition', 'neuroprotection', 'mood', 'focus', 'memory'],
  },
  {
    id: 'pituitary',
    label: 'Pituitary Gland',
    svgGroupId: 'region-pituitary',
    description: 'Master endocrine gland controlling growth hormone, thyroid, and reproductive hormones',
    position: { x: 50, y: 22 },
    relatedEffects: ['growth-hormone', 'hormonal-balance', 'anti-aging'],
  },
  {
    id: 'heart',
    label: 'Heart & Cardiovascular',
    svgGroupId: 'region-heart',
    description: 'Cardiovascular system including heart muscle, blood vessels, and circulation',
    position: { x: 55, y: 50 },
    relatedEffects: ['cardioprotection', 'blood-flow', 'endurance'],
  },
  {
    id: 'lungs',
    label: 'Lungs & Respiratory',
    svgGroupId: 'region-lungs',
    description: 'Respiratory system including lung tissue and airways',
    position: { x: 38, y: 50 },
    relatedEffects: ['respiratory-health', 'endurance', 'anti-inflammatory'],
  },
  {
    id: 'liver',
    label: 'Liver',
    svgGroupId: 'region-liver',
    description: 'Primary metabolic organ handling detoxification, lipid metabolism, and protein synthesis',
    position: { x: 40, y: 68 },
    relatedEffects: ['detoxification', 'fat-metabolism', 'liver-protection'],
  },
  {
    id: 'gut',
    label: 'Gut & GI Tract',
    svgGroupId: 'region-gut',
    description: 'Gastrointestinal system including stomach, intestines, and gut microbiome',
    position: { x: 50, y: 88 },
    relatedEffects: ['gut-healing', 'anti-inflammatory', 'digestion', 'gut-health'],
  },
  {
    id: 'kidneys',
    label: 'Kidneys',
    svgGroupId: 'region-kidneys',
    description: 'Renal system handling filtration, electrolyte balance, and blood pressure regulation',
    position: { x: 62, y: 76 },
    relatedEffects: ['kidney-protection', 'detoxification'],
  },
  {
    id: 'muscles',
    label: 'Muscles',
    svgGroupId: 'region-muscles',
    description: 'Skeletal muscle tissue throughout the body for strength, movement, and metabolism',
    position: { x: 20, y: 58 },
    relatedEffects: ['muscle-growth', 'recovery', 'strength', 'endurance'],
  },
  {
    id: 'joints',
    label: 'Joints & Tendons',
    svgGroupId: 'region-joints',
    description: 'Connective tissue including joints, tendons, ligaments, and cartilage',
    position: { x: 80, y: 58 },
    relatedEffects: ['joint-repair', 'healing', 'flexibility', 'anti-inflammatory'],
  },
  {
    id: 'skin',
    label: 'Skin & Hair',
    svgGroupId: 'region-skin',
    description: 'Integumentary system including skin tissue, collagen, elastin, and hair follicles',
    position: { x: 80, y: 42 },
    relatedEffects: ['skin-rejuvenation', 'collagen', 'hair-growth', 'wound-healing'],
  },
  {
    id: 'bones',
    label: 'Skeletal System',
    svgGroupId: 'region-bones',
    description: 'Bone tissue and skeletal structure including bone density and mineralization',
    position: { x: 50, y: 130 },
    relatedEffects: ['bone-density', 'healing', 'growth'],
  },
  {
    id: 'reproductive',
    label: 'Reproductive System',
    svgGroupId: 'region-reproductive',
    description: 'Reproductive organs and hormonal pathways governing sexual function and fertility',
    position: { x: 50, y: 106 },
    relatedEffects: ['libido', 'sexual-function', 'fertility', 'hormonal-balance'],
  },
  {
    id: 'immune-system',
    label: 'Immune System',
    svgGroupId: 'region-immune-system',
    description: 'Immune cells, thymus, lymph nodes, and immune signaling pathways throughout the body',
    position: { x: 38, y: 36 },
    relatedEffects: ['immune-boost', 'antimicrobial', 'anti-inflammatory', 'immune-modulation'],
  },
];

export function getBodyRegion(id: string): BodyRegion | undefined {
  return bodyRegions.find((r) => r.id === id);
}
