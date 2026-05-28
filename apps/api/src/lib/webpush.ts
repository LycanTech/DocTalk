import webpush from "web-push";
import { logger } from "./logger";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? "admin@doctalk.ng"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  type?: string;
}

export async function sendPushNotification(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: PushPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      { endpoint, keys: { p256dh, auth } },
      JSON.stringify({ ...payload, icon: payload.icon ?? "/icons/icon-192.png" })
    );
    return true;
  } catch (err: unknown) {
    // 410 = subscription expired/unsubscribed
    if ((err as { statusCode?: number }).statusCode === 410) {
      return false;
    }
    logger.warn({ err, endpoint }, "Push notification failed");
    return false;
  }
}
