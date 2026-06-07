/**
 * scripts/send-session1-notify.ts
 *
 * Session 1 announcement email — sent to all 18 Cohort 00 builders the day
 * before the session. Different from send-cohort-nudge.ts (which targets
 * non-signed-in builders only). This goes to everyone and focuses on:
 *   - Session details + Meet link
 *   - New Study Guide (10-block learn page)
 *   - Pre-flight checklist reminder
 *
 * Usage:
 *   cd fhirbuilders-app
 *   RESEND_API_KEY=$(grep ^RESEND_API_KEY .env.local | sed 's/^RESEND_API_KEY=//' | tr -d '"') \
 *   npx tsx scripts/send-session1-notify.ts              # dry-run (prints plan, no send)
 *   npx tsx scripts/send-session1-notify.ts --send       # actually fire
 */

import { COHORT_00 } from "../src/lib/cohort/cohort-00";

const DRY_RUN = !process.argv.includes("--send");
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const FROM = "FHIRBuilders <notifications@fhirbuilders.com>";
const REPLY_TO = "eugene.vestel@gmail.com";
const ALWAYS_CC = { name: "Eugene Vestel", email: "eugene.vestel@gmail.com" };

const SESSION_1_MEET = "https://meet.google.com/cjr-azsx-udq";
const STUDY_GUIDE_URL = "https://fhirbuilders.com/cohort/cohort-00/session-1/learn";
const SESSION_1_URL = "https://fhirbuilders.com/cohort/cohort-00/session-1";
const PREREQS_URL = "https://fhirbuilders.com/cohort/cohort-00/prereqs";
const LOGIN_URL = "https://fhirbuilders.com/login?callbackUrl=%2Fcohort%2Fcohort-00";
const SLACK_INVITE = "https://join.slack.com/t/fhirbuilders/shared_invite/zt-405j5tykg-T9v8~nNaX9tFZZgzaj37Ow";
const NOTEBOOK_LM_URL = "https://notebooklm.google.com/notebook/3e2285b5-07e1-405d-9887-6b737d64bb5a";

const SUBJECT = "Session 1 tomorrow — Mon Jun 8, 1pm ET · Meet link + Study Guide";

function bodyHtml(firstName: string): string {
  return `<p>Hi ${firstName},</p>

<p>Session 1 is <strong>tomorrow, Monday June 8 at 1pm ET</strong>.</p>

<p><strong>Google Meet:</strong> <a href="${SESSION_1_MEET}">${SESSION_1_MEET}</a><br>
Duration: 90 minutes. Mandatory live session.</p>

<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">

<p><strong>📚 New: Session 1 Study Guide</strong></p>

<p>I put together a 10-block reference for everything we're covering tomorrow — objectives,
FAQ, code examples, and one thing to try for each topic. Spend 15 minutes browsing it
before the call and you'll get a lot more out of the session.</p>

<p><a href="${STUDY_GUIDE_URL}" style="font-size:15px;font-weight:bold">${STUDY_GUIDE_URL}</a></p>

<p>The 10 blocks:</p>
<ol style="line-height:1.8">
  <li>Claude Code basics</li>
  <li>Starter skills (FHIR IQ skill pack)</li>
  <li>Managing usage — credits and models</li>
  <li>Auto mode</li>
  <li>Projects + GitHub repos</li>
  <li>Connect Vercel</li>
  <li>Agentic dev stack (Supabase, Railway, Resend…)</li>
  <li>Claude API · MCP · CLI principles</li>
  <li>Security zone</li>
  <li>Claude Design + special tools</li>
</ol>

<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">

<p><strong>Before tomorrow:</strong></p>
<ul style="line-height:1.8">
  <li>Sign into the cohort home (if you haven't): <a href="${LOGIN_URL}">${LOGIN_URL}</a></li>
  <li>Complete the pre-flight checklist: <a href="${PREREQS_URL}">${PREREQS_URL}</a></li>
  <li>Browse the Study Guide: <a href="${STUDY_GUIDE_URL}">${STUDY_GUIDE_URL}</a></li>
  <li>Open the NotebookLM AI tutor for Session 1: <a href="${NOTEBOOK_LM_URL}">${NOTEBOOK_LM_URL}</a></li>
</ul>

<p><strong>Questions before Monday?</strong> Drop in #help-build on Slack:
<a href="${SLACK_INVITE}">${SLACK_INVITE}</a></p>

<p>See you at 1pm.<br>— Eugene</p>

<p style="color:#888;font-size:12px;margin-top:32px">
You're getting this because you're registered for FHIR IQ Cohort 00. Reply to this email
if anything looks wrong.
</p>`;
}

function bodyText(firstName: string): string {
  return `Hi ${firstName},

Session 1 is tomorrow, Monday June 8 at 1pm ET.

Google Meet: ${SESSION_1_MEET}
Duration: 90 minutes. Mandatory live session.

────────────────────────────────────────────────────
📚 NEW: Session 1 Study Guide
────────────────────────────────────────────────────

10-block reference covering everything in tomorrow's session — objectives,
FAQ, code examples, one thing to try per topic. Spend 15 minutes here before
the call:

${STUDY_GUIDE_URL}

The 10 blocks:
  1. Claude Code basics
  2. Starter skills (FHIR IQ skill pack)
  3. Managing usage — credits and models
  4. Auto mode
  5. Projects + GitHub repos
  6. Connect Vercel
  7. Agentic dev stack (Supabase, Railway, Resend…)
  8. Claude API · MCP · CLI principles
  9. Security zone
  10. Claude Design + special tools

────────────────────────────────────────────────────
Before tomorrow:
────────────────────────────────────────────────────

• Sign in (if you haven't): ${LOGIN_URL}
• Pre-flight checklist:     ${PREREQS_URL}
• Study Guide:              ${STUDY_GUIDE_URL}
• NotebookLM AI tutor:      ${NOTEBOOK_LM_URL}

Questions before Monday? Drop in #help-build on Slack:
${SLACK_INVITE}

See you at 1pm.
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

  const alreadyIncluded = COHORT_00.signups.some(
    (s) => s.email.toLowerCase() === ALWAYS_CC.email.toLowerCase(),
  );
  const recipients = alreadyIncluded
    ? COHORT_00.signups
    : [ALWAYS_CC, ...COHORT_00.signups];

  console.log(`\nSession 1 announcement — ${recipients.length} recipients:`);
  console.log(`Subject: "${SUBJECT}"\n`);
  for (const r of recipients) {
    console.log(`  ${r.name.padEnd(34)}  ${r.email}`);
  }
  console.log();

  if (DRY_RUN) {
    console.log("[DRY RUN] No emails sent. Re-run with --send to fire.");
    console.log(`\nStudy Guide URL that will be in the email:\n  ${STUDY_GUIDE_URL}`);
    return;
  }

  let ok = 0, fail = 0;
  for (const r of recipients) {
    const result = await send(r.email, r.name);
    if (result.ok) {
      ok++;
      console.log(`  sent  ${r.email}`);
    } else {
      fail++;
      console.error(`  FAIL  ${r.email}  ${result.error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  console.log(`\nDone. sent=${ok} failed=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
