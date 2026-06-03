import webpush from "web-push";
import { ENV } from "./_core/env";
import * as db from "./db";

let configured = false;

function setup() {
  if (configured) return;
  if (!ENV.vapidPublicKey || !ENV.vapidPrivateKey) return;
  webpush.setVapidDetails(
    "mailto:princessmadefashion@gmail.com",
    ENV.vapidPublicKey,
    ENV.vapidPrivateKey
  );
  configured = true;
}

export async function sendPushToAll(payload: { title: string; body: string; url?: string }) {
  setup();
  if (!configured) {
    console.log("[Push] VAPID keys not configured, skipping push notification");
    return;
  }

  const subscriptions = await db.getAllPushSubscriptions();
  if (!subscriptions.length) return;

  const message = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map(async (row) => {
      try {
        const sub = JSON.parse(row.subscription) as webpush.PushSubscription;
        await webpush.sendNotification(sub, message);
      } catch (err: any) {
        // 410 Gone = subscription expired/unsubscribed, remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.deletePushSubscription(row.endpoint);
          console.log("[Push] Removed expired subscription:", row.endpoint);
        } else {
          console.error("[Push] Failed to send notification:", err.message);
        }
      }
    })
  );
}
