/**
 * Australia Post MyPost Business Shipping API
 * Docs: https://developers.auspost.com.au/apis/shipping-and-tracking/reference
 *
 * Required env vars:
 *   AUSPOST_API_KEY          — API key from MyPost Business developer portal
 *   AUSPOST_API_PASSWORD     — API password (set when you created the API key)
 *   AUSPOST_ACCOUNT_NUMBER   — Your MyPost Business account number
 *   AUSPOST_SENDER_NAME      — Your name / business name
 *   AUSPOST_SENDER_STREET    — Sender street address
 *   AUSPOST_SENDER_SUBURB    — Sender suburb
 *   AUSPOST_SENDER_STATE     — Sender state code (e.g. VIC, NSW)
 *   AUSPOST_SENDER_POSTCODE  — Sender postcode
 *
 * Optional:
 *   AUSPOST_TEST_MODE=true   — Use the AusPost sandbox environment
 */

const PROD_BASE = "https://digitalapi.auspost.com.au/shipping/v1";
const TEST_BASE = "https://digitalapi.auspost.com.au/test/shipping/v1";

function base(): string {
  return process.env.AUSPOST_TEST_MODE === "true" ? TEST_BASE : PROD_BASE;
}

function authHeaders(): Record<string, string> {
  const key = process.env.AUSPOST_API_KEY ?? "";
  const password = process.env.AUSPOST_API_PASSWORD ?? "";
  const account = process.env.AUSPOST_ACCOUNT_NUMBER ?? "";
  const creds = Buffer.from(`${key}:${password}`).toString("base64");
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${creds}`,
    "Account-Number": account,
  };
}

/** Normalise full state names (as returned by Stripe) to AusPost state codes */
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

export function normaliseState(state: string): string {
  return STATE_CODES[state.toLowerCase().trim()] ?? state.toUpperCase();
}

export function isConfigured(): boolean {
  return !!(
    process.env.AUSPOST_API_KEY &&
    process.env.AUSPOST_ACCOUNT_NUMBER &&
    process.env.AUSPOST_SENDER_POSTCODE
  );
}

/** MyPost Business domestic satchel products */
export const SATCHEL_PRODUCTS = [
  { label: "Small Satchel (≤500g)", productId: "7E05", weight: 0.5 },
  { label: "Medium Satchel (≤1kg)", productId: "7E10", weight: 1.0 },
  { label: "Large Satchel (≤2kg)", productId: "7E25", weight: 2.0 },
  { label: "Extra Large Satchel (≤3kg)", productId: "7E35", weight: 3.0 },
] as const;

export interface ShipTo {
  name: string;
  line1: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface ShipmentResult {
  shipmentId: string;
  shipmentItemId: string;
  trackingNumber: string | null;
}

/** Step 1 — create the shipment record in AusPost */
export async function createShipment(
  orderId: number,
  to: ShipTo,
  productId: string,
  weight: number
): Promise<ShipmentResult> {
  if (!isConfigured()) {
    throw new Error(
      "AusPost is not configured. Please set AUSPOST_API_KEY, AUSPOST_API_PASSWORD, AUSPOST_ACCOUNT_NUMBER, and AUSPOST_SENDER_* environment variables in Railway."
    );
  }

  const body = {
    shipments: [
      {
        shipment_reference: `PM-${orderId}`,
        from: {
          name: process.env.AUSPOST_SENDER_NAME ?? "princess-made",
          lines: [process.env.AUSPOST_SENDER_STREET ?? ""],
          suburb: process.env.AUSPOST_SENDER_SUBURB ?? "",
          state: process.env.AUSPOST_SENDER_STATE ?? "",
          postcode: process.env.AUSPOST_SENDER_POSTCODE ?? "",
          country: "AU",
        },
        to: {
          name: to.name,
          lines: [to.line1],
          suburb: to.suburb,
          state: normaliseState(to.state),
          postcode: to.postcode,
          country: "AU",
        },
        items: [
          {
            item_reference: `PM-${orderId}-1`,
            product_id: productId,
            weight,
            length: 35,
            width: 25,
            height: 8,
          },
        ],
      },
    ],
  };

  const res = await fetch(`${base()}/shipments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as any;

  if (!res.ok) {
    const msg =
      data?.errors?.[0]?.message ??
      data?.message ??
      `HTTP ${res.status}`;
    throw new Error(`AusPost API error: ${msg}`);
  }

  const shipment = data.shipments?.[0];
  if (shipment?.errors?.length) {
    const errs = (shipment.errors as any[]).map((e) => e.message).join("; ");
    throw new Error(`Shipment error: ${errs}`);
  }

  const shipmentId = shipment.shipment_id as string;
  const item = shipment.items?.[0];
  const shipmentItemId = item?.shipment_item_id as string;
  const trackingNumber =
    (item?.tracking_details?.article_id as string | undefined) ?? null;

  return { shipmentId, shipmentItemId, trackingNumber };
}

/** Step 2 — fetch the label PDF; returns base64-encoded PDF string */
export async function getLabelPdf(
  shipmentId: string,
  shipmentItemId: string
): Promise<string> {
  const url =
    `${base()}/labels` +
    `?format=PDF` +
    `&groups[0].items[0].shipment_id=${encodeURIComponent(shipmentId)}` +
    `&groups[0].items[0].shipment_item_id=${encodeURIComponent(shipmentItemId)}`;

  const res = await fetch(url, { headers: authHeaders() });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `AusPost label error: ${res.status} — ${text.slice(0, 300)}`
    );
  }

  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}
