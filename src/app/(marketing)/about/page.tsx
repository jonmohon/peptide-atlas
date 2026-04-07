import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | PeptideAtlas',
  description:
    'Learn about PeptideAtlas — an interactive educational platform for exploring the science of peptides.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
          About PeptideAtlas
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/50">
          Making peptide science accessible, visual, and understandable for
          everyone.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
        <h2 className="mb-4 text-2xl font-semibold text-[#00d4ff]">
          Our Mission
        </h2>
        <p className="leading-relaxed text-white/60">
          PeptideAtlas exists to bridge the gap between complex peptide research
          and practical understanding. The world of peptides is rich with
          scientific potential, but the information is often scattered across
          dense research papers, forums, and unreliable sources. We built
          PeptideAtlas to organize, visualize, and present peptide science in a
          way that is accurate, engaging, and genuinely useful.
        </p>
      </section>

      {/* What We Are */}
      <section className="mb-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
        <h2 className="mb-4 text-2xl font-semibold text-[#00ff88]">
          What PeptideAtlas Is
        </h2>
        <p className="mb-4 leading-relaxed text-white/60">
          PeptideAtlas is a free, interactive educational platform for exploring
          the science of peptides. It is designed for researchers, students,
          health-conscious individuals, and anyone curious about how peptides
          work in the human body.
        </p>
        <p className="leading-relaxed text-white/60">
          We are not a supplement store, pharmacy, or medical practice. We do not
          sell peptides, provide prescriptions, or offer medical advice. Every
          piece of content on PeptideAtlas is intended purely for educational
          purposes.
        </p>
      </section>

      {/* Platform Features */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-semibold text-white">
          Platform Features
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            {
              title: 'Interactive Body Map',
              description:
                'Click any body region to discover peptides that target that area. Visualize where peptides act and understand their tissue-specific effects.',
              color: '#00d4ff',
            },
            {
              title: 'Peptide Profiles',
              description:
                'Detailed profiles for each peptide covering mechanisms, effects, dosing ranges, research status, and safety considerations.',
              color: '#00ff88',
            },
            {
              title: 'Stack Builder',
              description:
                'Explore curated peptide stacks with synergy scores, or build your own combinations to understand how peptides work together.',
              color: '#ff6b35',
            },
            {
              title: 'Comparison Tool',
              description:
                'Compare peptides side-by-side to understand differences in mechanism, effects, and use cases for informed decision-making.',
              color: '#00d4ff',
            },
            {
              title: 'Educational Articles',
              description:
                'In-depth guides, safety information, and explainers written to make peptide science approachable without oversimplifying.',
              color: '#00ff88',
            },
            {
              title: 'Glossary & FAQ',
              description:
                'A comprehensive glossary of peptide terminology and answers to the most common questions about peptides and the platform.',
              color: '#ff6b35',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <h3
                className="mb-2 text-lg font-semibold"
                style={{ color: feature.color }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/50">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Educational Disclaimer */}
      <section className="rounded-2xl border border-[#ff6b35]/20 bg-[#ff6b35]/[0.04] p-8">
        <h2 className="mb-4 text-xl font-semibold text-[#ff6b35]">
          Educational Purpose
        </h2>
        <p className="leading-relaxed text-white/60">
          All information on PeptideAtlas is provided for educational and
          informational purposes only. It should not be interpreted as medical
          advice, endorsement of peptide use, or a substitute for professional
          healthcare guidance. Peptide research is ongoing, and findings may
          change as new studies emerge. Always consult a qualified healthcare
          professional before making any decisions about your health.
        </p>
      </section>
    </div>
  );
}
