/**
 * One-off: nudge Eslam, Sergei, and Matt to join FHIRBuilders Slack.
 * They're on the pod-5 roster but haven't accepted the workspace invite yet.
 */

const DRY_RUN = !process.argv.includes("--send");
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = "FHIRBuilders <notifications@fhirbuilders.com>";
const SLACK = "https://join.slack.com/t/fhirbuilders/shared_invite/zt-405j5tykg-T9v8~nNaX9tFZZgzaj37Ow";
const ALWAYS_CC = { name: "Eugene Vestel", email: "eugene.vestel@gmail.com" };

const POD5_MISSING = [
  { name: "Eslam", email: "eslamelgebaly11@outlook.com" },
  { name: "Sergei", email: "spolevikov@gmail.com" },
  { name: "Matt", email: "matt@studiolab.io" },
];

function html(firstName: string) {
  return `<p>Hi ${firstName},</p>

<p>Your pod 5 teammates are already in the FHIRBuilders Slack and looking to connect with you. Takes 30 seconds to join:</p>

<p><a href="${SLACK}">${SLACK}</a></p>

<p>Once you're in, say hi in <strong>#general</strong> and find your pod on the <a href="https://fhirbuilders.com/cohort/cohort-00/community">community page</a>. Next session is <strong>Monday June 15 at 1pm ET</strong> — same Meet link as last week.</p>

<p>— Eugene</p>`;
}

function text(firstName: string) {
  return `Hi ${firstName},

Your pod 5 teammates are in the FHIRBuilders Slack and looking to connect. Join here:
${SLACK}

Once you're in, say hi in #general and find your pod:
https://fhirbuilders.com/cohort/cohort-00/community

Next session: Monday June 15, 1pm ET.

— Eugene
`;
}

async function send(to: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: ALWAYS_CC.email,
      subject: "Join the FHIRBuilders Slack — your pod is waiting",
      html: html(name),
      text: text(name),
    }),
  });
  if (!res.ok) return { ok: false, error: `${res.status} ${await res.text()}` };
  return { ok: true };
}

async function main() {
  if (!DRY_RUN && !RESEND_API_KEY) { console.error("RESEND_API_KEY required."); process.exit(1); }

  const recipients = [ALWAYS_CC, ...POD5_MISSING];
  console.log(`\nPod 5 Slack nudge — ${recipients.length} recipients:\n`);
  for (const r of recipients) console.log(`  ${r.name.padEnd(20)}  ${r.email}`);
  console.log();
  if (DRY_RUN) { console.log("[DRY RUN] Re-run with --send to fire."); return; }

  for (const r of recipients) {
    const result = await send(r.email, r.name);
    console.log(result.ok ? `  sent  ${r.email}` : `  FAIL  ${r.email}  ${result.error}`);
    await new Promise((res) => setTimeout(res, 150));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

export {};
