export const ENV = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "default-dev-secret",
  adminEmails: [process.env.ADMIN_EMAIL, "tommyrosato@gmail.com"].filter(Boolean).map(e => e!.toLowerCase()),
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
