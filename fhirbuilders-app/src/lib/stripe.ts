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
              "Introductory rate — supports session planning, tooling, and Cohort 1 (August 2026).",
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { cohortSlug, amount: String(amount) },
    success_url: successUrl,
    cancel_url: cancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });
  return session;
}

export async function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return (getStripeClient()).webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
}
