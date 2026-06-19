import { NextRequest, NextResponse } from "next/server";
import { createCohortCheckoutSession } from "@/lib/stripe";
import { auth } from "@/lib/auth";

const MIN_AMOUNT = 25;
const MAX_AMOUNT = 10_000;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { amount, cohortSlug } = await request.json();

    if (typeof amount !== "number" || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT}` },
        { status: 400 },
      );
    }
    if (!cohortSlug) {
      return NextResponse.json({ error: "cohortSlug is required" }, { status: 400 });
    }

    const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const checkoutSession = await createCohortCheckoutSession({
      amount,
      cohortSlug,
      memberEmail: session?.user?.email ?? undefined,
      successUrl: `${origin}/cohort/${cohortSlug}/contribute?success=1`,
      cancelUrl: `${origin}/cohort/${cohortSlug}/contribute?canceled=1`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Cohort contribution checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
