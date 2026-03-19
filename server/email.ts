import { Resend } from "resend";
import { ENV } from "./_core/env";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!ENV.resendApiKey) return null;
  if (!_resend) {
    _resend = new Resend(ENV.resendApiKey);
  }
  return _resend;
}

const FROM_EMAIL = "Princess Made <orders@princessmade.com.au>";
const FALLBACK_FROM = "Princess Made <onboarding@resend.dev>";

function getFrom() {
  // Use verified domain if available, otherwise use Resend sandbox
  return ENV.isProduction ? FROM_EMAIL : FALLBACK_FROM;
}

export async function sendOrderConfirmation(opts: {
  to: string;
  orderNumber: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  guestTrackingUrl?: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.log("[Email] Resend not configured, skipping order confirmation email");
    return;
  }

  const itemRows = opts.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0e8e4; font-family: Georgia, serif; font-weight: 300;">${item.name}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0e8e4; text-align: center; font-weight: 300;">${item.quantity}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0e8e4; text-align: right; color: #c9a89a; font-family: Georgia, serif;">A$${(item.price / 100).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const trackingSection = opts.guestTrackingUrl
    ? `<p style="margin-top: 20px; font-size: 14px; color: #8a7a72;">
        <a href="${opts.guestTrackingUrl}" style="color: #c9a89a; text-decoration: underline;">Track your order here</a>
      </p>`
    : "";

  try {
    await resend.emails.send({
      from: getFrom(),
      to: opts.to,
      subject: `Order Confirmed — ${opts.orderNumber} ✨`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #3d3530; background: #faf8f6; padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0;">Thank You! 💕</h1>
            <p style="color: #8a7a72; font-weight: 300; margin-top: 8px;">Your order has been confirmed</p>
          </div>

          <div style="background: white; border: 1px solid #f0e8e4; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a72; margin: 0 0 8px 0;">Order Number</p>
            <p style="font-family: Georgia, serif; font-size: 18px; margin: 0; font-weight: 300;">${opts.orderNumber}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #f0e8e4;">
                <th style="text-align: left; padding: 8px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a72; font-weight: 300;">Item</th>
                <th style="text-align: center; padding: 8px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a72; font-weight: 300;">Qty</th>
                <th style="text-align: right; padding: 8px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a72; font-weight: 300;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div style="background: white; border: 1px solid #f0e8e4; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a72; font-weight: 300;">Total</span>
            <span style="font-family: Georgia, serif; font-size: 22px; color: #c9a89a; font-weight: 300;">A$${(opts.totalAmount / 100).toFixed(2)}</span>
          </div>

          ${trackingSection}

          <div style="margin-top: 30px; padding-top: 24px; border-top: 1px solid #f0e8e4; text-align: center;">
            <p style="font-size: 13px; color: #8a7a72; font-weight: 300;">We're preparing your order with love and care. You'll receive a tracking number once it ships.</p>
            <p style="font-size: 12px; color: #b0a49c; margin-top: 16px;">Handmade in Australia 🇦🇺</p>
            <p style="font-size: 11px; color: #c4b8b0;">Princess Made — princessmadefashion@gmail.com</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Order confirmation sent to ${opts.to}`);
  } catch (err) {
    console.error("[Email] Failed to send order confirmation:", err);
  }
}

export async function sendShippingUpdate(opts: {
  to: string;
  orderNumber: string;
  trackingNumber: string;
  shippingStatus: string;
  trackingUrl: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.log("[Email] Resend not configured, skipping shipping update email");
    return;
  }

  const statusMessages: Record<string, string> = {
    processing: "We're preparing your order with care.",
    shipped: "Your order is on its way! 🎉",
    in_transit: "Your order is in transit and heading to you.",
    delivered: "Your order has been delivered! We hope you love it 💕",
  };

  const message = statusMessages[opts.shippingStatus] || "Your order status has been updated.";

  try {
    await resend.emails.send({
      from: getFrom(),
      to: opts.to,
      subject: `Shipping Update — ${opts.orderNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #3d3530; background: #faf8f6; padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0;">Shipping Update</h1>
            <p style="color: #8a7a72; font-weight: 300; margin-top: 8px;">${opts.orderNumber}</p>
          </div>

          <div style="background: white; border: 1px solid #f0e8e4; padding: 24px; margin-bottom: 24px; text-align: center;">
            <p style="font-size: 16px; font-weight: 300; margin: 0 0 16px 0;">${message}</p>
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a72; margin: 0 0 8px 0;">Tracking Number</p>
            <p style="font-family: monospace; font-size: 16px; margin: 0; color: #c9a89a;">${opts.trackingNumber}</p>
            <a href="${opts.trackingUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 32px; background: #c9a89a; color: white; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 300;">Track Package</a>
          </div>

          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f0e8e4;">
            <p style="font-size: 12px; color: #b0a49c;">Handmade in Australia 🇦🇺</p>
            <p style="font-size: 11px; color: #c4b8b0;">Princess Made — princessmadefashion@gmail.com</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Shipping update sent to ${opts.to}`);
  } catch (err) {
    console.error("[Email] Failed to send shipping update:", err);
  }
}
