/**
 * One-off: Session 2 heads-up email — sent the evening before.
 */

import { COHORT_00 } from "../src/lib/cohort/cohort-00";

const DRY_RUN = !process.argv.includes("--send");
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const FROM       = "FHIRBuilders <notifications@fhirbuilders.com>";
const REPLY_TO   = "eugene.vestel@gmail.com";
const ALWAYS_CC  = { name: "Eugene Vestel", email: "eugene.vestel@gmail.com" };
const SUBJECT    = "Session 2 tomorrow — MCP servers + vector DB · Mon Jun 15 · 1pm ET";

const MEET       = "https://meet.google.com/cjr-azsx-udq";
const SESSION_2  = "https://fhirbuilders.com/cohort/cohort-00/session-2";
const STUDY_2    = "https://fhirbuilders.com/cohort/cohort-00/session-2/learn";

function bodyHtml(firstName: string): string {
  return `<p>Hi ${firstName},</p>

<p>Session 2 is tomorrow — <strong>Monday June 15 at 1pm ET</strong>.</p>

<p><strong>Topic: MCP servers + vector DB</strong><br>
Live FHIR hands for your agent. We'll build an MCP server that reads real patient data,
wire up semantic search over clinical notes, and cover when a knowledge graph beats a vector store.</p>

<p><strong>What to have open:</strong></p>
<ul>
  <li>Session 2 overview: <a href="${SESSION_2}">${SESSION_2}</a></li>
  <li>Study guide (skim blocks 1–3 before we start): <a href="${STUDY_2}">${STUDY_2}</a></li>
  <li>Join link: <a href="${MEET}">${MEET}</a></li>
</ul>

<p><strong>Stack we'll touch:</strong> FastMCP · Medplum FHIR · pgvector · Supabase · Graphiti · Synthea</p>

<p>If you didn't finish a Vercel deploy from Session 1 — that's fine, bring what you have.
The MCP work today doesn't require a deployed frontend.</p>

<p>See you at 1pm.<br>
— Eugene</p>

<p style="color:#888;font-size:12px;margin-top:32px">
FHIR IQ Cohort 00 · <a href="https://fhirbuilders.com/cohort/cohort-00">fhirbuilders.com/cohort/cohort-00</a>
</p>`;
}

function bodyText(firstName: string): string {
  return `Hi ${firstName},

Session 2 is tomorrow — Monday June 15 at 1pm ET.

Topic: MCP servers + vector DB
Live FHIR hands for your agent. We'll build an MCP server that reads real patient data,
wire up semantic search over clinical notes, and cover when a knowledge graph beats a vector store.

What to have open:
  Session 2 overview: ${SESSION_2}
  Study guide (skim blocks 1–3 before we start): ${STUDY_2}
  Join: ${MEET}

Stack we'll touch: FastMCP · Medplum FHIR · pgvector · Supabase · Graphiti · Synthea

If you didn't finish a Vercel deploy from Session 1 — that's fine, bring what you have.
The MCP work today doesn't require a deployed frontend.

See you at 1pm.
— Eugene
`;
}

function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? "there";
}

async function send(to: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: REPLY_TO,
      subject: SUBJECT,
      html: bodyHtml(firstName(name)),
      text: bodyText(firstName(name)),
    }),
  });
  if (!res.ok) return { ok: false, error: `${res.status} ${await res.text()}` };
  return { ok: true };
}

async function main() {
  if (!DRY_RUN && !RESEND_API_KEY) { console.error("RESEND_API_KEY required."); process.exit(1); }

  const alreadyIncluded = COHORT_00.signups.some(
    (s) => s.email.toLowerCase() === ALWAYS_CC.email.toLowerCase(),
  );
  const recipients = alreadyIncluded ? COHORT_00.signups : [ALWAYS_CC, ...COHORT_00.signups];

  console.log(`\nSession 2 heads-up — ${recipients.length} recipients:`);
  console.log(`Subject: "${SUBJECT}"\n`);
  for (const r of recipients) console.log(`  ${r.name.padEnd(34)}  ${r.email}`);
  console.log();

  if (DRY_RUN) { console.log("[DRY RUN] Re-run with --send to fire."); return; }

  let ok = 0, fail = 0;
  for (const r of recipients) {
    const result = await send(r.email, r.name);
    if (result.ok) { ok++; console.log(`  sent  ${r.email}`); }
    else { fail++; console.error(`  FAIL  ${r.email}  ${result.error}`); }
    await new Promise((res) => setTimeout(res, 150));
  }
  console.log(`\nDone. sent=${ok} failed=${fail}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
