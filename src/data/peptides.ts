import type { Peptide } from '@/types';
import type { RegionId } from '@/types/body';

export const peptides: Peptide[] = [
  // ─── 1. BPC-157 ─────────────────────────────────────────────
  {
    id: 'bpc-157',
    slug: 'bpc-157',
    name: 'BPC-157',
    abbreviation: 'BPC',
    fullName: 'Body Protection Compound-157',
    category: 'healing-repair',
    description:
      'A pentadecapeptide derived from human gastric juice that accelerates healing of tendons, ligaments, muscles, and the GI tract. BPC-157 is one of the most widely studied healing peptides with robust preclinical evidence for systemic tissue repair.',
    effects: [
      'healing',
      'gut-health',
      'anti-inflammatory',
      'tissue-repair',
      'joint-repair',
      'wound-healing',
      'cardioprotection',
    ],
    affectedRegions: [
      { regionId: 'gut' as RegionId, intensity: 5, description: 'Heals gastric ulcers, repairs intestinal lining, and restores gut mucosal integrity' },
      { regionId: 'muscles' as RegionId, intensity: 4, description: 'Accelerates muscle fiber repair and recovery from injury' },
      { regionId: 'joints' as RegionId, intensity: 5, description: 'Promotes tendon and ligament healing by upregulating growth factor receptors' },
      { regionId: 'skin' as RegionId, intensity: 3, description: 'Enhances wound closure and skin tissue regeneration' },
      { regionId: 'heart' as RegionId, intensity: 2, description: 'Exhibits cardioprotective effects and supports vascular repair' },
    ],
    commonStacks: ['healing', 'gut-healing', 'athletic-performance'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '250–500 mcg',
      frequency: '1–2x daily',
      cycleLength: '4–8 weeks',
      notes: 'Inject near injury site for localized effect. Oral administration available for GI-specific targets.',
    },
    timeline: [
      { label: 'Initial Response', weekStart: 1, weekEnd: 2, description: 'Reduced pain and inflammation at injury site; early gut symptom relief' },
      { label: 'Active Repair', weekStart: 3, weekEnd: 6, description: 'Measurable tissue healing, improved mobility, and continued GI restoration' },
      { label: 'Consolidation', weekStart: 7, weekEnd: 8, description: 'Structural remodeling of healed tissue with lasting benefits' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 9, evidence: 7, easeOfUse: 7, cost: 7, safety: 9, popularity: 10 },
    sideEffects: ['Mild nausea (rare)', 'Injection site redness', 'Dizziness (uncommon)'],
    contraindications: ['Active cancer (theoretical concern with growth factors)', 'Pregnancy and breastfeeding'],
  },

  // ─── 2. TB-500 ──────────────────────────────────────────────
  {
    id: 'tb-500',
    slug: 'tb-500',
    name: 'TB-500',
    abbreviation: 'TB5',
    fullName: 'Thymosin Beta-4 Fragment',
    category: 'healing-repair',
    description:
      'A synthetic fraction of Thymosin Beta-4 that promotes cell migration, blood vessel formation, and tissue repair. TB-500 is widely used for injury recovery, particularly for soft tissue and muscle damage.',
    effects: [
      'healing',
      'tissue-repair',
      'anti-inflammatory',
      'wound-healing',
      'flexibility',
      'cardioprotection',
      'muscle-growth',
    ],
    affectedRegions: [
      { regionId: 'muscles' as RegionId, intensity: 5, description: 'Upregulates actin, improving cell migration and muscle repair' },
      { regionId: 'joints' as RegionId, intensity: 4, description: 'Supports connective tissue healing and reduces joint inflammation' },
      { regionId: 'heart' as RegionId, intensity: 3, description: 'Promotes cardiac tissue repair and angiogenesis after injury' },
      { regionId: 'skin' as RegionId, intensity: 3, description: 'Accelerates dermal wound healing and reduces scarring' },
      { regionId: 'immune-system' as RegionId, intensity: 2, description: 'Modulates inflammatory response and supports immune regulation' },
    ],
    commonStacks: ['healing', 'athletic-performance'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '2–5 mg',
      frequency: '2x per week',
      cycleLength: '4–6 weeks',
      notes: 'Loading phase of 4–6 weeks followed by monthly maintenance injections if needed.',
    },
    timeline: [
      { label: 'Loading Phase', weekStart: 1, weekEnd: 3, description: 'Reduced inflammation and early signs of tissue mobilization' },
      { label: 'Repair Phase', weekStart: 4, weekEnd: 6, description: 'Active tissue regeneration, improved range of motion, reduced pain' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 8, evidence: 6, easeOfUse: 6, cost: 6, safety: 8, popularity: 9 },
    sideEffects: ['Head rush', 'Lethargy (temporary)', 'Injection site irritation'],
    contraindications: ['Active cancer', 'Pregnancy'],
  },

  // ─── 3. GHK-Cu ──────────────────────────────────────────────
  {
    id: 'ghk-cu',
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    abbreviation: 'GHK',
    fullName: 'Glycyl-L-Histidyl-L-Lysine Copper Complex',
    category: 'healing-repair',
    description:
      'A naturally occurring copper peptide that declines with age and plays a key role in tissue remodeling, collagen synthesis, and anti-aging. GHK-Cu is used both topically for skin rejuvenation and systemically for wound healing.',
    effects: [
      'skin-rejuvenation',
      'anti-aging',
      'collagen',
      'wound-healing',
      'hair-growth',
      'anti-inflammatory',
      'tissue-repair',
    ],
    affectedRegions: [
      { regionId: 'skin' as RegionId, intensity: 5, description: 'Stimulates collagen and elastin synthesis, tightens skin, reduces wrinkles' },
      { regionId: 'bones' as RegionId, intensity: 2, description: 'Supports bone tissue remodeling and density maintenance' },
      { regionId: 'muscles' as RegionId, intensity: 2, description: 'Aids in muscle tissue repair and reduces fibrosis' },
      { regionId: 'immune-system' as RegionId, intensity: 2, description: 'Anti-inflammatory and antioxidant effects modulate immune activity' },
    ],
    commonStacks: ['anti-aging', 'healing'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '1–2 mg',
      frequency: 'Daily',
      cycleLength: '4–12 weeks',
      notes: 'Also available as topical cream or serum for localized skin benefits.',
    },
    timeline: [
      { label: 'Early Effects', weekStart: 1, weekEnd: 4, description: 'Improved skin texture and tone; accelerated wound closure' },
      { label: 'Collagen Remodeling', weekStart: 5, weekEnd: 12, description: 'Visible reduction in fine lines, improved skin elasticity, and hair quality' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 7, evidence: 7, easeOfUse: 8, cost: 7, safety: 9, popularity: 8 },
    sideEffects: ['Skin irritation (topical)', 'Mild redness at injection site'],
    contraindications: ['Copper sensitivity or Wilson disease'],
  },

  // ─── 4. CJC-1295 ────────────────────────────────────────────
  {
    id: 'cjc-1295',
    slug: 'cjc-1295',
    name: 'CJC-1295',
    abbreviation: 'CJC',
    fullName: 'CJC-1295 (with or without DAC)',
    category: 'growth-hormone',
    description:
      'A synthetic growth hormone-releasing hormone (GHRH) analog that increases GH and IGF-1 levels with a prolonged half-life. CJC-1295 is one of the most popular peptides for body composition, recovery, and anti-aging.',
    effects: [
      'muscle-growth',
      'fat-loss',
      'sleep',
      'recovery',
      'anti-aging',
      'bone-density',
      'skin-rejuvenation',
    ],
    affectedRegions: [
      { regionId: 'pituitary' as RegionId, intensity: 5, description: 'Stimulates pulsatile GH release from the anterior pituitary' },
      { regionId: 'muscles' as RegionId, intensity: 4, description: 'Promotes lean muscle growth through elevated IGF-1' },
      { regionId: 'bones' as RegionId, intensity: 3, description: 'Supports bone density and skeletal integrity' },
      { regionId: 'skin' as RegionId, intensity: 3, description: 'Improves skin thickness, elasticity, and collagen turnover' },
      { regionId: 'liver' as RegionId, intensity: 3, description: 'Stimulates hepatic IGF-1 production' },
    ],
    commonStacks: ['gh-optimization', 'anti-aging', 'fat-loss', 'athletic-performance'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '100–300 mcg (no DAC) / 2 mg (with DAC)',
      frequency: 'Daily (no DAC) or 2x weekly (with DAC)',
      cycleLength: '8–12 weeks',
      notes: 'Best administered before bed or post-workout. Often stacked with Ipamorelin for synergistic GH release.',
    },
    timeline: [
      { label: 'GH Elevation', weekStart: 1, weekEnd: 3, description: 'Improved sleep quality, increased recovery, subtle fat loss' },
      { label: 'Body Composition', weekStart: 4, weekEnd: 8, description: 'Noticeable lean mass gains, reduced body fat, improved skin' },
      { label: 'Optimization', weekStart: 9, weekEnd: 12, description: 'Peak IGF-1 levels with full anti-aging and performance benefits' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 8, evidence: 7, easeOfUse: 7, cost: 6, safety: 8, popularity: 10 },
    sideEffects: ['Water retention', 'Tingling or numbness in extremities', 'Increased hunger', 'Headache'],
    contraindications: ['Active cancer', 'Diabetes (may affect glucose metabolism)', 'Pregnancy'],
  },

  // ─── 5. Ipamorelin ──────────────────────────────────────────
  {
    id: 'ipamorelin',
    slug: 'ipamorelin',
    name: 'Ipamorelin',
    abbreviation: 'IPA',
    fullName: 'Ipamorelin Acetate',
    category: 'growth-hormone',
    description:
      'A highly selective growth hormone secretagogue (GHS) that stimulates GH release without significantly affecting cortisol or prolactin. Ipamorelin is considered the cleanest GHRP due to its selectivity and favorable side-effect profile.',
    effects: [
      'muscle-growth',
      'fat-loss',
      'sleep',
      'recovery',
      'anti-aging',
      'bone-density',
    ],
    affectedRegions: [
      { regionId: 'pituitary' as RegionId, intensity: 5, description: 'Selectively stimulates GH release via ghrelin receptor agonism' },
      { regionId: 'muscles' as RegionId, intensity: 4, description: 'Supports lean mass accrual and recovery from training' },
      { regionId: 'bones' as RegionId, intensity: 3, description: 'Promotes bone mineral density through GH/IGF-1 axis' },
      { regionId: 'skin' as RegionId, intensity: 2, description: 'Indirect skin improvements via elevated GH levels' },
    ],
    commonStacks: ['gh-optimization', 'anti-aging', 'sleep-recovery', 'athletic-performance'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '200–300 mcg',
      frequency: '1–3x daily',
      cycleLength: '8–12 weeks',
      notes: 'Best administered on an empty stomach, typically before bed. Pairs synergistically with CJC-1295.',
    },
    timeline: [
      { label: 'Initial Response', weekStart: 1, weekEnd: 2, description: 'Better sleep quality and faster post-exercise recovery' },
      { label: 'GH Benefits', weekStart: 3, weekEnd: 8, description: 'Progressive fat loss, improved muscle tone, enhanced skin quality' },
      { label: 'Peak Effects', weekStart: 9, weekEnd: 12, description: 'Optimized body composition and sustained anti-aging benefits' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 8, evidence: 7, easeOfUse: 7, cost: 7, safety: 9, popularity: 10 },
    sideEffects: ['Mild headache', 'Lightheadedness post-injection', 'Transient hunger'],
    contraindications: ['Active cancer', 'Pregnancy'],
  },

  // ─── 6. Tesamorelin ─────────────────────────────────────────
  {
    id: 'tesamorelin',
    slug: 'tesamorelin',
    name: 'Tesamorelin',
    abbreviation: 'TESA',
    fullName: 'Tesamorelin Acetate (Egrifta)',
    category: 'growth-hormone',
    description:
      'An FDA-approved GHRH analog originally developed to reduce visceral adiposity in HIV-associated lipodystrophy. Tesamorelin is one of the few peptides with strong clinical trial evidence and regulatory approval.',
    effects: [
      'fat-loss',
      'muscle-growth',
      'anti-aging',
      'cognition',
      'recovery',
    ],
    affectedRegions: [
      { regionId: 'pituitary' as RegionId, intensity: 5, description: 'Potent stimulation of endogenous GH secretion via GHRH receptor' },
      { regionId: 'liver' as RegionId, intensity: 4, description: 'Reduces hepatic fat accumulation and improves liver health markers' },
      { regionId: 'muscles' as RegionId, intensity: 3, description: 'Modest lean mass increases as GH levels normalize' },
      { regionId: 'brain' as RegionId, intensity: 2, description: 'Emerging data on cognitive benefits and neuroprotective effects' },
    ],
    commonStacks: ['gh-optimization', 'fat-loss', 'anti-aging'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '2 mg',
      frequency: 'Daily',
      cycleLength: '12–26 weeks',
      notes: 'FDA-approved dosing. Inject into abdomen. Requires reconstitution with sterile water.',
    },
    timeline: [
      { label: 'GH Normalization', weekStart: 1, weekEnd: 4, description: 'IGF-1 levels rise, early metabolic improvements' },
      { label: 'Fat Reduction', weekStart: 5, weekEnd: 12, description: 'Significant reduction in visceral adipose tissue' },
      { label: 'Full Benefit', weekStart: 13, weekEnd: 26, description: 'Sustained body composition changes with continued use' },
    ],
    evidenceLevel: 'strong',
    ratings: { efficacy: 9, evidence: 9, easeOfUse: 6, cost: 4, safety: 8, popularity: 7 },
    sideEffects: ['Injection site reactions', 'Joint pain', 'Peripheral edema', 'Paresthesia'],
    contraindications: ['Active malignancy', 'Disruption of hypothalamic-pituitary axis', 'Pregnancy', 'Hypersensitivity to tesamorelin or mannitol'],
  },

  // ─── 7. Sermorelin ──────────────────────────────────────────
  {
    id: 'sermorelin',
    slug: 'sermorelin',
    name: 'Sermorelin',
    abbreviation: 'SERM',
    fullName: 'Sermorelin Acetate',
    category: 'growth-hormone',
    description:
      'A GHRH analog comprising the first 29 amino acids of endogenous GHRH. Sermorelin was one of the first peptides prescribed for GH deficiency and remains popular for its well-characterized safety profile and ability to restore natural GH pulsatility.',
    effects: [
      'muscle-growth',
      'fat-loss',
      'sleep',
      'recovery',
      'anti-aging',
      'bone-density',
    ],
    affectedRegions: [
      { regionId: 'pituitary' as RegionId, intensity: 5, description: 'Directly activates GHRH receptors on somatotroph cells to release GH' },
      { regionId: 'muscles' as RegionId, intensity: 3, description: 'Supports muscle protein synthesis via GH/IGF-1 elevation' },
      { regionId: 'bones' as RegionId, intensity: 3, description: 'Improves bone turnover markers and mineral density' },
      { regionId: 'skin' as RegionId, intensity: 2, description: 'Enhances skin hydration and collagen through GH signaling' },
    ],
    commonStacks: ['gh-optimization', 'anti-aging', 'sleep-recovery'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '200–500 mcg',
      frequency: 'Daily (before bed)',
      cycleLength: '3–6 months',
      notes: 'Best used long-term at lower doses. Administer on an empty stomach 30 minutes before sleep.',
    },
    timeline: [
      { label: 'Sleep Improvement', weekStart: 1, weekEnd: 3, description: 'Deeper sleep and improved morning energy' },
      { label: 'Body Composition', weekStart: 4, weekEnd: 12, description: 'Gradual fat loss, improved muscle tone and recovery' },
      { label: 'Sustained Benefits', weekStart: 13, weekEnd: 26, description: 'Long-term anti-aging effects and optimized GH levels' },
    ],
    evidenceLevel: 'strong',
    ratings: { efficacy: 7, evidence: 8, easeOfUse: 7, cost: 7, safety: 9, popularity: 8 },
    sideEffects: ['Facial flushing', 'Injection site pain', 'Headache', 'Dizziness'],
    contraindications: ['Active malignancy', 'Pregnancy', 'Hypersensitivity to sermorelin'],
  },

  // ─── 8. GHRP-2 ──────────────────────────────────────────────
  {
    id: 'ghrp-2',
    slug: 'ghrp-2',
    name: 'GHRP-2',
    abbreviation: 'GH2',
    fullName: 'Growth Hormone Releasing Peptide-2',
    category: 'growth-hormone',
    description:
      'A potent synthetic ghrelin mimetic that stimulates robust GH release from the pituitary. GHRP-2 produces stronger GH pulses than Ipamorelin but with slightly more side effects including increased appetite and cortisol elevation.',
    effects: [
      'muscle-growth',
      'fat-loss',
      'appetite',
      'recovery',
      'sleep',
      'anti-aging',
    ],
    affectedRegions: [
      { regionId: 'pituitary' as RegionId, intensity: 5, description: 'Strong activation of ghrelin receptors driving large GH pulses' },
      { regionId: 'muscles' as RegionId, intensity: 4, description: 'Significant anabolic effect via elevated GH and IGF-1' },
      { regionId: 'gut' as RegionId, intensity: 3, description: 'Increases appetite through ghrelin receptor stimulation in the gut' },
      { regionId: 'bones' as RegionId, intensity: 2, description: 'Supports bone health via GH-mediated pathways' },
    ],
    commonStacks: ['gh-optimization', 'athletic-performance'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '100–300 mcg',
      frequency: '2–3x daily',
      cycleLength: '8–12 weeks',
      notes: 'Administer on an empty stomach. Strongest GH release when combined with a GHRH analog.',
    },
    timeline: [
      { label: 'Acute GH Boost', weekStart: 1, weekEnd: 2, description: 'Noticeable increase in appetite and improved sleep depth' },
      { label: 'Anabolic Phase', weekStart: 3, weekEnd: 8, description: 'Muscle fullness, fat reduction, and faster recovery between workouts' },
      { label: 'Peak Response', weekStart: 9, weekEnd: 12, description: 'Optimized GH output and body composition changes' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 8, evidence: 7, easeOfUse: 6, cost: 7, safety: 7, popularity: 7 },
    sideEffects: ['Increased appetite', 'Elevated cortisol', 'Water retention', 'Tiredness'],
    contraindications: ['Active cancer', 'Obesity-related conditions where appetite increase is undesirable', 'Pregnancy'],
  },

  // ─── 9. GHRP-6 ──────────────────────────────────────────────
  {
    id: 'ghrp-6',
    slug: 'ghrp-6',
    name: 'GHRP-6',
    abbreviation: 'GH6',
    fullName: 'Growth Hormone Releasing Peptide-6',
    category: 'growth-hormone',
    description:
      'One of the earliest synthetic GH secretagogues with strong ghrelin-mimetic activity. GHRP-6 produces significant GH release and a potent appetite-stimulating effect, making it useful for underweight individuals or those seeking mass gain.',
    effects: [
      'muscle-growth',
      'appetite',
      'recovery',
      'fat-loss',
      'anti-aging',
      'healing',
    ],
    affectedRegions: [
      { regionId: 'pituitary' as RegionId, intensity: 5, description: 'Robust GH secretion through ghrelin receptor agonism' },
      { regionId: 'muscles' as RegionId, intensity: 4, description: 'Promotes hypertrophy and recovery via GH/IGF-1 axis' },
      { regionId: 'gut' as RegionId, intensity: 4, description: 'Potent appetite stimulation; may have gastroprotective effects' },
      { regionId: 'liver' as RegionId, intensity: 2, description: 'Increases hepatic IGF-1 output' },
    ],
    commonStacks: ['gh-optimization', 'athletic-performance'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '100–300 mcg',
      frequency: '2–3x daily',
      cycleLength: '8–12 weeks',
      notes: 'Take on empty stomach. Expect significant hunger within 20 minutes. Stack with GHRH for maximum effect.',
    },
    timeline: [
      { label: 'Appetite & GH Surge', weekStart: 1, weekEnd: 2, description: 'Marked appetite increase and improved sleep quality' },
      { label: 'Mass Building', weekStart: 3, weekEnd: 8, description: 'Weight gain, muscle fullness, and accelerated recovery' },
      { label: 'Sustained Gains', weekStart: 9, weekEnd: 12, description: 'Continued anabolic benefit with normalized appetite response' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 7, evidence: 7, easeOfUse: 6, cost: 8, safety: 7, popularity: 6 },
    sideEffects: ['Intense hunger', 'Water retention', 'Elevated cortisol and prolactin', 'Mild dizziness'],
    contraindications: ['Active cancer', 'Obesity where appetite stimulation is harmful', 'Pregnancy'],
  },

  // ─── 10. Hexarelin ──────────────────────────────────────────
  {
    id: 'hexarelin',
    slug: 'hexarelin',
    name: 'Hexarelin',
    abbreviation: 'HEX',
    fullName: 'Hexarelin Acetate',
    category: 'growth-hormone',
    description:
      'The most potent synthetic GHRP, producing the largest GH pulses of any peptide in this class. Hexarelin also exhibits notable cardioprotective properties but is limited by rapid desensitization of the ghrelin receptor with continued use.',
    effects: [
      'muscle-growth',
      'fat-loss',
      'cardioprotection',
      'recovery',
      'anti-aging',
    ],
    affectedRegions: [
      { regionId: 'pituitary' as RegionId, intensity: 5, description: 'Elicits the strongest GH pulse of all GHRPs via ghrelin receptor' },
      { regionId: 'heart' as RegionId, intensity: 4, description: 'Cardioprotective effects independent of GH release; reduces fibrosis' },
      { regionId: 'muscles' as RegionId, intensity: 4, description: 'Strong anabolic drive due to peak GH elevation' },
      { regionId: 'bones' as RegionId, intensity: 2, description: 'Bone density support through GH-mediated pathways' },
    ],
    commonStacks: ['gh-optimization', 'athletic-performance'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '100–200 mcg',
      frequency: '2–3x daily',
      cycleLength: '4–8 weeks',
      notes: 'Desensitization occurs within 4–8 weeks. Cycle off and rotate with other GHRPs. Short cycles recommended.',
    },
    timeline: [
      { label: 'Peak GH Response', weekStart: 1, weekEnd: 2, description: 'Highest GH output; enhanced sleep and rapid recovery' },
      { label: 'Anabolic Window', weekStart: 3, weekEnd: 6, description: 'Muscle gains and fat loss while GH receptor sensitivity persists' },
      { label: 'Taper', weekStart: 7, weekEnd: 8, description: 'Diminishing returns as desensitization sets in; time to cycle off' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 8, evidence: 6, easeOfUse: 5, cost: 6, safety: 7, popularity: 5 },
    sideEffects: ['Elevated cortisol and prolactin', 'Water retention', 'Receptor desensitization', 'Hunger'],
    contraindications: ['Active cancer', 'Pituitary disorders', 'Pregnancy'],
  },

  // ─── 11. PT-141 ─────────────────────────────────────────────
  {
    id: 'pt-141',
    slug: 'pt-141',
    name: 'PT-141',
    abbreviation: 'PT',
    fullName: 'Bremelanotide (Vyleesi)',
    category: 'sexual-health',
    description:
      'An FDA-approved melanocortin receptor agonist for hypoactive sexual desire disorder in premenopausal women. PT-141 acts centrally in the brain to increase sexual arousal and desire, unlike PDE5 inhibitors which work on blood flow.',
    effects: [
      'sexual-function',
      'libido',
      'mood',
    ],
    affectedRegions: [
      { regionId: 'brain' as RegionId, intensity: 5, description: 'Activates melanocortin-4 receptors in hypothalamus to increase sexual desire' },
      { regionId: 'reproductive' as RegionId, intensity: 4, description: 'Enhances genital arousal through central nervous system signaling' },
    ],
    commonStacks: ['sexual-health'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '1.75 mg',
      frequency: 'As needed (45 min before activity)',
      cycleLength: 'On-demand use',
      notes: 'Maximum one dose per 24 hours. Not more than 8 doses per month. Also available via nasal spray.',
    },
    timeline: [
      { label: 'Onset', weekStart: 0, weekEnd: 0, description: 'Effects begin within 45 minutes of injection and last 6–12 hours' },
      { label: 'Sustained Use', weekStart: 1, weekEnd: 4, description: 'Consistent on-demand effectiveness with no tolerance observed' },
    ],
    evidenceLevel: 'strong',
    ratings: { efficacy: 8, evidence: 9, easeOfUse: 7, cost: 5, safety: 7, popularity: 8 },
    sideEffects: ['Nausea (common)', 'Facial flushing', 'Headache', 'Temporary skin darkening', 'Elevated blood pressure'],
    contraindications: ['Uncontrolled hypertension', 'Cardiovascular disease', 'Pregnancy'],
  },

  // ─── 12. Melanotan II ───────────────────────────────────────
  {
    id: 'melanotan-ii',
    slug: 'melanotan-ii',
    name: 'Melanotan II',
    abbreviation: 'MT2',
    fullName: 'Melanotan II Acetate',
    category: 'sexual-health',
    description:
      'A non-selective melanocortin receptor agonist originally developed for skin tanning. Melanotan II promotes melanogenesis, sexual arousal, fat loss, and appetite suppression through broad melanocortin system activation.',
    effects: [
      'sexual-function',
      'libido',
      'skin-rejuvenation',
      'fat-loss',
      'appetite',
    ],
    affectedRegions: [
      { regionId: 'skin' as RegionId, intensity: 5, description: 'Stimulates melanocyte activity, producing darker pigmentation' },
      { regionId: 'brain' as RegionId, intensity: 4, description: 'Activates MC4R to enhance libido and suppress appetite' },
      { regionId: 'reproductive' as RegionId, intensity: 4, description: 'Increases sexual arousal and erectile function via central mechanisms' },
    ],
    commonStacks: ['sexual-health'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '250–500 mcg',
      frequency: 'Daily during loading, then 1–2x weekly',
      cycleLength: '4–6 weeks loading, then maintenance',
      notes: 'Start at low dose (100 mcg) and titrate up to assess tolerance. UV exposure enhances tanning effect.',
    },
    timeline: [
      { label: 'Loading Phase', weekStart: 1, weekEnd: 3, description: 'Nausea subsides, skin begins to darken, libido increases' },
      { label: 'Maintenance', weekStart: 4, weekEnd: 8, description: 'Desired tan level maintained with infrequent dosing; sustained libido' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 8, evidence: 6, easeOfUse: 6, cost: 7, safety: 5, popularity: 7 },
    sideEffects: ['Nausea (especially initially)', 'Facial flushing', 'Mole darkening', 'Spontaneous erections', 'Appetite suppression'],
    contraindications: ['History of melanoma or atypical moles', 'Cardiovascular disease', 'Pregnancy'],
  },

  // ─── 13. Selank ─────────────────────────────────────────────
  {
    id: 'selank',
    slug: 'selank',
    name: 'Selank',
    abbreviation: 'SEL',
    fullName: 'Selank (TP-7)',
    category: 'cognitive',
    description:
      'A synthetic analog of tuftsin, an endogenous immunomodulatory peptide. Selank is approved in Russia as an anxiolytic and nootropic, enhancing cognitive function, reducing anxiety, and modulating the immune system without sedation or addiction potential.',
    effects: [
      'anxiolytic',
      'cognition',
      'focus',
      'memory',
      'mood',
      'immune-boost',
      'neuroprotection',
    ],
    affectedRegions: [
      { regionId: 'brain' as RegionId, intensity: 5, description: 'Modulates GABA, serotonin, and dopamine to reduce anxiety and enhance cognition' },
      { regionId: 'immune-system' as RegionId, intensity: 3, description: 'Immune-enhancing effects through tuftsin-related pathways' },
    ],
    commonStacks: ['cognitive', 'immune-boost'],
    dosing: {
      route: 'nasal',
      typicalDose: '250–500 mcg',
      frequency: '2–3x daily',
      cycleLength: '2–4 weeks',
      notes: 'Nasal spray is the preferred route. Can also be administered subcutaneously. No dependency or withdrawal observed.',
    },
    timeline: [
      { label: 'Acute Effects', weekStart: 0, weekEnd: 1, description: 'Anxiety reduction and mood stabilization within days' },
      { label: 'Cognitive Enhancement', weekStart: 2, weekEnd: 4, description: 'Improved working memory, focus, and sustained attention' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 7, evidence: 6, easeOfUse: 9, cost: 6, safety: 9, popularity: 7 },
    sideEffects: ['Mild fatigue (rare)', 'Nasal irritation'],
    contraindications: ['Pregnancy', 'Autoimmune disorders (consult physician)'],
  },

  // ─── 14. Semax ──────────────────────────────────────────────
  {
    id: 'semax',
    slug: 'semax',
    name: 'Semax',
    abbreviation: 'SMX',
    fullName: 'Semax (ACTH 4-10 Analog)',
    category: 'cognitive',
    description:
      'A synthetic peptide analog of ACTH(4-10) approved in Russia for cognitive disorders and stroke recovery. Semax enhances BDNF expression, improves memory and attention, and provides neuroprotective effects without hormonal side effects.',
    effects: [
      'cognition',
      'focus',
      'memory',
      'neuroprotection',
      'mood',
    ],
    affectedRegions: [
      { regionId: 'brain' as RegionId, intensity: 5, description: 'Increases BDNF, NGF, and CNTF; enhances synaptic plasticity and neural repair' },
      { regionId: 'pituitary' as RegionId, intensity: 2, description: 'Minimal adrenal axis activation despite ACTH-fragment origin' },
    ],
    commonStacks: ['cognitive'],
    dosing: {
      route: 'nasal',
      typicalDose: '200–600 mcg',
      frequency: '2–3x daily',
      cycleLength: '2–4 weeks',
      notes: 'Intranasal administration provides rapid onset. Can be cycled 2 weeks on / 2 weeks off for sustained benefit.',
    },
    timeline: [
      { label: 'Cognitive Onset', weekStart: 0, weekEnd: 1, description: 'Noticeable improvements in mental clarity, focus, and verbal fluency' },
      { label: 'Neuroplasticity', weekStart: 2, weekEnd: 4, description: 'Enhanced learning capacity, memory consolidation, and sustained neuroprotection' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 8, evidence: 7, easeOfUse: 9, cost: 6, safety: 9, popularity: 7 },
    sideEffects: ['Nasal irritation', 'Mild headache (rare)', 'Irritability at high doses'],
    contraindications: ['Pregnancy', 'Acute psychotic episodes', 'Seizure disorders (caution)'],
  },

  // ─── 15. Dihexa ─────────────────────────────────────────────
  {
    id: 'dihexa',
    slug: 'dihexa',
    name: 'Dihexa',
    abbreviation: 'DHX',
    fullName: 'N-hexanoic-Tyr-Ile-(6) aminohexanoic amide',
    category: 'cognitive',
    description:
      'An extremely potent angiotensin IV analog reported to be 10 million times more potent than BDNF at promoting synaptogenesis. Dihexa is a research peptide with powerful procognitive effects in animal models but limited human safety data.',
    effects: [
      'cognition',
      'memory',
      'neuroprotection',
      'focus',
    ],
    affectedRegions: [
      { regionId: 'brain' as RegionId, intensity: 5, description: 'Drives synaptogenesis through hepatocyte growth factor (HGF/c-Met) pathway activation' },
    ],
    commonStacks: ['cognitive'],
    dosing: {
      route: 'oral',
      typicalDose: '10–20 mg',
      frequency: 'Daily',
      cycleLength: '2–4 weeks',
      notes: 'Oral bioavailability is notable for a peptide. Extremely potent; low doses required. Limited human safety data — use with caution.',
    },
    timeline: [
      { label: 'Cognitive Boost', weekStart: 1, weekEnd: 2, description: 'Heightened mental clarity, improved recall, and faster processing' },
      { label: 'Sustained Enhancement', weekStart: 3, weekEnd: 4, description: 'Ongoing synaptogenic effects supporting memory and learning' },
    ],
    evidenceLevel: 'preclinical',
    ratings: { efficacy: 8, evidence: 3, easeOfUse: 8, cost: 5, safety: 4, popularity: 5 },
    sideEffects: ['Unknown long-term effects', 'Potential overstimulation', 'Theoretical cancer risk (HGF/c-Met pathway)'],
    contraindications: ['Cancer or cancer history (c-Met activation)', 'Pregnancy', 'Liver disease'],
  },

  // ─── 16. NA-Selank ──────────────────────────────────────────
  {
    id: 'na-selank',
    slug: 'na-selank',
    name: 'NA-Selank',
    abbreviation: 'NASEL',
    fullName: 'N-Acetyl Selank',
    category: 'cognitive',
    description:
      'An acetylated form of Selank with enhanced stability and bioavailability. NA-Selank crosses the blood-brain barrier more readily, providing stronger and longer-lasting anxiolytic and nootropic effects compared to standard Selank.',
    effects: [
      'anxiolytic',
      'cognition',
      'focus',
      'memory',
      'mood',
      'neuroprotection',
    ],
    affectedRegions: [
      { regionId: 'brain' as RegionId, intensity: 5, description: 'Enhanced GABAergic and serotonergic modulation with improved BBB penetration' },
      { regionId: 'immune-system' as RegionId, intensity: 2, description: 'Retains immunomodulatory activity of parent compound' },
    ],
    commonStacks: ['cognitive'],
    dosing: {
      route: 'nasal',
      typicalDose: '200–400 mcg',
      frequency: '2–3x daily',
      cycleLength: '2–4 weeks',
      notes: 'More potent than standard Selank; start at lower end of dosing range. Nasal spray preferred.',
    },
    timeline: [
      { label: 'Rapid Onset', weekStart: 0, weekEnd: 1, description: 'Pronounced anxiety reduction and mood elevation within days' },
      { label: 'Cognitive Gains', weekStart: 2, weekEnd: 4, description: 'Improved focus, working memory, and stress resilience' },
    ],
    evidenceLevel: 'emerging',
    ratings: { efficacy: 8, evidence: 5, easeOfUse: 9, cost: 5, safety: 8, popularity: 6 },
    sideEffects: ['Nasal irritation', 'Mild drowsiness (rare)'],
    contraindications: ['Pregnancy', 'Autoimmune conditions (consult physician)'],
  },

  // ─── 17. NA-Semax ───────────────────────────────────────────
  {
    id: 'na-semax',
    slug: 'na-semax',
    name: 'NA-Semax',
    abbreviation: 'NASMX',
    fullName: 'N-Acetyl Semax Amidate',
    category: 'cognitive',
    description:
      'An enhanced derivative of Semax with N-acetyl and amide modifications for greater stability and potency. NA-Semax provides stronger BDNF upregulation and more pronounced cognitive enhancement than the parent peptide.',
    effects: [
      'cognition',
      'focus',
      'memory',
      'neuroprotection',
      'mood',
    ],
    affectedRegions: [
      { regionId: 'brain' as RegionId, intensity: 5, description: 'Potent BDNF and neurotrophin upregulation; stronger synaptic plasticity effects' },
    ],
    commonStacks: ['cognitive'],
    dosing: {
      route: 'nasal',
      typicalDose: '200–600 mcg',
      frequency: '2–3x daily',
      cycleLength: '2–4 weeks',
      notes: 'More potent than standard Semax. Cycle 2 weeks on / 2 weeks off. Can be combined with NA-Selank.',
    },
    timeline: [
      { label: 'Cognitive Enhancement', weekStart: 0, weekEnd: 1, description: 'Rapid improvement in mental sharpness, focus, and verbal fluency' },
      { label: 'Neurotrophin Boost', weekStart: 2, weekEnd: 4, description: 'Sustained BDNF elevation with lasting memory and learning improvements' },
    ],
    evidenceLevel: 'emerging',
    ratings: { efficacy: 8, evidence: 5, easeOfUse: 9, cost: 5, safety: 8, popularity: 6 },
    sideEffects: ['Nasal irritation', 'Overstimulation at high doses', 'Irritability (rare)'],
    contraindications: ['Pregnancy', 'Seizure disorders', 'Acute psychotic states'],
  },

  // ─── 18. Cerebrolysin ───────────────────────────────────────
  {
    id: 'cerebrolysin',
    slug: 'cerebrolysin',
    name: 'Cerebrolysin',
    abbreviation: 'CBL',
    fullName: 'Cerebrolysin (FPF-1070)',
    category: 'cognitive',
    description:
      'A multi-peptide preparation derived from porcine brain tissue, containing neurotrophic factors that mimic BDNF and NGF activity. Cerebrolysin is approved in many countries for stroke, TBI, and dementia, with substantial clinical trial evidence.',
    effects: [
      'neuroprotection',
      'cognition',
      'memory',
      'focus',
      'healing',
    ],
    affectedRegions: [
      { regionId: 'brain' as RegionId, intensity: 5, description: 'Promotes neurogenesis, synaptogenesis, and neuronal survival through neurotrophic activity' },
    ],
    commonStacks: ['cognitive'],
    dosing: {
      route: 'intramuscular',
      typicalDose: '5–30 mL',
      frequency: 'Daily for 10–20 days',
      cycleLength: '2–4 week courses',
      notes: 'Must be administered via intramuscular or slow IV infusion. Available in many countries; not FDA-approved in the US.',
    },
    timeline: [
      { label: 'Neuroprotective Phase', weekStart: 1, weekEnd: 2, description: 'Reduced neuroinflammation and early cognitive stabilization' },
      { label: 'Regenerative Phase', weekStart: 3, weekEnd: 4, description: 'Improved memory, attention, and executive function; neural repair continues post-treatment' },
    ],
    evidenceLevel: 'strong',
    ratings: { efficacy: 8, evidence: 8, easeOfUse: 3, cost: 5, safety: 7, popularity: 5 },
    sideEffects: ['Injection site pain', 'Dizziness', 'Headache', 'Agitation (rare)'],
    contraindications: ['Epilepsy', 'Severe renal insufficiency', 'Allergy to porcine products', 'Pregnancy'],
  },

  // ─── 19. AOD-9604 ───────────────────────────────────────────
  {
    id: 'aod-9604',
    slug: 'aod-9604',
    name: 'AOD-9604',
    abbreviation: 'AOD',
    fullName: 'Advanced Obesity Drug 9604',
    category: 'metabolic',
    description:
      'A modified fragment of human growth hormone (HGH 176-191) that retains fat-burning properties without the anabolic or diabetogenic effects of full-length GH. AOD-9604 stimulates lipolysis and inhibits lipogenesis.',
    effects: [
      'fat-loss',
      'joint-repair',
      'recovery',
    ],
    affectedRegions: [
      { regionId: 'liver' as RegionId, intensity: 4, description: 'Mimics the lipolytic region of GH, stimulating fat metabolism without affecting glucose' },
      { regionId: 'joints' as RegionId, intensity: 3, description: 'Emerging evidence for cartilage repair and regenerative effects' },
      { regionId: 'muscles' as RegionId, intensity: 2, description: 'Indirect preservation of lean mass during fat loss' },
    ],
    commonStacks: ['fat-loss'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '300 mcg',
      frequency: 'Daily (morning, fasted)',
      cycleLength: '8–12 weeks',
      notes: 'Administer on empty stomach in the morning. Do not eat for 30 minutes after injection. No significant impact on blood sugar.',
    },
    timeline: [
      { label: 'Metabolic Activation', weekStart: 1, weekEnd: 4, description: 'Enhanced fat oxidation and gradual reduction in stubborn fat deposits' },
      { label: 'Visible Results', weekStart: 5, weekEnd: 12, description: 'Measurable reduction in body fat percentage; improved body composition' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 6, evidence: 6, easeOfUse: 7, cost: 6, safety: 8, popularity: 7 },
    sideEffects: ['Injection site redness', 'Mild headache', 'Indigestion (rare)'],
    contraindications: ['Active cancer', 'Pregnancy', 'Severe metabolic disorders'],
  },

  // ─── 20. MOTS-c ─────────────────────────────────────────────
  {
    id: 'mots-c',
    slug: 'mots-c',
    name: 'MOTS-c',
    abbreviation: 'MOTS',
    fullName: 'Mitochondrial Open Reading Frame of the 12S rRNA-c',
    category: 'metabolic',
    description:
      'A mitochondria-derived peptide that regulates metabolic homeostasis by activating AMPK and improving glucose uptake. MOTS-c is considered a mitochondrial-encoded exercise mimetic with anti-aging and metabolic benefits.',
    effects: [
      'metabolic',
      'fat-loss',
      'endurance',
      'anti-aging',
      'mitochondrial',
      'muscle-growth',
    ],
    affectedRegions: [
      { regionId: 'muscles' as RegionId, intensity: 5, description: 'Activates AMPK in skeletal muscle, improving glucose uptake and exercise capacity' },
      { regionId: 'liver' as RegionId, intensity: 4, description: 'Regulates hepatic glucose production and lipid metabolism' },
      { regionId: 'gut' as RegionId, intensity: 2, description: 'Influences microbiome composition and metabolic signaling' },
    ],
    commonStacks: ['fat-loss', 'athletic-performance', 'anti-aging'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '5–10 mg',
      frequency: '3–5x per week',
      cycleLength: '4–8 weeks',
      notes: 'Relatively new peptide; dosing protocols are still being refined. Often used as an exercise mimetic or metabolic optimizer.',
    },
    timeline: [
      { label: 'Metabolic Priming', weekStart: 1, weekEnd: 3, description: 'Improved insulin sensitivity, increased energy, and enhanced exercise tolerance' },
      { label: 'Body Composition', weekStart: 4, weekEnd: 8, description: 'Fat loss, improved endurance, and enhanced mitochondrial function' },
    ],
    evidenceLevel: 'emerging',
    ratings: { efficacy: 7, evidence: 5, easeOfUse: 6, cost: 4, safety: 7, popularity: 6 },
    sideEffects: ['Injection site discomfort', 'Mild GI upset', 'Transient fatigue'],
    contraindications: ['Pregnancy', 'Severe metabolic disease (consult physician)'],
  },

  // ─── 21. SS-31 (Elamipretide) ──────────────────────────────
  {
    id: 'ss-31',
    slug: 'ss-31',
    name: 'SS-31',
    abbreviation: 'SS31',
    fullName: 'Elamipretide (Bendavia)',
    category: 'longevity',
    description:
      'A mitochondria-targeted tetrapeptide that concentrates in the inner mitochondrial membrane, stabilizing cardiolipin and restoring electron transport chain efficiency. SS-31 is in clinical trials for mitochondrial diseases and age-related cardiac dysfunction.',
    effects: [
      'mitochondrial',
      'anti-aging',
      'cardioprotection',
      'endurance',
      'neuroprotection',
    ],
    affectedRegions: [
      { regionId: 'heart' as RegionId, intensity: 5, description: 'Restores mitochondrial function in cardiomyocytes; improves cardiac output' },
      { regionId: 'muscles' as RegionId, intensity: 4, description: 'Enhances skeletal muscle mitochondrial efficiency and exercise capacity' },
      { regionId: 'brain' as RegionId, intensity: 3, description: 'Protects neuronal mitochondria from oxidative damage' },
      { regionId: 'kidneys' as RegionId, intensity: 3, description: 'Renoprotective effects via mitochondrial stabilization' },
    ],
    commonStacks: ['anti-aging', 'athletic-performance'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '10–50 mg',
      frequency: 'Daily',
      cycleLength: '4–12 weeks',
      notes: 'Currently in clinical trials. Dosing based on trial protocols. Targets inner mitochondrial membrane directly.',
    },
    timeline: [
      { label: 'Mitochondrial Stabilization', weekStart: 1, weekEnd: 4, description: 'Improved cellular energy production, reduced oxidative stress markers' },
      { label: 'Functional Improvement', weekStart: 5, weekEnd: 12, description: 'Enhanced exercise tolerance, improved cardiac function, and increased vitality' },
    ],
    evidenceLevel: 'emerging',
    ratings: { efficacy: 7, evidence: 6, easeOfUse: 6, cost: 3, safety: 7, popularity: 4 },
    sideEffects: ['Injection site reactions', 'Headache', 'Mild nausea'],
    contraindications: ['Pregnancy', 'Severe hepatic impairment'],
  },

  // ─── 22. Epithalon ──────────────────────────────────────────
  {
    id: 'epithalon',
    slug: 'epithalon',
    name: 'Epithalon',
    abbreviation: 'EPTH',
    fullName: 'Epitalon (Epithalamion)',
    category: 'longevity',
    description:
      'A synthetic tetrapeptide derived from epithalamin, the pineal gland extract studied by Dr. Vladimir Khavinson. Epithalon activates telomerase, potentially lengthening telomeres, and regulates melatonin production for circadian rhythm normalization.',
    effects: [
      'telomere',
      'anti-aging',
      'sleep',
      'immune-boost',
    ],
    affectedRegions: [
      { regionId: 'brain' as RegionId, intensity: 4, description: 'Regulates pineal gland function and normalizes melatonin synthesis' },
      { regionId: 'immune-system' as RegionId, intensity: 3, description: 'Enhances immune surveillance and thymic function in aging' },
      { regionId: 'skin' as RegionId, intensity: 2, description: 'Telomerase activation may slow cellular senescence in skin tissue' },
    ],
    commonStacks: ['anti-aging', 'sleep-recovery'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '5–10 mg',
      frequency: 'Daily for 10–20 days',
      cycleLength: '10–20 day courses, 2–3x per year',
      notes: 'Typically used in short intensive courses spaced 4–6 months apart. Based on Khavinson peptide bioregulator protocols.',
    },
    timeline: [
      { label: 'Melatonin Normalization', weekStart: 1, weekEnd: 2, description: 'Improved sleep onset and quality; circadian rhythm stabilization' },
      { label: 'Telomerase Activation', weekStart: 2, weekEnd: 3, description: 'Cellular-level anti-aging effects; sustained benefits lasting months post-course' },
    ],
    evidenceLevel: 'emerging',
    ratings: { efficacy: 7, evidence: 5, easeOfUse: 7, cost: 5, safety: 8, popularity: 6 },
    sideEffects: ['Injection site irritation', 'Vivid dreams', 'Mild headache (rare)'],
    contraindications: ['Pregnancy', 'Active cancer (theoretical telomerase concern)'],
  },

  // ─── 23. Thymosin Alpha-1 ───────────────────────────────────
  {
    id: 'thymosin-alpha-1',
    slug: 'thymosin-alpha-1',
    name: 'Thymosin Alpha-1',
    abbreviation: 'TA1',
    fullName: 'Thymalfasin (Zadaxin)',
    category: 'immune',
    description:
      'A naturally occurring thymic peptide approved in over 35 countries for hepatitis B and C, and as an immune adjuvant. Thymosin Alpha-1 enhances T-cell function, dendritic cell maturation, and overall immune competence.',
    effects: [
      'immune-boost',
      'anti-inflammatory',
      'antimicrobial',
      'anti-aging',
    ],
    affectedRegions: [
      { regionId: 'immune-system' as RegionId, intensity: 5, description: 'Enhances T-cell maturation, NK cell activity, and dendritic cell function' },
      { regionId: 'liver' as RegionId, intensity: 3, description: 'Supports hepatic immune response; used clinically for hepatitis B and C' },
      { regionId: 'lungs' as RegionId, intensity: 2, description: 'Boosts pulmonary immune defenses against respiratory infections' },
    ],
    commonStacks: ['immune-boost', 'anti-aging'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '1.6 mg',
      frequency: '2–3x per week',
      cycleLength: '4–6 months',
      notes: 'Well-established dosing from clinical trials. Can be used long-term for immune maintenance. Approved as Zadaxin internationally.',
    },
    timeline: [
      { label: 'Immune Activation', weekStart: 1, weekEnd: 4, description: 'Enhanced T-cell counts and improved immune markers' },
      { label: 'Sustained Immunity', weekStart: 5, weekEnd: 24, description: 'Robust and sustained immune competence with continued administration' },
    ],
    evidenceLevel: 'strong',
    ratings: { efficacy: 8, evidence: 9, easeOfUse: 7, cost: 4, safety: 9, popularity: 7 },
    sideEffects: ['Injection site discomfort', 'Mild fatigue', 'Rare allergic reaction'],
    contraindications: ['Organ transplant recipients (immunosuppression required)', 'Pregnancy'],
  },

  // ─── 24. KPV ────────────────────────────────────────────────
  {
    id: 'kpv',
    slug: 'kpv',
    name: 'KPV',
    abbreviation: 'KPV',
    fullName: 'Lysine-Proline-Valine (alpha-MSH fragment)',
    category: 'immune',
    description:
      'A tripeptide derived from the C-terminal end of alpha-melanocyte-stimulating hormone (alpha-MSH). KPV possesses potent anti-inflammatory properties and is particularly studied for its benefits in inflammatory bowel disease and skin conditions.',
    effects: [
      'anti-inflammatory',
      'gut-health',
      'immune-boost',
      'wound-healing',
      'antimicrobial',
    ],
    affectedRegions: [
      { regionId: 'gut' as RegionId, intensity: 5, description: 'Reduces intestinal inflammation by inhibiting NF-kB and inflammatory cytokines' },
      { regionId: 'immune-system' as RegionId, intensity: 4, description: 'Powerful anti-inflammatory modulation without immunosuppression' },
      { regionId: 'skin' as RegionId, intensity: 3, description: 'Reduces inflammatory skin conditions and promotes wound healing' },
    ],
    commonStacks: ['gut-healing', 'immune-boost'],
    dosing: {
      route: 'oral',
      typicalDose: '200–500 mcg',
      frequency: '1–2x daily',
      cycleLength: '4–8 weeks',
      notes: 'Can be taken orally for GI-targeted effects, or subcutaneously for systemic anti-inflammatory action. Also available topically for skin.',
    },
    timeline: [
      { label: 'Anti-Inflammatory Response', weekStart: 1, weekEnd: 3, description: 'Reduction in GI symptoms, decreased bloating, and reduced inflammatory markers' },
      { label: 'Tissue Healing', weekStart: 4, weekEnd: 8, description: 'Mucosal repair in the gut and resolution of inflammatory skin conditions' },
    ],
    evidenceLevel: 'emerging',
    ratings: { efficacy: 7, evidence: 5, easeOfUse: 8, cost: 6, safety: 9, popularity: 6 },
    sideEffects: ['Mild GI discomfort (rare)', 'Headache (uncommon)'],
    contraindications: ['Pregnancy', 'Known hypersensitivity to alpha-MSH derivatives'],
  },

  // ─── 25. LL-37 ──────────────────────────────────────────────
  {
    id: 'll-37',
    slug: 'll-37',
    name: 'LL-37',
    abbreviation: 'LL37',
    fullName: 'Cathelicidin LL-37',
    category: 'immune',
    description:
      'The only human cathelicidin antimicrobial peptide, LL-37 plays a critical role in innate immune defense. It directly kills bacteria, fungi, and viruses while modulating the inflammatory response and promoting wound healing.',
    effects: [
      'antimicrobial',
      'immune-boost',
      'wound-healing',
      'anti-inflammatory',
    ],
    affectedRegions: [
      { regionId: 'immune-system' as RegionId, intensity: 5, description: 'Broad-spectrum antimicrobial activity and immune cell recruitment' },
      { regionId: 'skin' as RegionId, intensity: 4, description: 'Antimicrobial defense at skin barrier; promotes wound healing' },
      { regionId: 'lungs' as RegionId, intensity: 3, description: 'Pulmonary defense against respiratory pathogens' },
      { regionId: 'gut' as RegionId, intensity: 3, description: 'Intestinal antimicrobial defense and barrier integrity' },
    ],
    commonStacks: ['immune-boost'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '50–100 mcg',
      frequency: 'Daily',
      cycleLength: '2–4 weeks',
      notes: 'Can be used during acute infections or as preventive immune support. Topical application for skin infections also used.',
    },
    timeline: [
      { label: 'Immune Activation', weekStart: 1, weekEnd: 2, description: 'Enhanced antimicrobial defense and reduced infection severity' },
      { label: 'Resolution Phase', weekStart: 3, weekEnd: 4, description: 'Wound healing acceleration and sustained immune resilience' },
    ],
    evidenceLevel: 'emerging',
    ratings: { efficacy: 7, evidence: 5, easeOfUse: 6, cost: 5, safety: 7, popularity: 5 },
    sideEffects: ['Injection site irritation', 'Mild inflammatory flare (temporary)', 'Redness'],
    contraindications: ['Pregnancy', 'Autoimmune conditions (may exacerbate)', 'Rosacea (may worsen)'],
  },

  // ─── 26. VIP ────────────────────────────────────────────────
  {
    id: 'vip',
    slug: 'vip',
    name: 'VIP',
    abbreviation: 'VIP',
    fullName: 'Vasoactive Intestinal Peptide',
    category: 'immune',
    description:
      'A 28-amino acid neuropeptide with potent anti-inflammatory, immunomodulatory, and vasodilatory properties. VIP is used in chronic inflammatory response syndrome (CIRS) and mold illness protocols to restore immune balance and reduce inflammation.',
    effects: [
      'anti-inflammatory',
      'immune-boost',
      'gut-health',
      'neuroprotection',
      'cardioprotection',
    ],
    affectedRegions: [
      { regionId: 'immune-system' as RegionId, intensity: 5, description: 'Shifts immune response from Th1/Th17 toward regulatory T-cell dominance' },
      { regionId: 'lungs' as RegionId, intensity: 4, description: 'Reduces pulmonary inflammation and restores pulmonary artery pressure' },
      { regionId: 'gut' as RegionId, intensity: 4, description: 'Regulates intestinal motility and reduces GI inflammation' },
      { regionId: 'brain' as RegionId, intensity: 3, description: 'Neuroprotective and anti-neuroinflammatory effects' },
      { regionId: 'heart' as RegionId, intensity: 2, description: 'Vasodilatory effects and cardiovascular protection' },
    ],
    commonStacks: ['immune-boost', 'gut-healing'],
    dosing: {
      route: 'nasal',
      typicalDose: '50 mcg per nostril',
      frequency: '4x daily',
      cycleLength: '1–6 months',
      notes: 'Nasal spray most common for CIRS/mold illness protocols. Subcutaneous also used. Monitor VIP levels and VEGF.',
    },
    timeline: [
      { label: 'Anti-Inflammatory Onset', weekStart: 1, weekEnd: 4, description: 'Reduction in CIRS symptoms, improved breathing, and decreased fatigue' },
      { label: 'Immune Rebalancing', weekStart: 5, weekEnd: 12, description: 'Normalized inflammatory markers and restored immune regulation' },
      { label: 'Sustained Resolution', weekStart: 13, weekEnd: 26, description: 'Long-term symptom resolution in chronic inflammatory conditions' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 7, evidence: 6, easeOfUse: 7, cost: 5, safety: 7, popularity: 5 },
    sideEffects: ['Nasal congestion', 'Diarrhea', 'Lowered blood pressure', 'Facial flushing'],
    contraindications: ['Hypotension', 'Active GI bleeding', 'Pregnancy'],
  },

  // ─── 27. DSIP ───────────────────────────────────────────────
  {
    id: 'dsip',
    slug: 'dsip',
    name: 'DSIP',
    abbreviation: 'DSIP',
    fullName: 'Delta Sleep-Inducing Peptide',
    category: 'sleep-recovery',
    description:
      'A naturally occurring nonapeptide that promotes delta-wave (deep) sleep and modulates neuroendocrine function. DSIP normalizes disrupted sleep patterns, reduces stress hormone levels, and supports recovery without causing morning grogginess.',
    effects: [
      'sleep',
      'recovery',
      'mood',
      'hormonal-balance',
      'anxiolytic',
    ],
    affectedRegions: [
      { regionId: 'brain' as RegionId, intensity: 5, description: 'Promotes delta-wave sleep architecture and modulates sleep-wake signaling' },
      { regionId: 'pituitary' as RegionId, intensity: 3, description: 'Modulates LH, GH, and cortisol release patterns' },
      { regionId: 'immune-system' as RegionId, intensity: 2, description: 'Sleep normalization supports immune function recovery' },
    ],
    commonStacks: ['sleep-recovery'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '100–300 mcg',
      frequency: 'Daily (30–60 min before bed)',
      cycleLength: '2–4 weeks',
      notes: 'Administer before bed. Works best in those with disrupted sleep patterns. Not a sedative; normalizes sleep architecture.',
    },
    timeline: [
      { label: 'Sleep Onset', weekStart: 1, weekEnd: 1, description: 'Improved sleep initiation and increased time in deep sleep stages' },
      { label: 'Sleep Normalization', weekStart: 2, weekEnd: 4, description: 'Consistent restorative sleep, reduced nighttime awakenings, improved HRV' },
    ],
    evidenceLevel: 'emerging',
    ratings: { efficacy: 7, evidence: 4, easeOfUse: 7, cost: 6, safety: 8, popularity: 6 },
    sideEffects: ['Mild morning grogginess (initial)', 'Headache (rare)', 'Vivid dreams'],
    contraindications: ['Pregnancy', 'Low blood pressure'],
  },

  // ─── 28. Oxytocin ───────────────────────────────────────────
  {
    id: 'oxytocin',
    slug: 'oxytocin',
    name: 'Oxytocin',
    abbreviation: 'OXY',
    fullName: 'Oxytocin (Pitocin)',
    category: 'sexual-health',
    description:
      'A naturally occurring neuropeptide often called the "bonding hormone." Oxytocin is FDA-approved for labor induction and is used off-label for sexual function enhancement, social bonding, anxiety reduction, and emotional well-being.',
    effects: [
      'sexual-function',
      'mood',
      'anxiolytic',
      'hormonal-balance',
    ],
    affectedRegions: [
      { regionId: 'brain' as RegionId, intensity: 5, description: 'Modulates limbic system activity, enhancing bonding, trust, and reducing anxiety' },
      { regionId: 'reproductive' as RegionId, intensity: 4, description: 'Enhances sexual arousal, orgasm intensity, and pair bonding' },
      { regionId: 'heart' as RegionId, intensity: 2, description: 'Cardioprotective effects through vasodilation and anti-inflammatory action' },
    ],
    commonStacks: ['sexual-health', 'sleep-recovery'],
    dosing: {
      route: 'nasal',
      typicalDose: '10–40 IU',
      frequency: 'As needed or daily',
      cycleLength: 'On-demand or 2–4 week courses',
      notes: 'Intranasal spray preferred for off-label use. Effects begin within 15–30 minutes. Duration approximately 2–4 hours.',
    },
    timeline: [
      { label: 'Acute Effects', weekStart: 0, weekEnd: 0, description: 'Rapid mood elevation, reduced anxiety, enhanced feelings of connection' },
      { label: 'Sustained Use', weekStart: 1, weekEnd: 4, description: 'Improved emotional regulation, deeper social bonding, and enhanced sexual satisfaction' },
    ],
    evidenceLevel: 'strong',
    ratings: { efficacy: 7, evidence: 8, easeOfUse: 8, cost: 7, safety: 8, popularity: 6 },
    sideEffects: ['Nasal irritation', 'Headache', 'Nausea (rare)', 'Excessive water retention at high doses'],
    contraindications: ['Pregnancy (unless medically supervised)', 'Hypersensitivity to oxytocin'],
  },

  // ─── 29. Kisspeptin-10 ──────────────────────────────────────
  {
    id: 'kisspeptin-10',
    slug: 'kisspeptin-10',
    name: 'Kisspeptin-10',
    abbreviation: 'KP10',
    fullName: 'Kisspeptin-10 (Metastin 45-54)',
    category: 'sexual-health',
    description:
      'A truncated form of kisspeptin that activates GnRH neurons to stimulate the hypothalamic-pituitary-gonadal axis. Kisspeptin-10 is being studied as a natural approach to boost testosterone, LH, and FSH while enhancing sexual arousal.',
    effects: [
      'hormonal-balance',
      'sexual-function',
      'libido',
      'mood',
    ],
    affectedRegions: [
      { regionId: 'brain' as RegionId, intensity: 5, description: 'Activates GnRH neurons in the hypothalamus, triggering LH and FSH release' },
      { regionId: 'pituitary' as RegionId, intensity: 4, description: 'Stimulates gonadotropin secretion from the anterior pituitary' },
      { regionId: 'reproductive' as RegionId, intensity: 4, description: 'Increases testosterone/estrogen production and enhances sexual arousal' },
    ],
    commonStacks: ['sexual-health'],
    dosing: {
      route: 'subcutaneous',
      typicalDose: '1–10 nmol/kg',
      frequency: 'Daily or pulsed dosing',
      cycleLength: '2–4 weeks',
      notes: 'Research dosing varies. Short half-life requires frequent administration. Being studied as alternative to hCG/clomiphene for HPG axis stimulation.',
    },
    timeline: [
      { label: 'Hormonal Activation', weekStart: 1, weekEnd: 2, description: 'Rapid increase in LH, FSH, and downstream sex hormones' },
      { label: 'Functional Benefits', weekStart: 3, weekEnd: 4, description: 'Enhanced libido, improved mood, and restored hormonal balance' },
    ],
    evidenceLevel: 'emerging',
    ratings: { efficacy: 7, evidence: 5, easeOfUse: 5, cost: 4, safety: 7, popularity: 4 },
    sideEffects: ['Injection site discomfort', 'Flushing', 'Mild headache', 'Nausea'],
    contraindications: ['Hormone-sensitive cancers', 'Pregnancy', 'Pituitary disorders'],
  },

  // ─── 30. MK-677 ─────────────────────────────────────────────
  {
    id: 'mk-677',
    slug: 'mk-677',
    name: 'MK-677',
    abbreviation: 'MK',
    fullName: 'Ibutamoren Mesylate',
    category: 'growth-hormone',
    description:
      'A non-peptide, orally active ghrelin receptor agonist that mimics GH secretagogue effects. MK-677 produces sustained GH and IGF-1 elevation for up to 24 hours per dose, making it the most convenient GH-boosting compound available.',
    effects: [
      'muscle-growth',
      'fat-loss',
      'sleep',
      'recovery',
      'appetite',
      'bone-density',
      'anti-aging',
      'skin-rejuvenation',
    ],
    affectedRegions: [
      { regionId: 'pituitary' as RegionId, intensity: 5, description: 'Sustained ghrelin receptor activation producing 24-hour GH elevation' },
      { regionId: 'muscles' as RegionId, intensity: 4, description: 'Promotes lean mass accrual and prevents muscle wasting' },
      { regionId: 'bones' as RegionId, intensity: 4, description: 'Increases bone mineral density; studied in osteoporosis populations' },
      { regionId: 'skin' as RegionId, intensity: 3, description: 'Improved skin quality and thickness from elevated GH/IGF-1' },
      { regionId: 'gut' as RegionId, intensity: 3, description: 'Stimulates appetite through ghrelin pathway activation' },
      { regionId: 'liver' as RegionId, intensity: 3, description: 'Drives hepatic IGF-1 production over sustained periods' },
    ],
    commonStacks: ['gh-optimization', 'anti-aging', 'sleep-recovery', 'athletic-performance'],
    dosing: {
      route: 'oral',
      typicalDose: '10–25 mg',
      frequency: 'Daily (before bed)',
      cycleLength: '8–16 weeks',
      notes: 'Oral dosing is a major advantage. Best taken before sleep to amplify natural GH pulse. Appetite increase is significant. Monitor blood glucose.',
    },
    timeline: [
      { label: 'GH Elevation', weekStart: 1, weekEnd: 2, description: 'Deeper sleep, increased appetite, and initial water retention' },
      { label: 'Body Composition', weekStart: 3, weekEnd: 8, description: 'Lean mass gains, improved skin and hair, progressive fat loss' },
      { label: 'Peak IGF-1', weekStart: 9, weekEnd: 16, description: 'IGF-1 levels plateau at maximum; full anti-aging and anabolic benefits realized' },
    ],
    evidenceLevel: 'moderate',
    ratings: { efficacy: 9, evidence: 7, easeOfUse: 10, cost: 8, safety: 7, popularity: 10 },
    sideEffects: ['Increased appetite', 'Water retention and bloating', 'Lethargy', 'Elevated blood glucose', 'Numbness/tingling in hands'],
    contraindications: ['Diabetes or insulin resistance', 'Active cancer', 'Pregnancy', 'Edema-prone conditions'],
  },
];

export function getPeptideById(id: string): Peptide | undefined {
  return peptides.find(p => p.id === id);
}

export function getPeptideBySlug(slug: string): Peptide | undefined {
  return peptides.find(p => p.slug === slug);
}
