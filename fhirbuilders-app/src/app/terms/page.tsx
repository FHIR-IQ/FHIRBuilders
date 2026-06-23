import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Healthcare AI Builders. Plain English.",
};

const LAST_UPDATED = "2026-06-22";

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
      <header className="mb-10 border-b border-slate-200 pb-6">
        <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">Terms of service</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Rules for using Healthcare AI Builders.
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Last updated <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>. Plain English. If
          something is unclear, email{" "}
          <a className="underline" href="mailto:eugene.vestel@gmail.com">
            eugene.vestel@gmail.com
          </a>
          .
        </p>
      </header>

      <article className="prose prose-slate max-w-none prose-headings:mt-10 prose-headings:mb-3 prose-h2:text-xl prose-h2:font-semibold prose-p:my-3 prose-li:my-1">
        <h2>The short version</h2>
        <p>
          Healthcare AI Builders (fhirbuilders.com) is a community platform and sandbox for
          healthcare AI builders. By using the site you agree to use it in good faith, share
          responsibly, and not misuse other people&apos;s work.
        </p>

        <h2>Your account</h2>
        <ul>
          <li>You must be a human — no bots creating accounts.</li>
          <li>You are responsible for keeping your account credentials secure.</li>
          <li>
            One account per person. If you need access for a team, contact us.
          </li>
        </ul>

        <h2>Your content</h2>
        <ul>
          <li>
            You own what you create — projects, apps, and comments you post remain yours.
          </li>
          <li>
            By making something public, you grant Healthcare AI Builders a license to display and
            share it on the platform and in community communications (Slack, newsletters). You can
            remove content at any time.
          </li>
          <li>
            Don&apos;t post content that infringes copyright, contains patient-identifiable health
            data (PHI), or is harmful or deceptive.
          </li>
        </ul>

        <h2>Healthcare data and PHI</h2>
        <p>
          This platform is a <strong>sandbox and learning environment</strong> — it is not a
          covered entity under HIPAA and should not be used to store, process, or transmit real
          patient health information. Use synthetic data (e.g., Synthea) for all demos and
          experiments.
        </p>

        <h2>AI-generated content</h2>
        <p>
          The platform uses AI (Claude, OpenAI) to generate code and analyze data. AI output may
          be incorrect, incomplete, or unsuitable for production clinical use. You are responsible
          for reviewing and validating anything AI-generated before deploying it.
        </p>

        <h2>Cohort contributions</h2>
        <p>
          Cohort membership contributions are voluntary and non-refundable. They support session
          planning and tooling — they do not constitute payment for a commercial service or
          guarantee any specific outcome.
        </p>

        <h2>Things we can do</h2>
        <ul>
          <li>Remove content that violates these terms.</li>
          <li>Suspend or terminate accounts that abuse the platform.</li>
          <li>Change these terms with reasonable notice (we&apos;ll post an update).</li>
        </ul>

        <h2>Liability</h2>
        <p>
          Healthcare AI Builders is provided as-is for educational and community purposes. We are
          not liable for decisions made based on content or AI-generated code on this platform. Do
          not use this platform for clinical decision-making.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? Email{" "}
          <a href="mailto:eugene.vestel@gmail.com">eugene.vestel@gmail.com</a>.
        </p>
      </article>
    </div>
  );
}
