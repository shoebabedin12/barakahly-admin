import { apiGet, apiPost, apiPut } from "./api";

// Mirrors barakahly-api/src/category-landings/landing-content.ts.
export const LANDING_PATTERNS = ["none", "dots", "grid", "arches", "waves"] as const;
export const LANDING_ICONS = [
  "truck",
  "shield",
  "star",
  "gift",
  "leaf",
  "sparkles",
  "heart",
  "bolt",
  "home",
  "book",
  "tag",
  "clock",
] as const;

export type LandingPattern = (typeof LANDING_PATTERNS)[number];
export type LandingIconName = (typeof LANDING_ICONS)[number];

export interface LandingContent {
  theme: { accent: string; soft: string; ink: string; pattern: LandingPattern };
  hero: { eyebrow: string; title: string; subtitle: string; ctaLabel: string; image: string | null };
  highlights: { enabled: boolean; items: { icon: LandingIconName; title: string; text: string }[] };
  featured: {
    enabled: boolean;
    title: string;
    subtitle: string;
    mode: "auto" | "manual";
    productIds: number[];
    limit: number;
  };
  promo: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    text: string;
    ctaLabel: string;
    ctaHref: string;
    image: string | null;
  };
  story: { enabled: boolean; title: string; text: string };
}

export interface LandingProductOption {
  id: number;
  name: string;
  sku: string;
  active: boolean;
  image: string | null;
}

export interface LandingEditorData {
  category: { id: number; name: string; slug: string };
  isActive: boolean;
  content: LandingContent;
  imageUrls: { hero: string | null; promo: string | null };
  products: LandingProductOption[];
}

export interface LandingListRow {
  category: { id: number; name: string; slug: string; parentId: number | null; status: boolean };
  hasLanding: boolean;
  isActive: boolean;
  accent: string | null;
  updatedAt: string | null;
}

export function listLandings() {
  return apiGet<LandingListRow[]>("/api/v1/admin/category-landings");
}

export function getLanding(categoryId: number) {
  return apiGet<LandingEditorData>(`/api/v1/admin/category-landings/${categoryId}`);
}

export function saveLanding(categoryId: number, isActive: boolean, content: LandingContent) {
  return apiPut<LandingEditorData>(`/api/v1/admin/category-landings/${categoryId}`, { isActive, content });
}

export function uploadLandingImage(file: File) {
  const body = new FormData();
  body.append("image", file);
  return apiPost<{ path: string; url: string }>("/api/v1/admin/category-landings/images", body);
}

export const THEME_PRESETS: { name: string; accent: string; soft: string; ink: string }[] = [
  { name: "Emerald", accent: "#0B3D2E", soft: "#EEF4EF", ink: "#0B3D2E" },
  { name: "Teal", accent: "#0F766E", soft: "#E9F7F5", ink: "#134E4A" },
  { name: "Ocean", accent: "#0E6BA8", soft: "#EAF4FB", ink: "#0B3A5B" },
  { name: "Indigo", accent: "#4F46E5", soft: "#EEF0FF", ink: "#1E1B4B" },
  { name: "Plum", accent: "#7E22CE", soft: "#F5EEFC", ink: "#3B0764" },
  { name: "Rose", accent: "#BE185D", soft: "#FDF0F6", ink: "#6B0F3A" },
  { name: "Saffron", accent: "#C2410C", soft: "#FFF3EA", ink: "#7C2D12" },
  { name: "Gold", accent: "#A16207", soft: "#FBF5E6", ink: "#4A3005" },
  { name: "Charcoal", accent: "#1F2937", soft: "#F1F2F4", ink: "#111827" },
];

/** Same background pattern the storefront draws behind the hero. */
export function patternImage(pattern: LandingPattern, color: string): string {
  const c = encodeURIComponent(color);
  const svg = (body: string, size: number) =>
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'%3E${body}%3C/svg%3E")`;

  switch (pattern) {
    case "dots":
      return svg(`%3Ccircle cx='2' cy='2' r='1.6' fill='${c}' fill-opacity='.18'/%3E`, 22);
    case "grid":
      return svg(`%3Cpath d='M32 0H0v32' fill='none' stroke='${c}' stroke-opacity='.12'/%3E`, 32);
    case "arches":
      return svg(
        `%3Cpath d='M4 48V26a20 20 0 0 1 40 0v22' fill='none' stroke='${c}' stroke-opacity='.14' stroke-width='1.5'/%3E`,
        48,
      );
    case "waves":
      return svg(
        `%3Cpath d='M0 20c10-8 20-8 30 0s20 8 30 0' fill='none' stroke='${c}' stroke-opacity='.16' stroke-width='1.5'/%3E`,
        60,
      );
    default:
      return "none";
  }
}

export const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL ?? "http://localhost:3000";
