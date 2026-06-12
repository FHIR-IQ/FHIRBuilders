/**
 * scripts/send-session1-followup.ts
 * Post-session blast — get going, build together, Slack, WhatsApp tonight.
 */

import { COHORT_00 } from "../src/lib/cohort/cohort-00";

const DRY_RUN = !process.argv.includes("--send");
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const FROM = "FHIRBuilders <notifications@fhirbuilders.com>";
const REPLY_TO = "eugene.vestel@gmail.com";
const ALWAYS_CC = { name: "Eugene Vestel", email: "eugene.vestel@gmail.com" };

const SUBJECT = "You're in — get going with Claude Code";

const SLACK_INVITE = "https://join.slack.com/t/fhirbuilders/shared_invite/zt-405j5tykg-T9v8~nNaX9tFZZgzaj37Ow";
const COHORT_URL = "https://fhirbuilders.com/cohort/cohort-00";
const COMMUNITY_URL = "https://fhirbuilders.com/cohort/cohort-00/community";
const CLAUDE_CODE_URL = "https://docs.anthropic.com/en/docs/claude-code/setup";
const NEXT_SESSION_MEET = "https://meet.google.com/cjr-azsx-udq";

function bodyHtml(firstName: string): string {
  return `<p>Hi ${firstName},</p>

<p>Session 1 is done. You're in. Here's what to do now:</p>

<p><strong>1. Get going with Claude Code</strong><br>
If you haven't installed it yet, do it today:
<a href="${CLAUDE_CODE_URL}">${CLAUDE_CODE_URL}</a><br>
Open it in a project folder and ask it to build something. Even a single FHIR read.
That's the rep that compounds.</p>

<p><strong>2. Build with other people</strong><br>
Your pod is on the community page — find your people, see what they're building:
<a href="${COMMUNITY_URL}">${COMMUNITY_URL}</a><br>
Build 1 project or several. The pod is your cluster, not a constraint.
Next call is <strong>Monday June 15 at 1pm ET</strong> — same link.</p>

<p><strong>3. Get on Slack</strong><br>
<a href="${SLACK_INVITE}">${SLACK_INVITE}</a><br>
#help-build for questions. #wins for small ships. #general for everything else.
Ask in public — your question helps the next builder.</p>

<p><strong>4. Ask questions</strong><br>
No DMs. Post in Slack and you'll get an answer fast.
Stuck for more than 20 minutes? That's a Slack message.</p>

<p><strong>WhatsApp group</strong> — coming tonight. Watch for the invite link.</p>

<p>See you Monday.<br>
— Eugene</p>

<p style="color:#888;font-size:12px;margin-top:32px">
FHIR IQ Cohort 00 · <a href="${COHORT_URL}">fhirbuilders.com/cohort/cohort-00</a>
</p>`;
}

function bodyText(firstName: string): string {
  return `Hi ${firstName},

Session 1 is done. You're in. Here's what to do now:

1. Get going with Claude Code
   Install it today: ${CLAUDE_CODE_URL}
   Open it in a project folder and ask it to build something. Even a single FHIR read.

2. Build with other people
   Your pod: ${COMMUNITY_URL}
   Build 1 project or several — the pod is your cluster, not a constraint.
   Next call: Monday June 15, 1pm ET — ${NEXT_SESSION_MEET}

3. Get on Slack
   ${SLACK_INVITE}
   #help-build for questions. #wins for small ships. Ask in public.

4. Ask questions
   No DMs. Post in Slack. Stuck 20+ minutes = Slack message.

WhatsApp group — coming tonight. Watch for the invite link.

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
    console.error("RESEND_API_KEY required. Aborting.");
    process.exit(1);
  }

  const alreadyIncluded = COHORT_00.signups.some(
    (s) => s.email.toLowerCase() === ALWAYS_CC.email.toLowerCase(),
  );
  const recipients = alreadyIncluded ? COHORT_00.signups : [ALWAYS_CC, ...COHORT_00.signups];

  console.log(`\nPost-session followup — ${recipients.length} recipients:`);
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
