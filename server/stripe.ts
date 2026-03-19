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

// ============ PRODUCT CACHE ============
// Cache products in memory to avoid hitting Stripe API on every request.
// TTL of 5 minutes keeps data fresh while massively reducing API calls.

interface ProductCache {
  products: StripeProduct[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let productCache: ProductCache | null = null;
let cachePromise: Promise<StripeProduct[]> | null = null;

function mapStripeProduct(p: Stripe.Product): StripeProduct | null {
  if (!p.default_price || typeof p.default_price === "string") return null;
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
}

async function fetchProductsFromStripe(): Promise<StripeProduct[]> {
  const stripe = getStripe();
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
    limit: 100,
  });

  return products.data
    .map(mapStripeProduct)
    .filter((p): p is StripeProduct => p !== null);
}

export async function getProducts(): Promise<StripeProduct[]> {
  const now = Date.now();

  // Return cached data if still fresh
  if (productCache && (now - productCache.timestamp) < CACHE_TTL_MS) {
    return productCache.products;
  }

  // Deduplicate concurrent requests - only one Stripe call at a time
  if (!cachePromise) {
    cachePromise = fetchProductsFromStripe()
      .then((products) => {
        productCache = { products, timestamp: Date.now() };
        cachePromise = null;
        return products;
      })
      .catch((err) => {
        cachePromise = null;
        // Return stale cache on error rather than failing
        if (productCache) return productCache.products;
        throw err;
      });
  }

  return cachePromise;
}

export async function getProductById(productId: string): Promise<StripeProduct | null> {
  // Try cache first
  const cached = productCache?.products.find(p => p.id === productId);
  if (cached && productCache && (Date.now() - productCache.timestamp) < CACHE_TTL_MS) {
    return cached;
  }

  // Fall back to direct API call
  const stripe = getStripe();
  try {
    const product = await stripe.products.retrieve(productId, {
      expand: ["default_price"],
    });
    if (!product.active) return null;
    return mapStripeProduct(product);
  } catch {
    // Last resort: check stale cache
    return cached ?? null;
  }
}

// Invalidate cache (call after product changes)
export function invalidateProductCache() {
  productCache = null;
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
