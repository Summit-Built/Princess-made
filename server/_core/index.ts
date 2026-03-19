import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./authRoutes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleWebhookEvent } from "../stripe";
import * as db from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Stripe webhook must use raw body - register BEFORE json middleware
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }

    try {
      const event = await handleWebhookEvent(req.body, signature);
      console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          await db.updateOrderStatus(session.id, "completed");
          // Store the payment intent ID on the order for future refund/failure lookups
          if (session.payment_intent) {
            await db.updateOrderPaymentIntent(session.id, session.payment_intent);
          }
          console.log(`[Stripe] Order completed: ${session.id}`);
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as any;
          const failureMessage = paymentIntent.last_payment_error?.message || "Unknown error";
          console.log(`[Stripe] Payment failed: ${paymentIntent.id} - ${failureMessage}`);
          await db.updateOrderStatusByPaymentIntent(paymentIntent.id, "failed");
          break;
        }

        case "charge.refunded": {
          const charge = event.data.object as any;
          const paymentIntentId = charge.payment_intent;
          console.log(`[Stripe] Charge refunded: ${charge.id} (PI: ${paymentIntentId})`);
          if (paymentIntentId) {
            await db.updateOrderStatusByPaymentIntent(paymentIntentId, "refunded");
          }
          break;
        }

        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("[Stripe] Webhook error:", error);
      res.status(400).json({ error: "Webhook verification failed" });
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Auth routes (login/register)
  registerAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
