import { NextResponse } from "next/server";
import { uploadListingImage } from "@/lib/services/storageService";
import { AuthError } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/upload — validated image upload for property photos.
 * Auth + role + verification + mime/size validation all happen server-side in
 * storageService. Returns the public URL on success.
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    const url = await uploadListingImage(file);
    return NextResponse.json({ url });
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 400;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed." },
      { status },
    );
  }
}
