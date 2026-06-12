"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

/**
 * Multi-image uploader. Uploads each file to /api/upload (server-validated) and
 * stores the returned public URLs. The first image is the cover. Max 20.
 */
export function ImageUploader({
  value,
  onChange,
  max = 20,
  single = false,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  single?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = max - value.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) {
      toast({ variant: "destructive", title: "Limit reached", description: `Up to ${max} photos.` });
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];
    for (const file of toUpload) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        uploaded.push(json.url);
      } catch (e) {
        toast({ variant: "destructive", title: "Upload failed", description: e instanceof Error ? e.message : "" });
      }
    }
    onChange([...value, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }
  function makeCover(url: string) {
    onChange([url, ...value.filter((u) => u !== url)]);
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/40 p-8 text-center transition hover:border-accent"
      >
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{uploading ? "Uploading…" : single ? "Click to upload an image" : "Click to upload photos"}</p>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP · up to 5 MB{single ? "" : " each · max " + max}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((url, i) => (
            <div key={url} className={cn("group relative aspect-square overflow-hidden rounded-md border", i === 0 ? "border-accent" : "border-border")}>
              <Image src={url} alt={`Photo ${i + 1}`} fill sizes="120px" className="object-cover" />
              {i === 0 && !single && (
                <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">Cover</span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition group-hover:opacity-100">
                {i !== 0 && (
                  <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => makeCover(url)} title="Make cover">
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button type="button" size="icon" variant="destructive" className="h-7 w-7" onClick={() => remove(url)} title="Remove">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
