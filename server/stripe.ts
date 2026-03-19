import Stripe from "stripe";
import { ENV } from "./_core/env";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!ENV.stripeSecretKey || ENV.stripeSecretKey === "sk_live_PLACEHOLDER") {
      throw new Error("STRIPE_SECRET_KEY is not configured. Add it to your .env file.");
    }
    _stripe = new Stripe(ENV.stripeSecretKey);
  }
  return _stripe;
}

export type StripeProduct = {
  id: string;
  stripeProductId: string;
  stripePriceId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string;
  images: string[];
};

export async function getProducts(): Promise<StripeProduct[]> {
  const stripe = getStripe();
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
    limit: 100,
  });

  return products.data
    .filter((p) => p.default_price && typeof p.default_price !== "string")
    .map((p) => {
      const price = p.default_price as Stripe.Price;
      return {
        id: p.id,
        stripeProductId: p.id,
        stripePriceId: price.id,
        name: p.name,
        description: p.description,
        price: price.unit_amount ?? 0,
        imageUrl: p.images?.[0] ?? null,
        category: p.metadata?.category ?? "Uncategorized",
        images: p.images ?? [],
      };
    });
}

export async function getProductById(productId: string): Promise<StripeProduct | null> {
  const stripe = getStripe();
  try {
    const product = await stripe.products.retrieve(productId, {
      expand: ["default_price"],
    });
    if (!product.active || !product.default_price || typeof product.default_price === "string") {
      return null;
    }
    const price = product.default_price as Stripe.Price;
    return {
      id: product.id,
      stripeProductId: product.id,
      stripePriceId: price.id,
      name: product.name,
      description: product.description,
      price: price.unit_amount ?? 0,
      imageUrl: product.images?.[0] ?? null,
      category: product.metadata?.category ?? "Uncategorized",
      images: product.images ?? [],
    };
  } catch {
    return null;
  }
}

export async function createCheckoutSession(options: {
  lineItems: Array<{ stripePriceId: string; quantity: number }>;
  customerEmail: string;
  userId: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: options.lineItems.map((item) => ({
      price: item.stripePriceId,
      quantity: item.quantity,
    })),
    customer_email: options.customerEmail,
    metadata: {
      userId: String(options.userId),
    },
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
  });

  return { url: session.url!, sessionId: session.id };
}

export async function handleWebhookEvent(
  body: Buffer,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(body, signature, ENV.stripeWebhookSecret);
}
