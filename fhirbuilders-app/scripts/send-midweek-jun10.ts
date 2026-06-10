/**
 * scripts/send-midweek-jun10.ts
 * Mid-week update — office hours tomorrow, WhatsApp, funny quote, ping if stuck.
 */

import { COHORT_00 } from "../src/lib/cohort/cohort-00";

const DRY_RUN = !process.argv.includes("--send");
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const FROM = "FHIRBuilders <notifications@fhirbuilders.com>";
const REPLY_TO = "eugene.vestel@gmail.com";
const ALWAYS_CC = { name: "Eugene Vestel", email: "eugene.vestel@gmail.com" };

const SUBJECT = "Mid-week check-in — office hours tomorrow + WhatsApp is live";

const OFFICE_HOURS_TIME = "Wednesday Jun 11, 3pm–4pm ET";
const MEET_URL = "https://meet.google.com/cjr-azsx-udq";
const WHATSAPP_URL = "https://chat.whatsapp.com/KOa1NDyniUZGtrQqoVL3JQ?mode=gi_t";
const COHORT_URL = "https://fhirbuilders.com/cohort/cohort-00";
const SLACK_INVITE = "https://join.slack.com/t/fhirbuilders/shared_invite/zt-405j5tykg-T9v8~nNaX9tFZZgzaj37Ow";

function bodyHtml(firstName: string): string {
  return `<p>Hi ${firstName},</p>

<blockquote style="border-left:3px solid #e2e8f0;padding-left:16px;color:#64748b;font-style:italic;margin:16px 0">
  "Move fast and don't break the EHR."
</blockquote>

<p>Two days in. How's it going? If you've opened Claude Code at least once since Monday, you're ahead of the curve. If you haven't — that's what tomorrow's office hours are for.</p>

<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">

<p><strong>🕒 Office hours — tomorrow</strong><br>
<strong>${OFFICE_HOURS_TIME}</strong> · drop-in, no agenda, bring questions<br>
<a href="${MEET_URL}">${MEET_URL}</a><br>
Same link as the session. Show up, share your screen, get unstuck. No prep needed.</p>

<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">

<p><strong>📱 WhatsApp community is live</strong><br>
For quick async updates and direct access between sessions:<br>
<a href="${WHATSAPP_URL}">${WHATSAPP_URL}</a></p>

<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">

<p><strong>Building with other people works.</strong> Check your pod on the community page, find what your pod-mates are building, and start a thread. The best projects in this cohort will be the ones that borrowed an idea from someone two pods over.</p>

<p><strong>Stuck on anything?</strong> Reply to this email or drop it in #help-build on Slack — I check both. Don't sit on a blocker for more than a day.</p>

<p><a href="${SLACK_INVITE}">Join Slack</a> · <a href="${COHORT_URL}">Cohort home</a></p>

<p>See you tomorrow.<br>
— Eugene</p>

<p style="color:#888;font-size:12px;margin-top:32px">
FHIR IQ Cohort 00 · <a href="${COHORT_URL}">fhirbuilders.com/cohort/cohort-00</a>
</p>`;
}

function bodyText(firstName: string): string {
  return `Hi ${firstName},

"Move fast and don't break the EHR."

Two days in. How's it going? If you've opened Claude Code at least once since Monday, you're ahead of the curve.

────────────────────────────────────
Office hours — tomorrow
${OFFICE_HOURS_TIME} · drop-in, no agenda
${MEET_URL}

Same Meet link as the session. Bring questions, share your screen, get unstuck.

────────────────────────────────────
WhatsApp community is live
Quick async updates between sessions:
${WHATSAPP_URL}

────────────────────────────────────

Building with other people works. Check your pod on the community page and find what your pod-mates are building.

Stuck on anything? Reply here or drop it in #help-build on Slack. Don't sit on a blocker for more than a day.

Slack: ${SLACK_INVITE}
Cohort home: ${COHORT_URL}

See you tomorrow.
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
    console.error("RESEND_API_KEY required. Aborting.");
    process.exit(1);
  }

  const alreadyIncluded = COHORT_00.signups.some(
    (s) => s.email.toLowerCase() === ALWAYS_CC.email.toLowerCase(),
  );
  const recipients = alreadyIncluded ? COHORT_00.signups : [ALWAYS_CC, ...COHORT_00.signups];

  console.log(`\nMid-week update — ${recipients.length} recipients:`);
  console.log(`Subject: "${SUBJECT}"\n`);
  for (const r of recipients) console.log(`  ${r.name.padEnd(34)}  ${r.email}`);
  console.log();

  if (DRY_RUN) {
    console.log("[DRY RUN] Re-run with --send to fire.");
    return;
  }

  let ok = 0, fail = 0;
  for (const r of recipients) {
    const result = await send(r.email, r.name);
    if (result.ok) { ok++; console.log(`  sent  ${r.email}`); }
    else { fail++; console.error(`  FAIL  ${r.email}  ${result.error}`); }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  console.log(`\nDone. sent=${ok} failed=${fail}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
