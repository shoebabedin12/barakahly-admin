import { apiDelete, apiGet, apiPost } from "./api";

export const pushSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration() {
  return navigator.serviceWorker.register("/sw.js");
}

export async function currentSubscription() {
  if (!pushSupported()) return null;
  return (await registration()).pushManager.getSubscription();
}

/** Asks permission, subscribes this browser and registers it with the API. */
export async function enablePush(): Promise<boolean> {
  if ((await Notification.requestPermission()) !== "granted") return false;
  const { publicKey } = await apiGet<{ publicKey: string }>("/api/v1/admin/push/public-key");
  const reg = await registration();
  let sub = await reg.pushManager.getSubscription();
  // A subscription made with an older key (e.g. from the Laravel panel) can't receive ours.
  const keyMatches =
    sub?.options.applicationServerKey &&
    new Uint8Array(sub.options.applicationServerKey).toString() === urlBase64ToUint8Array(publicKey).toString();
  if (sub && !keyMatches) {
    await sub.unsubscribe();
    sub = null;
  }
  sub ??= await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  await apiPost("/api/v1/admin/push/subscriptions", sub.toJSON());
  return true;
}

export async function disablePush() {
  const sub = await currentSubscription();
  if (!sub) return;
  await apiDelete("/api/v1/admin/push/subscriptions", { endpoint: sub.endpoint }).catch(() => {});
  await sub.unsubscribe();
}
