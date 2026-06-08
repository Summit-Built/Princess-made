// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM ORDER PRICING  —  single source of truth for the live calculator AND
// the server-side price verification. All amounts are in WHOLE DOLLARS (AUD).
//
// ▸ BASE_PRICES were provided by the shop owner.
// ▸ ADD_ON prices marked "PLACEHOLDER" are guesses — edit them to your real
//   prices. The form total and the amount charged will update automatically.
// ─────────────────────────────────────────────────────────────────────────────

// Base price per product type (REAL prices).
export const BASE_PRICES: Record<string, number> = {
  'Makeup Pouch': 45,
  'Pencil Case': 34, // PLACEHOLDER — not specified, edit me
  'Laptop Case': 65,
  'Tote Bag': 65,
  'Glasses Pouch': 34,
  'Kindle Case': 34,
  'Other': 34,
};

// Premium fabrics cost extra (e.g. faux fur). Any fabric id not listed = +$0.
// PLACEHOLDER amounts — edit to your real surcharges.
export const FABRIC_SURCHARGE: Record<string, number> = {
  'bunny-fur': 8,   // PLACEHOLDER
  'cheetah-fur': 8, // PLACEHOLDER
  'deer-fur': 8,    // PLACEHOLDER
};

// Flat add-ons applied when the customer selects the feature.
// PLACEHOLDER amounts — edit to your real prices.
export const ADD_ON_PRICES = {
  lace: 5,         // PLACEHOLDER — any lace trim
  bow: 4,          // PLACEHOLDER — any standard bow
  flower: 5,       // PLACEHOLDER — flower instead of a bow
  charm: 6,        // PLACEHOLDER — decorative charm
  zipperCharm: 5,  // PLACEHOLDER — zipper pull charm
  monogram: 8,     // PLACEHOLDER — embroidered monogram
};

// The selection shape needed to price an order. Mirrors the form's field ids.
export interface CustomOrderSelection {
  productType: string;
  outerFabric?: string;  // fabric id
  liningFabric?: string; // fabric id
  laceStyle?: string;    // 'No Lace' or lace id
  bowChoice?: string;    // 'No Bow' | 'flower' | bow id
  charmChoice?: string;  // 'No Charm' or charm id
  zipperCharm?: string;  // 'No Charm' or zipper charm id
  wantsMonogram?: string; // 'Yes' | 'No'
}

export interface PriceBreakdownLine {
  label: string;
  amount: number; // whole dollars
}

export interface PriceBreakdown {
  lines: PriceBreakdownLine[];
  total: number;      // whole dollars
  totalCents: number; // for Stripe
}

const isNone = (v?: string) =>
  !v || v === '' || v.startsWith('No ') || v === 'No Lace' || v === 'No Bow' || v === 'No Charm';

/**
 * Compute the price breakdown for a custom order selection.
 * Used live on the form AND re-run on the server before charging.
 */
export function calculateCustomOrderPrice(sel: CustomOrderSelection): PriceBreakdown {
  const lines: PriceBreakdownLine[] = [];

  // Base
  const base = BASE_PRICES[sel.productType] ?? BASE_PRICES['Other'];
  lines.push({ label: `${sel.productType || 'Custom item'} (base)`, amount: base });

  // Fabric surcharges (furs etc.)
  const outerSurcharge = sel.outerFabric ? (FABRIC_SURCHARGE[sel.outerFabric] ?? 0) : 0;
  if (outerSurcharge > 0) lines.push({ label: 'Premium outer fabric', amount: outerSurcharge });

  const liningSurcharge = sel.liningFabric ? (FABRIC_SURCHARGE[sel.liningFabric] ?? 0) : 0;
  if (liningSurcharge > 0) lines.push({ label: 'Premium lining fabric', amount: liningSurcharge });

  // Lace
  if (!isNone(sel.laceStyle)) lines.push({ label: 'Lace trim', amount: ADD_ON_PRICES.lace });

  // Bow / flower
  if (sel.bowChoice === 'flower') {
    lines.push({ label: 'Flower', amount: ADD_ON_PRICES.flower });
  } else if (!isNone(sel.bowChoice)) {
    lines.push({ label: 'Bow', amount: ADD_ON_PRICES.bow });
  }

  // Charm
  if (!isNone(sel.charmChoice)) lines.push({ label: 'Charm', amount: ADD_ON_PRICES.charm });

  // Zipper charm
  if (!isNone(sel.zipperCharm)) lines.push({ label: 'Zipper charm', amount: ADD_ON_PRICES.zipperCharm });

  // Monogram
  if (sel.wantsMonogram === 'Yes') lines.push({ label: 'Monogram', amount: ADD_ON_PRICES.monogram });

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, total, totalCents: Math.round(total * 100) };
}
