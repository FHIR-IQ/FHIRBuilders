/**
 * One-off: personal check-in to cohort builders who never joined Slack.
 * They missed the Jul 5 re-engagement DMs, so this is their version of it.
 */

const DRY_RUN = !process.argv.includes("--send");
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const FROM = "FHIRBuilders <notifications@fhirbuilders.com>";
const REPLY_TO = "eugene.vestel@gmail.com";
const CC = "eugene.vestel@gmail.com";
const SUBJECT = "Cohort 00 — two sessions left, want a hand with your project?";

const MEET = "https://meet.google.com/cjr-azsx-udq";
const SLACK_INVITE =
  "https://join.slack.com/t/fhirbuilders/shared_invite/zt-405j5tykg-T9v8~nNaX9tFZZgzaj37Ow";

type Recipient = { name: string; email: string; personal: string };

const RECIPIENTS: Recipient[] = [
  {
    name: "Sergei Polevikov",
    email: "spolevikov@gmail.com",
    personal:
      "I saw you accepted Wednesday's invite - glad you'll be there. If you're still deciding what to build, that's a fine state to show up in. We'll scope something live.",
  },
  {
    name: "Vanessa Paolantonio",
    email: "vanessa.paolantonio@yahoo.com",
    personal:
      "If the patient-facing idea from the intro call stalled, tell me where it stopped and I'll help you restart it.",
  },
  {
    name: "Mark Gunnels",
    email: "markgunnels@gmail.com",
    personal:
      "You came in wanting to turn an experiment into something shippable. If that stalled, tell me where it stopped and I'll help you get it moving again.",
  },
  {
    name: "Eslam Elgebaly",
    email: "eslamelgebaly11@outlook.com",
    personal:
      "You joined late, so there's zero expectation you're caught up. If you want help picking a project small enough to finish by the 15th, reply and we'll pick one together.",
  },
  {
    name: "Divesh Aidasani",
    email: "daidasani@bayada.com",
    personal:
      "I saw Wednesday doesn't work for you - no problem. If you want to keep the home-health EMR idea moving anyway, reply and tell me where you're stuck and we'll work it async. Demo Day on the 15th is worth joining even just to watch.",
  },
  {
    name: "Matthew Maher",
    email: "matthew.maher@myriad.com",
    personal:
      "If the prior-auth flow stalled, tell me where it stopped and I'll help you get it moving again.",
  },
];

function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? "there";
}

function bodyText(r: Recipient): string {
  return `Hi ${firstName(r.name)},

Gene here. You're not on the cohort Slack, so I wanted to check in directly.

${r.personal}

Where things stand: Wednesday Jul 8, 6:30 PM ET is an open build session (${MEET}), and Demo Day is Wed Jul 15. Everyone gets two minutes there - a demo if you have one, your story if you don't.

If your project stalled, I'll help you get it moving. Reply to this email and tell me where it stopped. A sentence is enough.

And if you want into the Slack after all: ${SLACK_INVITE}

- Eugene
`;
}

function bodyHtml(r: Recipient): string {
  return `<p>Hi ${firstName(r.name)},</p>

<p>Gene here. You're not on the cohort Slack, so I wanted to check in directly.</p>

<p>${r.personal}</p>

<p>Where things stand: <strong>Wednesday Jul 8, 6:30 PM ET</strong> is an open build session
(<a href="${MEET}">${MEET}</a>), and <strong>Demo Day is Wed Jul 15</strong>. Everyone gets two
minutes there - a demo if you have one, your story if you don't.</p>

<p>If your project stalled, I'll help you get it moving. Reply to this email and tell me where
it stopped. A sentence is enough.</p>

<p>And if you want into the Slack after all: <a href="${SLACK_INVITE}">join here</a>.</p>

<p>- Eugene</p>

<p style="color:#888;font-size:12px;margin-top:32px">
FHIR IQ Cohort 00 · <a href="https://fhirbuilders.com/cohort/cohort-00">fhirbuilders.com/cohort/cohort-00</a>
</p>`;
}

async function send(r: Recipient): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [r.email],
      cc: [CC],
      reply_to: REPLY_TO,
      subject: SUBJECT,
      html: bodyHtml(r),
      text: bodyText(r),
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

  console.log(`\nSlack-missing check-in — ${RECIPIENTS.length} recipients (cc ${CC} on each):`);
  console.log(`Subject: "${SUBJECT}"\n`);
  for (const r of RECIPIENTS) {
    console.log(`  ${r.name.padEnd(24)}  ${r.email}`);
    console.log(`    personal: ${r.personal}\n`);
  }

  if (DRY_RUN) {
    console.log("[DRY RUN] Re-run with --send to fire.");
    return;
  }

  let ok = 0,
    fail = 0;
  for (const r of RECIPIENTS) {
    const result = await send(r);
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
