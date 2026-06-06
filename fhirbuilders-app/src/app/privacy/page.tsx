import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What FHIRBuilders collects, why, where it lives, and what we don't do. Plain English.",
};

const LAST_UPDATED = "2026-06-05";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
      <header className="mb-10 border-b border-slate-200 pb-6">
        <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">Privacy policy</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          What we collect, why, and what we don&apos;t do.
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
          FHIRBuilders is a marketplace + sandbox for healthcare AI builders. We collect the
          minimum we need to run the product:
        </p>
        <ul>
          <li>
            <strong>Your account:</strong> name, email, profile image, GitHub username if you
            sign in with GitHub.
          </li>
          <li>
            <strong>What you create:</strong> projects, comments, upvotes, AI-generated apps you
            choose to share.
          </li>
          <li>
            <strong>Sign-in tracking:</strong> the timestamp of your first and most recent
            sign-in, plus a count. Used only for admin views of cohort participation.
          </li>
        </ul>
        <p>
          We do <strong>not</strong> sell your data. We do <strong>not</strong> embed
          third-party tracking pixels (no Meta Pixel, no Google Analytics scripts, no LinkedIn
          tags). We do <strong>not</strong> handle real Protected Health Information (PHI) — the
          FHIR sandboxes we connect to use synthetic patient data only.
        </p>

        <h2>Where your data lives</h2>
        <ul>
          <li>
            <strong>Database:</strong> PostgreSQL on{" "}
            <a href="https://neon.tech" rel="noopener noreferrer" target="_blank">
              Neon
            </a>{" "}
            (US region).
          </li>
          <li>
            <strong>Hosting:</strong> Next.js application on{" "}
            <a href="https://vercel.com" rel="noopener noreferrer" target="_blank">
              Vercel
            </a>
            .
          </li>
          <li>
            <strong>Email:</strong> magic-link sign-in + transactional email via{" "}
            <a href="https://resend.com" rel="noopener noreferrer" target="_blank">
              Resend
            </a>
            .
          </li>
          <li>
            <strong>FHIR data:</strong> we never store real patient data. When you use the
            sandbox, FHIR resources live in your own{" "}
            <a href="https://www.medplum.com" rel="noopener noreferrer" target="_blank">
              Medplum
            </a>{" "}
            project. Medplum sandboxes are pre-loaded with synthetic data from{" "}
            <a href="https://synthetichealth.github.io/synthea/" rel="noopener noreferrer" target="_blank">
              Synthea
            </a>
            .
          </li>
          <li>
            <strong>AI model calls:</strong> when you use OpenClaw or AI features, prompts go to
            Anthropic and/or OpenAI under your own API key (BYOK). We don&apos;t store the
            request/response payload by default — only generation metadata (channel, status,
            timing).
          </li>
        </ul>

        <h2>What we use it for</h2>
        <ul>
          <li>Authenticating you and showing the right pages.</li>
          <li>
            Counting how many builders have signed in (for cohort coordination — see the admin
            roster).
          </li>
          <li>Sending you transactional email (magic links, cohort updates, feedback replies).</li>
          <li>
            Aggregate, anonymized usage stats — &ldquo;X projects shared this week&rdquo; — to
            run the marketplace.
          </li>
        </ul>

        <h2>Sign-in providers</h2>
        <p>
          When you sign in with GitHub or Google, the provider sends us your name, email, and
          profile image. We don&apos;t request additional scopes beyond your public profile +
          email. You can revoke FHIRBuilders&apos; access at any time from your provider&apos;s
          connected-apps settings.
        </p>

        <h2>Cookies</h2>
        <p>
          We set a single first-party cookie for your sign-in session
          (<code>next-auth.session-token</code> or the secure-prefixed variant in production). No
          analytics, advertising, or third-party cookies. The session is stored as a signed JWT —
          we don&apos;t track session activity on the server beyond the sign-in timestamps above.
        </p>

        <h2>Sharing</h2>
        <p>We share data only when:</p>
        <ul>
          <li>
            You publish something publicly (your profile, a project, a comment) — the visible
            fields are public by definition.
          </li>
          <li>
            A service provider runs core infrastructure for us (Neon, Vercel, Resend, OAuth
            providers). They handle data on our behalf under their own DPAs.
          </li>
          <li>
            We&apos;re legally compelled. We&apos;ll tell you when we&apos;re allowed to.
          </li>
        </ul>
        <p>No advertising. No data brokers. No data sale.</p>

        <h2>Your rights</h2>
        <ul>
          <li>
            <strong>Export</strong> — email us and we&apos;ll send you a JSON dump of everything
            we have on your account.
          </li>
          <li>
            <strong>Delete</strong> — email us and we&apos;ll delete your account + everything
            linked to it within 7 days, except where retention is legally required.
          </li>
          <li>
            <strong>Correct</strong> — most fields are editable from your profile; if something
            isn&apos;t, email us.
          </li>
        </ul>

        <h2>Cohort participants</h2>
        <p>
          If you joined Cohort 00 (or a future cohort), your name + what you said
          you&apos;re building is visible to other cohort participants on the
          {" "}<Link className="underline" href="/cohort/cohort-00/community">community page</Link>{" "}
          behind a sign-in. Sign-in timestamps and pod assignments are visible to the cohort
          organizer (Eugene) only.
        </p>
        <p>
          We&apos;ll publish cohort outcomes (project names, demo URLs you choose to share)
          publicly after Demo Day. Nothing tied to your individual sign-in cadence or commitment
          history is ever published.
        </p>

        <h2>Children</h2>
        <p>FHIRBuilders is not directed at children under 16. We don&apos;t knowingly collect data from them.</p>

        <h2>Changes</h2>
        <p>
          If we make a material change to this policy, we&apos;ll bump the &ldquo;last
          updated&rdquo; date at the top and email every signed-up user.
        </p>

        <h2>Contact</h2>
        <p>
          Eugene Vestel — <a className="underline" href="mailto:eugene.vestel@gmail.com">eugene.vestel@gmail.com</a>.
          Operating as an individual, not a corporate entity, as of {LAST_UPDATED}.
        </p>
      </article>

      <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">
        See also: <Link className="underline" href="/security">Security</Link>. Last updated{" "}
        <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>.
      </footer>
    </div>
  );
}
