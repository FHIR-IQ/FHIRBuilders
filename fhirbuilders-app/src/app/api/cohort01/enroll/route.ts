import { NextRequest, NextResponse } from "next/server";
import { createCohortEnrollmentSession, type CohortPlan } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { isCohortMember } from "@/lib/cohort/cohort-00";

export const runtime = "nodejs"; // Stripe SDK is not edge-compatible

// Pay-first enrollment. No application gate — paying is the commitment filter.
// Cohort 00 builders/supporters (isCohortMember) are auto-granted the repeat
// rate when signed in; anyone can also use a promo code on the Stripe page.
export async function POST(request: NextRequest) {
  try {
    const { plan } = (await request.json()) as { plan?: CohortPlan };
    if (plan !== "full" && plan !== "weekly") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const session = await auth();
    const email = session?.user?.email ?? undefined;
    const repeat = isCohortMember(email);

    const origin =
      request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const checkout = await createCohortEnrollmentSession({
      plan,
      repeat,
      memberEmail: email,
      successUrl: `${origin}/cohort-01/enrolled?plan=${plan}`,
      cancelUrl: `${origin}/cohort-01?canceled=1`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Cohort 01 enroll error:", error);
    return NextResponse.json(
      { error: "Couldn't start checkout. Email eugene.vestel@gmail.com and we'll sort it." },
      { status: 500 },
    );
  }
}
