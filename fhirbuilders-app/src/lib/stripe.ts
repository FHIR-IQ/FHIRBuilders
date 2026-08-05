import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

const getStripeClient = (): Stripe => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }
  return stripeInstance;
};

export const stripe = new Proxy({} as Stripe, {
  get: (_, prop) => {
    const client = getStripeClient();
    return (client as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
  },
});

export interface CreateCohortContributionParams {
  amount: number; // dollars (not cents)
  cohortSlug: string;
  memberEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCohortCheckoutSession({
  amount,
  cohortSlug,
  memberEmail,
  successUrl,
  cancelUrl,
}: CreateCohortContributionParams) {
  const session = await (getStripeClient()).checkout.sessions.create({
    mode: "payment",
    customer_email: memberEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Healthcare AI Builders · Cohort 00",
            description:
              "Cohort membership — supports sessions, tooling, and planning for Cohort 1 (August 2026). Pay what feels right, min $25.",
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    // Override what shows on bank statements
    payment_intent_data: {
      statement_descriptor: "HEALTHCARE AI BLDR",
      description: "Healthcare AI Builders · Cohort 00 membership",
    },
    // Custom text visible on the hosted checkout page
    custom_text: {
      submit: {
        message:
          "You're supporting Healthcare AI Builders Cohort 00. Thank you — this directly funds session planning and Cohort 1.",
      },
      after_submit: {
        message:
          "Questions? Email eugene.vestel@gmail.com",
      },
    },
    metadata: { cohortSlug, amount: String(amount), brand: "Healthcare AI Builders" },
    success_url: successUrl,
    cancel_url: cancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });
  return session;
}

// ─── Cohort 01 — paid enrollment ─────────────────────────────────────────────
// Two plans. `full` = one-time 12-week seat. `weekly` = $99/wk subscription the
// member cancels anytime (that cancel-anytime is the honesty mechanism — no
// refund policy to argue about). Alumni/returning builders get the repeat rate.
// Prices live here as the single source of truth; the page reads the same map.

export type CohortPlan = "full" | "weekly";

export const COHORT_01_PRICING = {
  full: { standard: 1000, repeat: 600 }, // one-time, whole 12 weeks
  weekly: { standard: 99, repeat: 59 }, // per week, cancel anytime
} as const;

export interface CreateEnrollmentParams {
  plan: CohortPlan;
  repeat: boolean; // alumni / returning-builder rate
  memberEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCohortEnrollmentSession({
  plan,
  repeat,
  memberEmail,
  successUrl,
  cancelUrl,
}: CreateEnrollmentParams) {
  const tier = repeat ? "repeat" : "standard";
  const amount = COHORT_01_PRICING[plan][tier];
  const client = getStripeClient();

  const productName = "Healthcare AI Builders · Cohort 01";
  const description =
    plan === "full"
      ? "12-week paid cohort — full seat. Weekly Friday demos, live problem-solving, build with your own agents on real FHIR."
      : "12-week paid cohort — weekly. $/week, cancel anytime. Weekly Friday demos, live problem-solving, real FHIR.";

  return client.checkout.sessions.create({
    mode: plan === "weekly" ? "subscription" : "payment",
    customer_email: memberEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: productName, description },
          unit_amount: Math.round(amount * 100),
          ...(plan === "weekly" ? { recurring: { interval: "week" as const } } : {}),
        },
        quantity: 1,
      },
    ],
    // Statement descriptor is payment-mode only; subscriptions inherit it from
    // the product/account, so only set it on the one-time path.
    ...(plan === "full"
      ? {
          payment_intent_data: {
            statement_descriptor: "HEALTHCARE AI BLDR",
            description: `${productName} — full 12-week seat`,
          },
        }
      : {}),
    custom_text: {
      submit: {
        message:
          plan === "weekly"
            ? "You're enrolling in Cohort 01, billed weekly. Cancel anytime from your receipt — no lock-in."
            : "You're enrolling in Cohort 01 — the full 12-week seat.",
      },
      after_submit: { message: "Questions? Email eugene.vestel@gmail.com" },
    },
    metadata: {
      cohort: "cohort-01",
      plan,
      tier,
      amount: String(amount),
      brand: "Healthcare AI Builders",
    },
    ...(plan === "weekly"
      ? { subscription_data: { metadata: { cohort: "cohort-01", tier } } }
      : {}),
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });
}

export async function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return (getStripeClient()).webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
}
