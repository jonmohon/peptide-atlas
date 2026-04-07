import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | PeptideAtlas',
  description: 'PeptideAtlas privacy policy — how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold text-white">Privacy Policy</h1>
      <p className="mb-8 text-sm text-white/40">
        Last updated: April 1, 2026
      </p>

      <div className="space-y-8 text-white/60 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1">
        <section>
          <h2>Introduction</h2>
          <p>
            PeptideAtlas (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
            operates the PeptideAtlas website (peptideatlas.com). This Privacy
            Policy explains how we collect, use, and protect your information
            when you use our platform.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <p>
            PeptideAtlas is designed to be a privacy-friendly platform. We
            collect minimal data:
          </p>
          <ul>
            <li>
              <strong className="text-white">Usage Analytics:</strong> Anonymous
              page view data, device type, and browser information to improve our
              platform.
            </li>
            <li>
              <strong className="text-white">Cookies:</strong> Essential cookies
              for site functionality (e.g., theme preferences). We do not use
              tracking cookies for advertising.
            </li>
            <li>
              <strong className="text-white">Voluntarily Provided:</strong> If
              you contact us via email or feedback forms, we receive the
              information you provide.
            </li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <ul>
            <li>To improve and maintain the PeptideAtlas platform</li>
            <li>To analyze usage patterns and optimize the user experience</li>
            <li>To respond to inquiries and support requests</li>
          </ul>
          <p>
            We do not sell, rent, or trade your personal information to third
            parties.
          </p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>
            We may use third-party analytics services (such as privacy-focused
            analytics tools) to understand how visitors use our site. These
            services collect anonymous, aggregated data and do not track
            individual users across sites.
          </p>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>
            We implement reasonable security measures to protect any data we
            collect. However, no method of transmission over the internet is
            100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>Children&apos;s Privacy</h2>
          <p>
            PeptideAtlas is not intended for individuals under 18 years of age.
            We do not knowingly collect information from children.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a
              href="mailto:privacy@peptideatlas.com"
              className="text-[#00d4ff] hover:underline"
            >
              privacy@peptideatlas.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
