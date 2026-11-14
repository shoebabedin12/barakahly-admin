// New-order notifications for the admin panel (ported from Laravel's public/sw.js).
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "Barakahly", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Barakahly", {
      body: data.body || "",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      data: { url: data.url || "/orders" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/orders", self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      return clients.openWindow ? clients.openWindow(url) : undefined;
    }),
  );
});
