import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | PeptideAtlas',
  description: 'PeptideAtlas terms of service and educational disclaimer.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold text-white">Terms of Service</h1>
      <p className="mb-8 text-sm text-white/40">
        Last updated: April 1, 2026
      </p>

      <div className="space-y-8 text-white/60 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1">
        <section>
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using PeptideAtlas (peptideatlas.com), you agree to
            be bound by these Terms of Service. If you do not agree, please do
            not use the platform.
          </p>
        </section>

        <section>
          <h2>Educational Disclaimer</h2>
          <p>
            <strong className="text-[#ff6b35]">
              PeptideAtlas is an educational and informational resource only.
            </strong>
          </p>
          <ul>
            <li>
              All content is for educational purposes and is not intended as
              medical advice, diagnosis, or treatment.
            </li>
            <li>
              We do not sell, distribute, or facilitate the purchase of peptides
              or any controlled substances.
            </li>
            <li>
              We do not endorse, recommend, or encourage the use of any peptide
              for human consumption.
            </li>
            <li>
              Information presented may be based on preclinical or early-stage
              research and should not be taken as established medical fact.
            </li>
            <li>
              Always consult a licensed healthcare professional before making any
              health-related decisions.
            </li>
          </ul>
        </section>

        <section>
          <h2>Use of the Platform</h2>
          <p>You agree to use PeptideAtlas only for lawful purposes. You may:</p>
          <ul>
            <li>Browse and read educational content</li>
            <li>Use interactive tools (body map, comparisons, stacks)</li>
            <li>Share content with proper attribution</li>
          </ul>
          <p>You may not:</p>
          <ul>
            <li>Use content to provide medical advice to others</li>
            <li>
              Scrape, copy, or redistribute content without permission
            </li>
            <li>
              Use the platform for any illegal or unauthorized purpose
            </li>
            <li>
              Misrepresent PeptideAtlas content as medical guidance
            </li>
          </ul>
        </section>

        <section>
          <h2>Intellectual Property</h2>
          <p>
            All content, design, code, and branding on PeptideAtlas are the
            property of PeptideAtlas and its contributors. You may not reproduce,
            distribute, or create derivative works without explicit permission.
          </p>
        </section>

        <section>
          <h2>Accuracy of Information</h2>
          <p>
            We strive to provide accurate and up-to-date information based on
            available research. However, peptide science is a rapidly evolving
            field. We make no warranties about the completeness, accuracy, or
            reliability of any information on the platform.
          </p>
        </section>

        <section>
          <h2>Limitation of Liability</h2>
          <p>
            PeptideAtlas and its contributors shall not be liable for any direct,
            indirect, incidental, consequential, or punitive damages arising from
            your use of the platform or reliance on any information provided.
            Your use of the platform is at your own risk.
          </p>
        </section>

        <section>
          <h2>Third-Party Links</h2>
          <p>
            PeptideAtlas may contain links to external websites or research
            papers. We are not responsible for the content, accuracy, or
            practices of third-party sites.
          </p>
        </section>

        <section>
          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will
            be posted on this page. Continued use of the platform after changes
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For questions about these Terms, contact us at{' '}
            <a
              href="mailto:legal@peptideatlas.com"
              className="text-[#00d4ff] hover:underline"
            >
              legal@peptideatlas.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
