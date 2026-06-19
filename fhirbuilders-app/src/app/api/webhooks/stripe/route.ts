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
    console.log(
      `Cohort contribution received: $${(session.amount_total ?? 0) / 100} from ${session.customer_email ?? "anonymous"} (cohort: ${session.metadata?.cohortSlug})`,
    );
    // TODO Phase 2: record in DB with prisma.cohortContribution.create(...)
  }

  return NextResponse.json({ received: true });
}
