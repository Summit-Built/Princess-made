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

export async function sendPasswordResetEmail(opts: {
  to: string;
  resetLink: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.log("[Email] Resend not configured, skipping password reset email");
    return;
  }

  try {
    await resend.emails.send({
      from: getFrom(),
      to: opts.to,
      subject: "Reset Your Password — Princess Made",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #3d3530; background: #faf8f6; padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0;">Password Reset</h1>
            <p style="color: #8a7a72; font-weight: 300; margin-top: 8px;">You requested a password reset for your Princess Made account.</p>
          </div>

          <div style="background: white; border: 1px solid #f0e8e4; padding: 24px; margin-bottom: 24px; text-align: center;">
            <p style="font-size: 14px; font-weight: 300; margin: 0 0 20px 0;">Click the button below to set a new password. This link expires in 1 hour.</p>
            <a href="${opts.resetLink}" style="display: inline-block; padding: 14px 36px; background: #c9a89a; color: white; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 300;">Reset Password</a>
          </div>

          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f0e8e4;">
            <p style="font-size: 13px; color: #8a7a72; font-weight: 300;">If you didn't request this, you can safely ignore this email.</p>
            <p style="font-size: 12px; color: #b0a49c; margin-top: 16px;">Handmade in Australia</p>
            <p style="font-size: 11px; color: #c4b8b0;">Princess Made — princessmadefashion@gmail.com</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Password reset email sent to ${opts.to}`);
  } catch (err) {
    console.error("[Email] Failed to send password reset email:", err);
  }
}

export async function sendOrderCancellation(opts: {
  to: string;
  orderNumber: string;
  totalAmount: number;
}) {
  const resend = getResend();
  if (!resend) {
    console.log("[Email] Resend not configured, skipping order cancellation email");
    return;
  }

  try {
    await resend.emails.send({
      from: getFrom(),
      to: opts.to,
      subject: `Order Cancelled — ${opts.orderNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #3d3530; background: #faf8f6; padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0;">Order Cancelled</h1>
            <p style="color: #8a7a72; font-weight: 300; margin-top: 8px;">Your order has been cancelled as requested</p>
          </div>

          <div style="background: white; border: 1px solid #f0e8e4; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a72; margin: 0 0 8px 0;">Order Number</p>
            <p style="font-family: Georgia, serif; font-size: 18px; margin: 0 0 16px 0; font-weight: 300;">${opts.orderNumber}</p>
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a72; margin: 0 0 8px 0;">Refund Amount</p>
            <p style="font-family: Georgia, serif; font-size: 18px; margin: 0; color: #c9a89a; font-weight: 300;">A$${(opts.totalAmount / 100).toFixed(2)}</p>
          </div>

          <div style="background: white; border: 1px solid #f0e8e4; padding: 20px 24px; margin-bottom: 24px; text-align: center;">
            <p style="font-size: 14px; font-weight: 300; margin: 0; color: #8a7a72;">If you were charged, a refund will be processed to your original payment method within 5–10 business days.</p>
          </div>

          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f0e8e4;">
            <p style="font-size: 13px; color: #8a7a72; font-weight: 300;">Changed your mind? We'd love to have you back anytime.</p>
            <p style="font-size: 12px; color: #b0a49c; margin-top: 16px;">Handmade in Australia 🇦🇺</p>
            <p style="font-size: 11px; color: #c4b8b0;">Princess Made — princessmadefashion@gmail.com</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Order cancellation sent to ${opts.to}`);
  } catch (err) {
    console.error("[Email] Failed to send order cancellation:", err);
  }
}

export async function sendDeliveryConfirmation(opts: {
  to: string;
  orderNumber: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.log("[Email] Resend not configured, skipping delivery confirmation email");
    return;
  }

  try {
    await resend.emails.send({
      from: getFrom(),
      to: opts.to,
      subject: `Delivered! — ${opts.orderNumber} 💕`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #3d3530; background: #faf8f6; padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0;">Your Order Has Arrived! 🎉</h1>
            <p style="color: #8a7a72; font-weight: 300; margin-top: 8px;">${opts.orderNumber}</p>
          </div>

          <div style="background: white; border: 1px solid #f0e8e4; padding: 24px; margin-bottom: 24px; text-align: center;">
            <p style="font-size: 16px; font-weight: 300; margin: 0 0 16px 0;">We hope you love your new handmade piece!</p>
            <p style="font-size: 14px; font-weight: 300; color: #8a7a72; margin: 0;">Each item is made with so much love and care — we'd be thrilled if you shared it on Instagram and tagged us!</p>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://www.instagram.com/princessmadefashion/" style="display: inline-block; padding: 12px 32px; background: #c9a89a; color: white; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 300;">Tag Us @princessmadefashion</a>
          </div>

          <div style="background: white; border: 1px solid #f0e8e4; padding: 20px 24px; text-align: center; margin-bottom: 24px;">
            <p style="font-size: 13px; font-weight: 300; color: #8a7a72; margin: 0;">Something not right with your order? Please reach out within 7 days and we'll sort it out.</p>
            <p style="margin-top: 8px;"><a href="mailto:princessmadefashion@gmail.com" style="color: #c9a89a; text-decoration: underline; font-size: 13px;">princessmadefashion@gmail.com</a></p>
          </div>

          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f0e8e4;">
            <p style="font-size: 12px; color: #b0a49c;">Handmade in Australia 🇦🇺</p>
            <p style="font-size: 11px; color: #c4b8b0;">Princess Made — princessmadefashion@gmail.com</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Delivery confirmation sent to ${opts.to}`);
  } catch (err) {
    console.error("[Email] Failed to send delivery confirmation:", err);
  }
}

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string | null;
}) {
  const resend = getResend();
  if (!resend) {
    console.log("[Email] Resend not configured, skipping welcome email");
    return;
  }

  const greeting = opts.name ? `Welcome, ${opts.name}!` : "Welcome!";

  try {
    await resend.emails.send({
      from: getFrom(),
      to: opts.to,
      subject: `Welcome to Princess Made! 💕`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #3d3530; background: #faf8f6; padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0;">${greeting}</h1>
            <p style="color: #8a7a72; font-weight: 300; margin-top: 8px;">You're now part of the Princess Made family</p>
          </div>

          <div style="background: white; border: 1px solid #f0e8e4; padding: 24px; margin-bottom: 24px; text-align: center;">
            <p style="font-size: 15px; font-weight: 300; margin: 0 0 16px 0;">Thank you for joining us! Here's what you can do with your account:</p>
            <div style="text-align: left; padding: 0 16px;">
              <p style="font-size: 14px; font-weight: 300; color: #8a7a72; margin: 8px 0;">&#10084;&#65039; Save your favourite items to your wishlist</p>
              <p style="font-size: 14px; font-weight: 300; color: #8a7a72; margin: 8px 0;">&#128230; Track your orders and shipping</p>
              <p style="font-size: 14px; font-weight: 300; color: #8a7a72; margin: 8px 0;">&#128205; Save shipping addresses for faster checkout</p>
              <p style="font-size: 14px; font-weight: 300; color: #8a7a72; margin: 8px 0;">&#9997;&#65039; Request custom handmade pieces</p>
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://princessmade.com.au/shop" style="display: inline-block; padding: 14px 36px; background: #c9a89a; color: white; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 300;">Start Shopping</a>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <p style="font-size: 13px; color: #8a7a72; font-weight: 300;">Follow us for behind-the-scenes and new drops:</p>
            <a href="https://www.instagram.com/princessmadefashion/" style="color: #c9a89a; text-decoration: underline; font-size: 13px;">@princessmadefashion</a>
          </div>

          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f0e8e4;">
            <p style="font-size: 12px; color: #b0a49c;">Handmade in Australia 🇦🇺</p>
            <p style="font-size: 11px; color: #c4b8b0;">Princess Made — princessmadefashion@gmail.com</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Welcome email sent to ${opts.to}`);
  } catch (err) {
    console.error("[Email] Failed to send welcome email:", err);
  }
}

export async function sendNewsletterConfirmation(opts: {
  to: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.log("[Email] Resend not configured, skipping newsletter confirmation email");
    return;
  }

  try {
    await resend.emails.send({
      from: getFrom(),
      to: opts.to,
      subject: "You're In! — Princess Made Newsletter ✨",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #3d3530; background: #faf8f6; padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0;">You're Subscribed! ✨</h1>
            <p style="color: #8a7a72; font-weight: 300; margin-top: 8px;">Thanks for joining the Princess Made newsletter</p>
          </div>

          <div style="background: white; border: 1px solid #f0e8e4; padding: 24px; margin-bottom: 24px; text-align: center;">
            <p style="font-size: 15px; font-weight: 300; margin: 0;">You'll be the first to know about new collections, restocks, and exclusive offers. We promise not to spam — only the good stuff!</p>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://princessmade.com.au/shop" style="display: inline-block; padding: 12px 32px; background: #c9a89a; color: white; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 300;">Browse Collection</a>
          </div>

          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f0e8e4;">
            <p style="font-size: 12px; color: #b0a49c;">Handmade in Australia 🇦🇺</p>
            <p style="font-size: 11px; color: #c4b8b0;">Princess Made — princessmadefashion@gmail.com</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Newsletter confirmation sent to ${opts.to}`);
  } catch (err) {
    console.error("[Email] Failed to send newsletter confirmation:", err);
  }
}

export async function sendContactFormNotification(opts: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.log("[Email] Resend not configured, skipping contact form notification");
    return;
  }

  try {
    await resend.emails.send({
      from: getFrom(),
      to: "princessmadefashion@gmail.com",
      replyTo: opts.email,
      subject: `Contact Form: ${opts.subject}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #3d3530; background: #faf8f6; padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0;">New Contact Message</h1>
          </div>

          <div style="background: white; border: 1px solid #f0e8e4; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a72; margin: 0 0 4px 0;">From</p>
            <p style="font-size: 16px; margin: 0 0 16px 0; font-weight: 300;">${opts.name} &lt;${opts.email}&gt;</p>

            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a72; margin: 0 0 4px 0;">Subject</p>
            <p style="font-size: 16px; margin: 0 0 16px 0; font-weight: 300;">${opts.subject}</p>

            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a72; margin: 0 0 4px 0;">Message</p>
            <p style="font-size: 14px; margin: 0; font-weight: 300; white-space: pre-wrap; line-height: 1.6;">${opts.message}</p>
          </div>

          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f0e8e4;">
            <p style="font-size: 12px; color: #b0a49c;">Reply directly to this email to respond to the customer.</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Contact form notification sent for ${opts.email}`);
  } catch (err) {
    console.error("[Email] Failed to send contact form notification:", err);
  }
}
