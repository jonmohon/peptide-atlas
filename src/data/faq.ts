export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const faqItems: FAQItem[] = [
  // ─── General ───────────────────────────────────────────────
  {
    question: 'What are peptides?',
    answer:
      'Peptides are short chains of amino acids (typically 2-50) linked by peptide bonds. They act as signaling molecules in the body, influencing processes like healing, hormone release, immune function, and cellular repair. Many peptides used in research and wellness are synthetic versions of naturally occurring compounds.',
    category: 'General',
  },
  {
    question: 'How do peptides differ from proteins?',
    answer:
      'The main difference is size. Peptides are shorter chains (2-50 amino acids) while proteins are longer (50+ amino acids) and have complex three-dimensional structures. Peptides tend to be more targeted in their action, acting as signaling molecules rather than structural or enzymatic components.',
    category: 'General',
  },
  {
    question: 'Are peptides natural?',
    answer:
      'Many peptides studied today are synthetic versions of naturally occurring compounds. For example, BPC-157 is derived from a protein found in human gastric juice, and CJC-1295 is an analog of naturally occurring growth hormone-releasing hormone (GHRH). The body produces thousands of peptides as part of normal physiology.',
    category: 'General',
  },
  {
    question: 'How are peptides administered?',
    answer:
      'The most common routes are subcutaneous injection (under the skin), intramuscular injection, oral capsules, nasal sprays, and topical creams. Subcutaneous injection is the most widely used method due to its reliable absorption. The optimal route depends on the specific peptide and its intended use.',
    category: 'General',
  },

  // ─── Using the Platform ────────────────────────────────────
  {
    question: 'How do I use the body map?',
    answer:
      'The interactive body map lets you click on any body region to discover peptides that target that area. Click a region (like joints, gut, or brain) to see relevant peptides, their effects, and how they work. You can explore multiple regions to find peptides with overlapping benefits.',
    category: 'Using the Platform',
  },
  {
    question: 'What is peptide stacking?',
    answer:
      'Stacking is the practice of combining two or more peptides in a protocol to achieve synergistic effects. For example, BPC-157 and TB-500 are commonly stacked for enhanced healing, while CJC-1295 and Ipamorelin are stacked for growth hormone optimization. PeptideAtlas provides curated stack suggestions based on research.',
    category: 'Using the Platform',
  },
  {
    question: 'How should I use the comparison tool?',
    answer:
      'The comparison tool lets you select two or more peptides to view side-by-side differences in their mechanisms, effects, dosing, and use cases. This is helpful when choosing between similar peptides or planning a stack.',
    category: 'Using the Platform',
  },
  {
    question: 'What does the synergy score mean?',
    answer:
      'The synergy score is a calculated value that represents how well two or more peptides complement each other when used together. It considers overlapping mechanisms, shared target tissues, and combined effect profiles. Higher scores indicate stronger potential synergy based on available research.',
    category: 'Using the Platform',
  },

  // ─── Safety ────────────────────────────────────────────────
  {
    question: 'Are peptides safe?',
    answer:
      'Many peptides have favorable safety profiles in preclinical research, but safety depends on the specific peptide, dosage, duration, and individual health factors. Most research peptides have not undergone full FDA clinical trials. Always consult a qualified healthcare provider before using any peptide.',
    category: 'Safety',
  },
  {
    question: 'What are the common side effects of peptides?',
    answer:
      'Side effects vary by peptide but may include injection site reactions (redness, swelling), headaches, nausea, flushing, water retention, and fatigue. Growth hormone-releasing peptides may cause increased hunger. Serious side effects are less common but can occur. Proper dosing and medical supervision reduce risk.',
    category: 'Safety',
  },
  {
    question: 'Who should avoid peptides?',
    answer:
      'Pregnant or breastfeeding individuals, people with active cancer or a history of cancer, those with autoimmune conditions (certain peptides), and individuals on immunosuppressive therapy should exercise extreme caution or avoid peptides entirely. Always consult a physician before starting any protocol.',
    category: 'Safety',
  },

  // ─── Legal ─────────────────────────────────────────────────
  {
    question: 'Are peptides legal?',
    answer:
      'The legal status of peptides varies by country and jurisdiction. In the United States, many peptides are sold as research chemicals and are legal to purchase for research purposes. However, the FDA has taken action against certain peptides being marketed for human use without approval. PeptideAtlas is an educational platform and does not sell or endorse the purchase of any peptides.',
    category: 'Legal',
  },
  {
    question: 'Do I need a prescription for peptides?',
    answer:
      'Some peptides can be obtained through licensed compounding pharmacies with a valid prescription from a healthcare provider. Others are sold as research chemicals. The regulatory landscape is evolving. We strongly recommend working with a knowledgeable physician if you are considering peptide use.',
    category: 'Legal',
  },
  {
    question:
      'Does PeptideAtlas sell peptides or provide medical advice?',
    answer:
      'No. PeptideAtlas is a purely educational and informational platform. We do not sell, distribute, or recommend the purchase of peptides. We do not provide medical advice, diagnosis, or treatment. All content is intended for educational purposes only. Consult a healthcare professional for personalized guidance.',
    category: 'Legal',
  },
];
