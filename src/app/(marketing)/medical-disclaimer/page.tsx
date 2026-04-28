import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical Disclaimer | PeptideAtlas',
  description:
    'PeptideAtlas is an educational tool. The information here is not medical advice — read the full medical disclaimer.',
};

export default function MedicalDisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <article className="prose prose-invert max-w-none">
        <h1>Medical Disclaimer</h1>
        <p className="lead text-text-secondary">
          PeptideAtlas is an educational research and tracking tool. The information presented
          here — including peptide profiles, AI-generated responses, protocol suggestions, and
          bloodwork interpretations — is provided strictly for educational purposes. It is not
          medical advice, diagnosis, or treatment.
        </p>

        <h2>Not a substitute for professional medical advice</h2>
        <p>
          Always seek the advice of a licensed healthcare professional with any questions you
          may have regarding a medical condition, medication, or new protocol. Never disregard
          professional medical advice or delay in seeking it because of something you have read
          or generated using PeptideAtlas. Many of the peptides referenced in this app are not
          FDA-approved for human use and may be illegal to obtain or possess in your
          jurisdiction.
        </p>

        <h2>AI-generated responses</h2>
        <p>
          PeptideAtlas uses large language models to generate personalized educational
          responses. AI systems can produce errors — incorrect dose ranges, missed
          contraindications, factual inaccuracies in mechanism. Verify every recommendation
          with your clinician before acting on it. Do not use AI-generated output as the basis
          for medical decisions.
        </p>

        <h2>Citations and accuracy</h2>
        <p>
          We track the source of every claim in our peptide catalog and surface a confidence
          badge ("Verified", "Sourced", "Needs review") on each entry. We continuously audit
          our data and remove citations that cannot be verified against PubMed. If you find an
          error, please email{' '}
          <a href="mailto:support@peptide-atlas.com">support@peptide-atlas.com</a>.
        </p>

        <h2>Emergencies</h2>
        <p>
          Do not use PeptideAtlas for medical emergencies. If you think you may have a medical
          emergency, call your local emergency number or go to the nearest emergency
          department immediately.
        </p>

        <h2>Bloodwork features</h2>
        <p>
          The bloodwork tracking and AI interpretation tools are educational. They do not
          diagnose any condition, do not prescribe treatment, and do not replace consultation
          with a licensed clinician who knows your full medical history. Always discuss
          bloodwork findings with your provider.
        </p>

        <h2>Reconstitution reference</h2>
        <p>
          Our reconstitution reference performs basic arithmetic (vial size + diluent volume →
          concentration + units on a U-100 syringe). It does not prescribe doses and is not a
          drug-dose calculator. Verify all values with a licensed pharmacist or clinician
          before any injection. Never inject anything you have not personally confirmed with a
          qualified healthcare professional.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          By using PeptideAtlas, you acknowledge that you are using the information at your
          own risk. PeptideAtlas, its operators, and its contributors disclaim any and all
          liability for decisions or actions taken based on information from this app or
          website. See the{' '}
          <a href="/terms">Terms of Service</a> for the complete legal terms.
        </p>

        <p className="mt-8 text-sm text-text-muted">Last updated: April 28, 2026.</p>
      </article>
    </div>
  );
}
