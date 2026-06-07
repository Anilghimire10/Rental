import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an integer amount as NPR currency (no decimals). */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Slightly jitter a coordinate so the "approximate" marker never reveals the exact pin. */
export function jitterCoord(value: number, meters = 250): number {
  // ~111,111 m per degree of latitude; good enough for an approximate circle.
  const deltaDeg = meters / 111_111;
  // Deterministic-ish pseudo jitter based on the value to stay stable per render.
  const seed = Math.sin(value * 1000) * 10_000;
  const frac = seed - Math.floor(seed);
  return value + (frac - 0.5) * 2 * deltaDeg;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** URL-safe slug from arbitrary text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * SEO listing slug, e.g. "pkr-123-room-lakeside".
 * The propertyCode prefix is what we look the listing up by, so it must come
 * first and stay stable even if the title/area change.
 */
export function listingSlug(opts: {
  propertyCode: string;
  title: string;
  area: string;
}): string {
  return [opts.propertyCode, opts.title, opts.area]
    .map(slugify)
    .filter(Boolean)
    .join("-");
}

/** Extract the propertyCode (e.g. "pkr-123") from a listing slug. */
export function propertyCodeFromSlug(slug: string): string | null {
  const m = slug.match(/^([a-z]+-\d+)/i);
  return m ? m[1].toUpperCase() : null;
}

/** Build a wa.me click-to-chat URL with a prefilled message. */
export function whatsappLink(number: string, message?: string): string {
  const clean = number.replace(/[^0-9]/g, "");
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${clean}${q}`;
}
