/**
 * One-off: thank Cohort 00 builders, ask each for a paragraph of feedback,
 * and announce paid Cohort 01 with their returning-builder rate.
 *
 *   RESEND_API_KEY=... npx tsx scripts/send-cohort01-announce.ts          # dry run
 *   RESEND_API_KEY=... npx tsx scripts/send-cohort01-announce.ts --send
 *
 * Recipients are the 18 Cohort 00 signups (static, no DB needed). CC Eugene.
 */

import { COHORT_00 } from "../src/lib/cohort/cohort-00";

const DRY_RUN = !process.argv.includes("--send");
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const FROM = "Eugene Vestel <notifications@fhirbuilders.com>";
const REPLY_TO = "eugene.vestel@gmail.com";
const CC = "eugene.vestel@gmail.com";
const SUBJECT = "Thank you for Cohort 00, and what comes next";

// Keep in sync with COHORT_01_PRICING in src/lib/stripe.ts.
const PRICE = { fullStd: 1000, weeklyStd: 99, fullRepeat: 600, weeklyRepeat: 59 };
const URL = "https://fhirbuilders.com/cohort-01";

function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? "there";
}

function bodyText(name: string): string {
  return `Hi ${firstName(name)},

Cohort 00 wrapped, and I owe you a real thank you. It was free, it was a pilot, and you showed up to build healthcare AI on live FHIR before any of us knew the format worked. Some of you shipped real things. Gail built a FHIR data-quality app with its own MCP server. Rick went from fighting setup to writing a security review of an open-source guardrail project. That happened because you were in the room.

Two asks, both small.

First: would you write me a paragraph about your experience? What worked, what didn't, and what you'd tell a colleague who asked about it. Rick already sent his and it was gold. Honest helps me more than kind. If you're fine with me quoting you, just say so.

Second: Cohort 01 opens in late August, and it's different. Paid, twelve weeks, built around a live demo every Friday where you show what you shipped that week. You bring your own agents and your own LLM account (Claude, ChatGPT, whatever you run). The community lives on Buzz. Paid on purpose: Cohort 00 taught me that free means optional, and the people with something at stake are the ones who ship.

You get the returning-builder rate: $${PRICE.fullRepeat} for the full twelve weeks, or $${PRICE.weeklyRepeat}/week, against $${PRICE.fullStd} / $${PRICE.weeklyStd} for everyone else. Sign in with this email on the page and the discount applies on its own.

Details and enrollment: ${URL}

Either ask alone means a lot. Thank you for being first.

- Eugene
`;
}

function bodyHtml(name: string): string {
  return `<p>Hi ${firstName(name)},</p>

<p>Cohort 00 wrapped, and I owe you a real thank you. It was free, it was a pilot, and you showed up to build healthcare AI on live FHIR before any of us knew the format worked. Some of you shipped real things. Gail built a FHIR data-quality app with its own MCP server. Rick went from fighting setup to writing a security review of an open-source guardrail project. That happened because you were in the room.</p>

<p><strong>Two asks, both small.</strong></p>

<p><strong>First:</strong> would you write me a paragraph about your experience? What worked, what didn't, and what you'd tell a colleague who asked about it. Rick already sent his and it was gold. Honest helps me more than kind. If you're fine with me quoting you, just say so.</p>

<p><strong>Second:</strong> Cohort 01 opens in late August, and it's different. Paid, twelve weeks, built around a live demo every Friday where you show what you shipped that week. You bring your own agents and your own LLM account (Claude, ChatGPT, whatever you run). The community lives on Buzz. Paid on purpose: Cohort 00 taught me that free means optional, and the people with something at stake are the ones who ship.</p>

<p>You get the returning-builder rate: <strong>$${PRICE.fullRepeat} for the full twelve weeks, or $${PRICE.weeklyRepeat}/week</strong>, against $${PRICE.fullStd} / $${PRICE.weeklyStd} for everyone else. Sign in with this email on the page and the discount applies on its own.</p>

<p><a href="${URL}">Details and enrollment</a></p>

<p>Either ask alone means a lot. Thank you for being first.</p>

<p>- Eugene</p>

<p style="color:#888;font-size:12px;margin-top:32px">
Healthcare AI Builders · <a href="https://fhirbuilders.com/cohort-01">fhirbuilders.com/cohort-01</a> · Reply to unsubscribe.
</p>`;
}

async function send(to: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      cc: [CC],
      reply_to: REPLY_TO,
      subject: SUBJECT,
      html: bodyHtml(name),
      text: bodyText(name),
    }),
  });
  if (!res.ok) return { ok: false, error: `${res.status} ${await res.text()}` };
  return { ok: true };
}

async function main() {
  if (!DRY_RUN && !RESEND_API_KEY) {
    console.error("RESEND_API_KEY required.");
    process.exit(1);
  }

  const recipients = COHORT_00.signups;
  console.log(`\nCohort 01 announce — ${recipients.length} recipients (cc ${CC}):`);
  console.log(`Subject: "${SUBJECT}"\n`);
  for (const r of recipients) console.log(`  ${r.name.padEnd(24)} ${r.email}`);
  console.log(`\n--- body (sample: ${firstName(recipients[0].name)}) ---\n${bodyText(recipients[0].name)}`);

  if (DRY_RUN) {
    console.log("[DRY RUN] Re-run with --send to fire.");
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
    await new Promise((res) => setTimeout(res, 150));
  }
  console.log(`\nDone. sent=${ok} failed=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
