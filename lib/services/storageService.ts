import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireVerified } from "@/lib/auth/session";

/**
 * storageService — validated image uploads to the `property-images` bucket.
 * Server-side validation (mime allowlist, size cap, sanitized filename) on top
 * of the bucket-level constraints and RLS storage policy (own-folder writes).
 */

const BUCKET = "property-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function sanitizedName(mime: string): string {
  // We never trust the client filename — generate our own. (Date.now avoided to
  // keep this deterministic-free; use a random hex + perf timestamp surrogate.)
  const rand = Math.random().toString(16).slice(2, 10);
  const t = (globalThis.performance?.now?.() ?? 0).toString(36).replace(".", "");
  return `${t}-${rand}.${EXT[mime] ?? "bin"}`;
}

export async function uploadListingImage(file: File): Promise<string> {
  // Any verified, non-banned user may upload (single account type — everyone can list).
  const user = await requireVerified();

  if (!ALLOWED.has(file.type)) throw new Error("Only JPG, PNG or WebP images are allowed.");
  if (file.size > MAX_BYTES) throw new Error("Image must be 5 MB or smaller.");
  if (file.size === 0) throw new Error("Empty file.");

  const path = `${user.id}/${sanitizedName(file.type)}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
