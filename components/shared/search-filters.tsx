"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";

const TOGGLES = [
  { key: "furnished", label: "Furnished" },
  { key: "parking", label: "Parking" },
  { key: "petFriendly", label: "Pet friendly" },
  { key: "attachedBathroom", label: "Attached bathroom" },
  { key: "availableNow", label: "Available now" },
] as const;

export function SearchFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function apply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const sp = new URLSearchParams();

    const view = params.get("view");
    if (view) sp.set("view", view);

    for (const [k, v] of fd.entries()) {
      const val = String(v).trim();
      if (val && val !== "any") sp.set(k, val);
    }
    // checkboxes only present when checked → set "true"
    router.push(`/search?${sp.toString()}`);
  }

  function reset() {
    const sp = new URLSearchParams();
    const view = params.get("view");
    if (view) sp.set("view", view);
    router.push(`/search?${sp.toString()}`);
  }

  return (
    <form onSubmit={apply} className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold"><SlidersHorizontal className="h-4 w-4" /> Filters</h3>
        <button type="button" onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <X className="h-3 w-3" /> Reset
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f-q">Keyword</Label>
        <Input id="f-q" name="q" defaultValue={params.get("q") ?? ""} placeholder="Title contains…" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f-area">Area</Label>
        <Input id="f-area" name="area" defaultValue={params.get("area") ?? ""} placeholder="e.g. Lakeside" />
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select name="categorySlug" defaultValue={params.get("categorySlug") ?? "any"}>
          <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any category</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="f-min">Min rent</Label>
          <Input id="f-min" name="minRent" type="number" min={0} defaultValue={params.get("minRent") ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-max">Max rent</Label>
          <Input id="f-max" name="maxRent" type="number" min={0} defaultValue={params.get("maxRent") ?? ""} />
        </div>
      </div>

      <div className="space-y-2.5">
        {TOGGLES.map((t) => (
          <label key={t.key} className="flex items-center gap-2 text-sm">
            <Checkbox
              name={t.key}
              value="true"
              defaultChecked={params.get(t.key) === "true"}
            />
            {t.label}
          </label>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label>Sort</Label>
        <Select name="sort" defaultValue={params.get("sort") ?? "newest"}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rent_asc">Rent: low to high</SelectItem>
            <SelectItem value="rent_desc">Rent: high to low</SelectItem>
            <SelectItem value="popular">Most popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">Apply filters</Button>
    </form>
  );
}
