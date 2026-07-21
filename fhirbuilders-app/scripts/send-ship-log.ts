/**
 * Weekly ship log — the audience engine for Cohort 01.
 *
 * One short email a week: who shipped what, what's coming, one link.
 * Goes to cohort builders + supporters + the waitlist. Edit ISSUE below
 * each week, dry-run to check recipients, then --send.
 *
 *   DATABASE_URL=... RESEND_API_KEY=... npx tsx scripts/send-ship-log.ts          # dry run
 *   DATABASE_URL=... RESEND_API_KEY=... npx tsx scripts/send-ship-log.ts --send
 */

import { PrismaClient } from "@prisma/client";
import { COHORT_00, SUPPORTERS } from "../src/lib/cohort/cohort-00";

const DRY_RUN = !process.argv.includes("--send");
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const FROM = "Healthcare AI Builders <notifications@fhirbuilders.com>";
const REPLY_TO = "eugene.vestel@gmail.com";
const CC = "eugene.vestel@gmail.com";

// ─── EDIT THIS BLOCK EACH WEEK ───────────────────────────────────────────────

const ISSUE = {
  number: 1,
  subject: "Ship log #001 — what Cohort 00 actually built",
  paragraphs: [
    "First edition of the ship log: one short note a week on what's actually getting built in the Healthcare AI Builders community.",
    "Gail Hamilton (Velox Metadata) shipped the most complete build of the cohort: a web app that connects to her own Medplum instance and runs PIQI data quality tests against 50 patients she deliberately messed up. Pluggable test architecture, an MCP server on top, all built with Claude Code.",
    "Michael Campbell (Indicina) seeded the shared sandbox everyone built on - 100 synthetic patients with US Core data - then organized an informal study group on the side, where Max demoed his open-source ProxySmart and its possible integration with Rick Moore's record locator. Nobody asked him to do any of that. That's the kind of room this is.",
    "At Session 4, Gene demoed CareAgents live: an agent-based platform that aggregates your health data through FHIR APIs (Fasten, primary-care connections) with data quality and privacy conformance testing built into the pipeline. Patient-controlled records, consent-first.",
    "The engine under it is open for community testing now. HealthClaw Guardrails is the open-source security layer between AI agents and clinical data - PHI redaction, immutable audit, step-up auth, human-in-the-loop writes. MIT licensed, 29 MCP tools, try the hosted demo in 60 seconds without installing anything. If you can break it, that's a contribution: https://github.com/aks129/HealthClawGuardrails/issues/184",
    "And the big one: Cohort 01 applications are open. Six weeks, 20 seats, application only, starts late August. The FHIR + AI masterclass nobody else is teaching - built on everything Cohort 00 taught us.",
  ],
  cta: {
    label: "Apply for Cohort 01",
    url: "https://fhirbuilders.com/cohort-01",
  },
};

// ─────────────────────────────────────────────────────────────────────────────

function bodyText(): string {
  return `${ISSUE.paragraphs.join("\n\n")}

${ISSUE.cta.label}: ${ISSUE.cta.url}

- Eugene
Healthcare AI Builders · fhirbuilders.com
Reply to unsubscribe.
`;
}

function bodyHtml(): string {
  const paras = ISSUE.paragraphs.map((p) => `<p>${p}</p>`).join("\n");
  return `${paras}

<p><a href="${ISSUE.cta.url}"><strong>${ISSUE.cta.label}</strong></a></p>

<p>- Eugene</p>

<p style="color:#888;font-size:12px;margin-top:32px">
Healthcare AI Builders · <a href="https://fhirbuilders.com">fhirbuilders.com</a> · Reply to unsubscribe.
</p>`;
}

async function collectRecipients(): Promise<{ email: string; source: string }[]> {
  const prisma = new PrismaClient();
  const waitlist = await prisma.waitlist.findMany({ select: { email: true } });
  await prisma.$disconnect();

  const seen = new Set<string>();
  const out: { email: string; source: string }[] = [];
  const add = (email: string, source: string) => {
    const key = email.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push({ email: email.trim(), source });
  };

  for (const s of COHORT_00.signups) add(s.email, "builder");
  for (const s of SUPPORTERS) add(s.email, "supporter");
  for (const w of waitlist) add(w.email, "waitlist");
  return out;
}

async function send(to: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      cc: [CC],
      reply_to: REPLY_TO,
      subject: ISSUE.subject,
      html: bodyHtml(),
      text: bodyText(),
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

  const recipients = await collectRecipients();
  console.log(`\nShip log #${String(ISSUE.number).padStart(3, "0")} — ${recipients.length} recipients (cc ${CC}):`);
  console.log(`Subject: "${ISSUE.subject}"\n`);
  for (const r of recipients) console.log(`  ${r.source.padEnd(10)} ${r.email}`);
  console.log(`\n--- body ---\n${bodyText()}`);

  if (DRY_RUN) {
    console.log("[DRY RUN] Re-run with --send to fire.");
    return;
  }

  let ok = 0,
    fail = 0;
  for (const r of recipients) {
    const result = await send(r.email);
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
