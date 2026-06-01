/**
 * Shippit Shipping API integration
 * Docs: https://developer.shippit.com/
 *
 * Required env vars (set in Railway):
 *   SHIPPIT_API_KEY  — your Retailer API Token from Shippit → Settings → API
 *
 * Sender address is taken from your Shippit account settings — no extra env vars needed.
 */

const BASE = "https://app.shippit.com/api/3";

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHIPPIT_API_KEY ?? ""}`,
  };
}

export function isConfigured(): boolean {
  return !!process.env.SHIPPIT_API_KEY;
}

/** Normalise full state names (from Stripe) to AUS state codes */
const STATE_CODES: Record<string, string> = {
  "victoria": "VIC",
  "new south wales": "NSW",
  "queensland": "QLD",
  "south australia": "SA",
  "western australia": "WA",
  "tasmania": "TAS",
  "australian capital territory": "ACT",
  "northern territory": "NT",
};

export function normaliseState(s: string): string {
  return STATE_CODES[s.toLowerCase().trim()] ?? s.toUpperCase();
}

export interface ShipTo {
  name: string;
  email?: string | null;
  line1: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface OrderResult {
  orderNumber: string;
  trackingNumber: string | null;
}

/**
 * Create + book a Shippit order.
 * Returns the Shippit order number and (if immediately available) a tracking number.
 */
export async function createOrder(
  orderId: number,
  to: ShipTo,
  weight: number,
  serviceType: "standard" | "express"
): Promise<OrderResult> {
  if (!isConfigured()) {
    throw new Error(
      "Shippit is not configured. Add SHIPPIT_API_KEY to your Railway environment variables (found under Shippit → Settings → API)."
    );
  }

  const body = {
    order: {
      retailer_invoice: `PM-${orderId}`,
      receiver_name: to.name,
      email_address: to.email ?? "",
      delivery_address: to.line1,
      delivery_suburb: to.suburb,
      delivery_postcode: to.postcode,
      delivery_state: normaliseState(to.state),
      delivery_country: "AU",
      courier_type: serviceType,
      products: [
        {
          qty: 1,
          price: 0,
          sku: `PM-${orderId}`,
          title: "Handmade Item",
          weight,
        },
      ],
    },
  };

  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as any;

  if (!res.ok) {
    const msg =
      data?.messages?.[0] ??
      data?.error ??
      JSON.stringify(data).slice(0, 300);
    throw new Error(`Shippit error: ${msg}`);
  }

  const orderNumber = data?.response?.order_number as string | undefined;
  if (!orderNumber) {
    throw new Error("Shippit did not return an order number. Response: " + JSON.stringify(data).slice(0, 300));
  }

  const trackingNumber =
    (data?.response?.tracking_number as string | undefined) ?? null;

  return { orderNumber, trackingNumber };
}

/**
 * Fetch the shipping label PDF for a Shippit order.
 * Returns a base64-encoded PDF string.
 */
export async function getLabelPdf(orderNumber: string): Promise<string> {
  const res = await fetch(
    `${BASE}/orders/${encodeURIComponent(orderNumber)}/label`,
    { headers: headers() }
  );

  // Shippit may return JSON with a label URL, or a direct PDF binary, or a redirect
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json") || contentType.includes("text/")) {
    const data = (await res.json()) as any;
    const labelUrl =
      data?.response?.label_url ??
      data?.response?.labels?.[0]?.url ??
      data?.label_url;

    if (!labelUrl) {
      throw new Error(
        "Shippit returned JSON but no label URL was found. The order may still be pending carrier assignment — try again in a moment."
      );
    }

    // Fetch the actual PDF from the URL
    const pdfRes = await fetch(labelUrl);
    if (!pdfRes.ok) throw new Error(`Failed to fetch label PDF from ${labelUrl}`);
    const buf = await pdfRes.arrayBuffer();
    return Buffer.from(buf).toString("base64");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shippit label error: ${res.status} — ${text.slice(0, 300)}`);
  }

  // Direct PDF response
  const buf = await res.arrayBuffer();
  return Buffer.from(buf).toString("base64");
}
