/**
 * scripts/send-office-hours-correction.ts
 * Quick correction — office hours are Thursday Jun 11, not Wednesday.
 */

import { COHORT_00 } from "../src/lib/cohort/cohort-00";

const DRY_RUN = !process.argv.includes("--send");
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const FROM = "FHIRBuilders <notifications@fhirbuilders.com>";
const REPLY_TO = "eugene.vestel@gmail.com";
const ALWAYS_CC = { name: "Eugene Vestel", email: "eugene.vestel@gmail.com" };

const SUBJECT = "Quick fix: office hours are TOMORROW, Thursday Jun 11";
const MEET_URL = "https://meet.google.com/cjr-azsx-udq";

function bodyHtml(firstName: string): string {
  return `<p>Hi ${firstName},</p>

<p>Small correction from my last email — office hours are <strong>tomorrow, Thursday June 11 at 3pm ET</strong> (not Wednesday — my bad).</p>

<p><a href="${MEET_URL}">${MEET_URL}</a><br>
Same link, drop-in, no prep needed.</p>

<p>— Eugene</p>`;
}

function bodyText(firstName: string): string {
  return `Hi ${firstName},

Small correction — office hours are tomorrow, Thursday June 11 at 3pm ET (not Wednesday — my bad).

${MEET_URL}

Same link, drop-in, no prep needed.

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

  console.log(`\nOffice hours correction — ${recipients.length} recipients:`);
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
