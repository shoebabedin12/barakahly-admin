// Product images live on Laravel's public storage disk (same APP_URL value
// as barakahly-api's .env), not on the NestJS API itself.
const ASSET_BASE = import.meta.env.VITE_ASSET_URL ?? "http://localhost:4000";

export function assetUrl(path: string | null): string | null {
  if (!path) return null;
  return `${ASSET_BASE}/storage/${path}`;
}
