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
  variants: Record<string, number>; // variant name -> price in cents
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

  // Extract variants: any metadata key that isn't "category" and has a numeric value
  const variants: Record<string, number> = {};
  for (const [key, value] of Object.entries(p.metadata ?? {})) {
    if (key === "category") continue;
    const dollars = parseFloat(value);
    if (!isNaN(dollars)) variants[key] = Math.round(dollars * 100);
  }

  // Collect extra images from metadata (image_2, image_3, etc.)
const metaImages: string[] = [];
for (const [key, value] of Object.entries(p.metadata ?? {})) {
  if (key.match(/^image_\d+$/) && value) {
    metaImages.push(value);
  }
}

return {
  id: p.id,
  stripeProductId: p.id,
  stripePriceId: price.id,
  name: p.name,
  description: p.description,
  price: price.unit_amount ?? 0,
  imageUrl: p.images?.[0] ?? null,
  category: p.metadata?.category ?? "Uncategorized",
  images: [...(p.images ?? []), ...metaImages],
  variants,
};
}

// Resolve Stripe file URLs (files.stripe.com) to their final CDN URLs.
// Stripe rejects HEAD requests with 403, so we use a GET with redirect: "manual"
// to capture the redirect target without downloading the full image body.
const resolvedImageCache = new Map<string, string>();

async function resolveImageUrl(url: string): Promise<string> {
  if (!url.startsWith("https://files.stripe.com/")) return url;
  const cached = resolvedImageCache.get(url);
  if (cached) return cached;
  try {
    // Use redirect: "manual" to capture the Location header without following it.
    // If Stripe serves directly (no redirect), we just keep the original URL.
    const resp = await fetch(url, { method: "GET", redirect: "manual" });
    const location = resp.headers.get("location");
    // Consume/discard body to free the connection
    if (resp.body) {
      try { resp.body.cancel(); } catch {}
    }
    const finalUrl = location || url;
    resolvedImageCache.set(url, finalUrl);
    return finalUrl;
  } catch {
    return url;
  }
}

async function resolveProductImages(product: StripeProduct): Promise<StripeProduct> {
  const [imageUrl, ...resolvedImages] = await Promise.all([
    product.imageUrl ? resolveImageUrl(product.imageUrl) : Promise.resolve(null),
    ...product.images.map(resolveImageUrl),
  ]);
  return { ...product, imageUrl, images: resolvedImages };
}

async function fetchProductsFromStripe(): Promise<StripeProduct[]> {
  const stripe = getStripe();
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
    limit: 100,
  });

  const mapped = products.data
    .map(mapStripeProduct)
    .filter((p): p is StripeProduct => p !== null);

  // Resolve all image URLs in parallel
  return Promise.all(mapped.map(resolveProductImages));
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


export async function updateProductCategory(productId: string, category: string): Promise<void> {
  const stripe = getStripe();
  await stripe.products.update(productId, {
    metadata: { category },
  });
  invalidateProductCache();
}
export async function createCheckoutSession(options: {
  lineItems: Array<{ stripePriceId: string; quantity: number }>;
  customerEmail: string;
  userId: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  // Build shipping options from env var (comma-separated Stripe shipping rate IDs)
  // e.g. STRIPE_SHIPPING_RATE_IDS=shr_abc123,shr_def456,shr_ghi789
  const shippingRateIds = process.env.STRIPE_SHIPPING_RATE_IDS
    ? process.env.STRIPE_SHIPPING_RATE_IDS.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

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
    // Collect shipping address at checkout
    shipping_address_collection: {
      allowed_countries: ["AU", "NZ"],
    },
    // Show shipping rate options (create these in Stripe Dashboard → Shipping Rates)
    ...(shippingRateIds.length > 0 && {
      shipping_options: shippingRateIds.map((id) => ({ shipping_rate: id })),
    }),
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
