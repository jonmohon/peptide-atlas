export interface GlossaryTerm {
  term: string;
  definition: string;
  relatedPeptide?: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Amino Acid',
    definition:
      'The building blocks of proteins and peptides. There are 20 standard amino acids that combine in various sequences to form peptides and proteins.',
  },
  {
    term: 'Angiogenesis',
    definition:
      'The formation of new blood vessels from existing vasculature. Several healing peptides such as BPC-157 promote angiogenesis to accelerate tissue repair.',
    relatedPeptide: 'bpc-157',
  },
  {
    term: 'Anxiolytic',
    definition:
      'A substance that reduces anxiety. Certain peptides like Selank exhibit anxiolytic properties by modulating neurotransmitter activity in the brain.',
    relatedPeptide: 'selank',
  },
  {
    term: 'Bioavailability',
    definition:
      'The proportion of a substance that enters circulation and is able to have an active effect. Administration route significantly affects peptide bioavailability.',
  },
  {
    term: 'BPC-157',
    definition:
      'Body Protection Compound-157, a pentadecapeptide derived from human gastric juice with potent tissue-healing and cytoprotective properties.',
    relatedPeptide: 'bpc-157',
  },
  {
    term: 'Cathelicidin',
    definition:
      'A family of antimicrobial peptides found in humans (LL-37) that play a key role in innate immune defense against bacterial, viral, and fungal infections.',
    relatedPeptide: 'll-37',
  },
  {
    term: 'GHRH',
    definition:
      'Growth Hormone-Releasing Hormone. A hypothalamic peptide that stimulates the pituitary gland to produce and secrete growth hormone. CJC-1295 is a synthetic analog.',
    relatedPeptide: 'cjc-1295',
  },
  {
    term: 'GHRP',
    definition:
      'Growth Hormone-Releasing Peptide. A class of synthetic peptides that stimulate growth hormone release through the ghrelin receptor. Examples include GHRP-6 and Ipamorelin.',
    relatedPeptide: 'ipamorelin',
  },
  {
    term: 'Growth Hormone',
    definition:
      'A peptide hormone produced by the pituitary gland that stimulates growth, cell reproduction, and regeneration. Many peptides aim to naturally increase GH secretion.',
  },
  {
    term: 'Half-life',
    definition:
      'The time required for the concentration of a substance in the body to decrease by half. Peptide half-lives range from minutes to hours, influencing dosing frequency.',
  },
  {
    term: 'Immunomodulation',
    definition:
      'The regulation or adjustment of the immune system. Peptides like Thymosin Alpha-1 and BPC-157 exhibit immunomodulatory effects, balancing immune responses.',
    relatedPeptide: 'thymosin-alpha-1',
  },
  {
    term: 'Intramuscular',
    definition:
      'An injection administered into muscle tissue. Some peptides are delivered intramuscularly for faster systemic absorption compared to subcutaneous injection.',
  },
  {
    term: 'Melanocortin',
    definition:
      'A group of peptide hormones that bind to melanocortin receptors, involved in pigmentation, appetite, and sexual function. Melanotan II is a synthetic melanocortin analog.',
    relatedPeptide: 'melanotan-ii',
  },
  {
    term: 'Mitochondria',
    definition:
      'Organelles responsible for cellular energy production. Certain peptides like SS-31 (Elamipretide) target mitochondria to improve function and reduce oxidative stress.',
  },
  {
    term: 'Neuroprotection',
    definition:
      'Mechanisms that protect neurons from damage or degeneration. Peptides such as Semax and Selank have demonstrated neuroprotective properties in preclinical studies.',
    relatedPeptide: 'semax',
  },
  {
    term: 'Nootropic',
    definition:
      'A substance that enhances cognitive function, including memory, focus, and learning. Nootropic peptides include Semax, Selank, and Dihexa.',
    relatedPeptide: 'semax',
  },
  {
    term: 'Peptide',
    definition:
      'A short chain of amino acids (typically 2-50) linked by peptide bonds. Peptides act as signaling molecules in the body and are smaller than proteins.',
  },
  {
    term: 'Stack',
    definition:
      'The practice of combining two or more peptides in a protocol to achieve synergistic effects. For example, BPC-157 and TB-500 are commonly stacked for healing.',
  },
  {
    term: 'Subcutaneous',
    definition:
      'An injection administered into the fatty tissue layer beneath the skin. This is the most common route of administration for peptides due to its ease and steady absorption.',
  },
  {
    term: 'Telomere',
    definition:
      'Protective caps on the ends of chromosomes that shorten with age. Some peptides like Epitalon are studied for their potential to activate telomerase and preserve telomere length.',
    relatedPeptide: 'epitalon',
  },
];
