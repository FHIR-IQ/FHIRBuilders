/**
 * One-off: Session 2 follow-up email — recording + next session + keep building message.
 */

import { COHORT_00 } from "../src/lib/cohort/cohort-00";

const DRY_RUN = !process.argv.includes("--send");
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const FROM      = "FHIRBuilders <notifications@fhirbuilders.com>";
const REPLY_TO  = "eugene.vestel@gmail.com";
const ALWAYS_CC = { name: "Eugene Vestel", email: "eugene.vestel@gmail.com" };
const SUBJECT   = "Session 2 recording up · keep building · Session 3 next Monday";

const RECORDING   = "https://drive.google.com/file/d/1tXQS1zZodCtPEx0lrqn_4HLaDMiVMtG0/view";
const TRANSCRIPT  = "https://drive.google.com/file/d/1vzGYP30XFfCDRVgrDb8PB8jZUQP2aecq/view";
const SESSION_2   = "https://fhirbuilders.com/cohort/cohort-00/session-2";
const STUDY_2     = "https://fhirbuilders.com/cohort/cohort-00/session-2/learn";
const MEET        = "https://meet.google.com/cjr-azsx-udq";

function bodyHtml(firstName: string): string {
  return `<p>Hi ${firstName},</p>

<p>Session 2 recording is up:</p>
<ul>
  <li><a href="${RECORDING}">Video recording (Google Drive)</a></li>
  <li><a href="${TRANSCRIPT}">Chat transcript</a></li>
  <li>Session 2 page + study guide: <a href="${SESSION_2}">${SESSION_2}</a></li>
</ul>

<p>The study guide at <a href="${STUDY_2}">/session-2/learn</a> has all 10 blocks — MCP protocol, building your first server, pgvector, Graphiti, Synthea, RAG pipeline, PHI redaction. Worth working through even if you missed the live session.</p>

<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">

<p><strong>The message this week:</strong> you don't need to learn everything before you start. That's actually the point. Just keep going with Claude Code — open a session, ask it to help you build one small thing, and learn from what happens. You'll pick it up ten times faster than reading docs upfront. Every builder who's shipped something in this cohort did it by starting before they were ready.</p>

<p>If you haven't done it yet: open Claude Code and say <em>"help me build [the one thing you're working on]"</em> and keep the conversation going. That's it.</p>

<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">

<p><strong>Session 3 — Monday June 22 at 1pm ET</strong><br>
Topic: FHIR-native workflows<br>
Survey → intervention. Screening → referral. Real FHIR R4 resources, your primary user flow end-to-end.</p>

<p>Join: <a href="${MEET}">${MEET}</a></p>

<p>See you Monday.<br>
— Eugene</p>

<p style="color:#888;font-size:12px;margin-top:32px">
FHIR IQ Cohort 00 · <a href="https://fhirbuilders.com/cohort/cohort-00">fhirbuilders.com/cohort/cohort-00</a>
</p>`;
}

function bodyText(firstName: string): string {
  return `Hi ${firstName},

Session 2 recording is up:
  Video: ${RECORDING}
  Chat transcript: ${TRANSCRIPT}
  Session 2 page: ${SESSION_2}

The study guide at ${STUDY_2} has all 10 blocks — MCP protocol, building your first server, pgvector, Graphiti, Synthea, RAG pipeline, PHI redaction. Worth working through even if you missed the live session.

---

The message this week: you don't need to learn everything before you start. That's actually the point. Just keep going with Claude Code — open a session, ask it to help you build one small thing, and learn from what happens. You'll pick it up ten times faster than reading docs upfront. Every builder who's shipped something in this cohort did it by starting before they were ready.

If you haven't done it yet: open Claude Code and say "help me build [the one thing you're working on]" and keep the conversation going. That's it.

---

Session 3 — Monday June 22 at 1pm ET
Topic: FHIR-native workflows
Survey → intervention. Screening → referral. Real FHIR R4 resources, your primary user flow end-to-end.

Join: ${MEET}

See you Monday.
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

  console.log(`\nSession 2 follow-up — ${recipients.length} recipients:`);
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
