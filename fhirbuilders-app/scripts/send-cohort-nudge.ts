/**
 * scripts/send-cohort-nudge.ts
 *
 * Send a "sign in once before Monday" nudge email to every Cohort 00 builder
 * who has NOT signed into fhirbuilders.com yet (User.firstSignInAt IS NULL).
 *
 * Usage:
 *   cd fhirbuilders-app
 *   DATABASE_URL=$(grep ^DATABASE_URL .env.local | sed 's/^DATABASE_URL=//' | tr -d '"') \
 *   RESEND_API_KEY=$(grep ^RESEND_API_KEY .env.local | sed 's/^RESEND_API_KEY=//' | tr -d '"') \
 *   npx tsx scripts/send-cohort-nudge.ts                  # dry-run (prints recipients, no send)
 *   npx tsx scripts/send-cohort-nudge.ts --send           # actually send
 *   npx tsx scripts/send-cohort-nudge.ts --send --include-all  # include builders who HAVE signed in
 *
 * Idempotency: safe to re-run. The Resend send still fires, but the calendar
 * invite + Slack invite already gave them all this content — a second nudge
 * lands as "friendly reminder," not "did the first one fail."
 *
 * Sender domain (notifications@fhirbuilders.com) is the same Resend-verified
 * sender NextAuth uses for magic links, so deliverability matches our auth flow.
 */

import { PrismaClient } from "@prisma/client";
import { COHORT_00 } from "../src/lib/cohort/cohort-00";

const DRY_RUN = !process.argv.includes("--send");
const INCLUDE_ALL = process.argv.includes("--include-all");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = "FHIRBuilders <notifications@fhirbuilders.com>";
const REPLY_TO = "eugene.vestel@gmail.com";
const ALWAYS_CC = { name: "Eugene Vestel", email: "eugene.vestel@gmail.com" };
const HOME_URL = "https://fhirbuilders.com/cohort/cohort-00";
const LOGIN_URL = "https://fhirbuilders.com/login?callbackUrl=%2Fcohort%2Fcohort-00";
const COMMUNITY_URL = "https://fhirbuilders.com/cohort/cohort-00/community";
const PREREQS_URL = "https://fhirbuilders.com/cohort/cohort-00/prereqs";
const SLACK_INVITE =
  "https://join.slack.com/t/fhirbuilders/shared_invite/zt-405j5tykg-T9v8~nNaX9tFZZgzaj37Ow";
const SESSION_1_MEET = "https://meet.google.com/cjr-azsx-udq";

const SUBJECT = "Mon 1pm ET — sign in once before Session 1 (90 sec)";

function bodyHtml(firstName: string): string {
  return `<p>Hi ${firstName},</p>

<p>Quick nudge before <strong>Cohort 00 — Session 1 on Monday at 1pm ET</strong>:</p>

<p>Take 90 seconds and sign into <a href="${LOGIN_URL}">fhirbuilders.com/cohort/cohort-00</a>
once. Magic link, no password. This is where everything lives for the 6 weeks —
pre-flight checklist, your pod, recordings, NotebookLM, weekly commitments.</p>

<p><strong>What you'll find when you're in:</strong></p>
<ul>
  <li>Your pod (3–4 builders, themed by what you're building — see the <a href="${COMMUNITY_URL}">community page</a>)</li>
  <li>Pre-flight checklist — <a href="${PREREQS_URL}">${PREREQS_URL}</a></li>
  <li>Session 1 syllabus + NotebookLM (linked from the home tab)</li>
</ul>

<p><strong>Monday's Google Meet:</strong> <a href="${SESSION_1_MEET}">${SESSION_1_MEET}</a>
(also in your calendar invite — accept it if you haven't yet)</p>

<p><strong>Stuck?</strong> Reply to this email, or drop in #help-build on Slack:
<a href="${SLACK_INVITE}">${SLACK_INVITE}</a></p>

<p>See you Monday.<br>
— Eugene</p>

<p style="color:#888;font-size:12px;margin-top:32px">
You're getting this because you signed up for FHIR IQ Cohort 00. If something
looks wrong, just hit reply.
</p>`;
}

function bodyText(firstName: string): string {
  return `Hi ${firstName},

Quick nudge before Cohort 00 — Session 1 on Monday at 1pm ET:

Take 90 seconds and sign into fhirbuilders.com/cohort/cohort-00 once. Magic
link, no password.

Sign in: ${LOGIN_URL}
Home:    ${HOME_URL}

What you'll find when you're in:
- Your pod (3–4 builders, themed by what you're building) — ${COMMUNITY_URL}
- Pre-flight checklist — ${PREREQS_URL}
- Session 1 syllabus + NotebookLM (linked from the home tab)

Monday's Google Meet: ${SESSION_1_MEET}
(Also in your calendar invite — accept it if you haven't yet)

Stuck? Reply to this email, or drop in #help-build on Slack:
${SLACK_INVITE}

See you Monday.
— Eugene
`;
}

function firstNameOf(fullName: string): string {
  return fullName.split(" ")[0] ?? "there";
}

async function send(to: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: REPLY_TO,
      subject: SUBJECT,
      html: bodyHtml(firstNameOf(name)),
      text: bodyText(firstNameOf(name)),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    return { ok: false, error: `${res.status} ${t}` };
  }
  return { ok: true };
}

async function main() {
  if (!DRY_RUN && !RESEND_API_KEY) {
    console.error("RESEND_API_KEY is required for --send. Aborting.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const signupEmails = COHORT_00.signups.map((s) => s.email.toLowerCase());
    const users = await prisma.user.findMany({
      where: { email: { in: signupEmails, mode: "insensitive" } },
      select: { email: true, firstSignInAt: true },
    });
    const signedIn = new Set(
      users
        .filter((u) => !!u.firstSignInAt)
        .map((u) => u.email?.toLowerCase()),
    );

    const filtered = COHORT_00.signups.filter((s) =>
      INCLUDE_ALL ? true : !signedIn.has(s.email.toLowerCase()),
    );
    const alreadyIncluded = filtered.some(
      (s) => s.email.toLowerCase() === ALWAYS_CC.email.toLowerCase(),
    );
    const recipients = alreadyIncluded ? filtered : [ALWAYS_CC, ...filtered];

    console.log(
      `Cohort 00: ${COHORT_00.signups.length} signups, ${signedIn.size} already signed in.`,
    );
    console.log(
      `Nudging ${recipients.length} ${INCLUDE_ALL ? "(everyone)" : "(never-signed-in)"}:`,
    );
    for (const r of recipients) {
      console.log(`  - ${r.name.padEnd(34)}  ${r.email}`);
    }

    if (DRY_RUN) {
      console.log("\n[DRY RUN] No emails sent. Re-run with --send to actually fire.");
      return;
    }

    let ok = 0,
      fail = 0;
    for (const r of recipients) {
      const result = await send(r.email, r.name);
      if (result.ok) {
        ok++;
        console.log(`  sent  ${r.email}`);
      } else {
        fail++;
        console.error(`  FAIL  ${r.email}  ${result.error}`);
      }
      // Resend has generous rate limits but be polite
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    console.log(`\nDone. sent=${ok} failed=${fail}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
