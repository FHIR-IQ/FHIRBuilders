import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event;
  try {
    event = await constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata ?? {};
    const email = session.customer_email ?? "anonymous";

    if (meta.cohort === "cohort-01") {
      // Paid enrollment (full one-time or first weekly invoice).
      console.log(
        `Cohort 01 ENROLLMENT: ${email} · plan=${meta.plan} · tier=${meta.tier} · $${(session.amount_total ?? 0) / 100}`,
      );
      // TODO Phase 2: prisma enrollment record + auto-send Buzz invite email.
    } else {
      // Legacy: Cohort 00 pay-what-you-want contribution.
      console.log(
        `Cohort contribution received: $${(session.amount_total ?? 0) / 100} from ${email} (cohort: ${meta.cohortSlug})`,
      );
      // TODO Phase 2: record in DB with prisma.cohortContribution.create(...)
    }
  }

  if (event.type === "customer.subscription.deleted") {
    // A weekly builder cancelled — note it so Eugene can follow up if mid-cohort.
    const sub = event.data.object;
    console.log(`Cohort 01 weekly subscription cancelled: ${sub.id} (tier=${sub.metadata?.tier})`);
  }

  return NextResponse.json({ received: true });
}
