"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";

/** Big hero search. Composes a /search query from area + category + max rent. */
export function SearchBar({ categories }: { categories: Category[] }) {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const sp = new URLSearchParams();
    const area = String(fd.get("area") || "").trim();
    const cat = String(fd.get("categorySlug") || "");
    const max = String(fd.get("maxRent") || "").trim();
    if (area) sp.set("area", area);
    if (cat && cat !== "any") sp.set("categorySlug", cat);
    if (max) sp.set("maxRent", max);
    router.push(`/search?${sp.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid w-full gap-3 sm:grid-cols-[1.6fr_1fr_1fr_auto]"
    >
      <Input name="area" placeholder="Area (e.g. Lakeside)" aria-label="Area" />

      <Select name="categorySlug" defaultValue="any">
        <SelectTrigger aria-label="Property type"><SelectValue placeholder="Any type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any type</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input name="maxRent" type="number" min={0} placeholder="Max rent (Rs.)" aria-label="Max rent" />

      <Button type="submit" variant="accent" className="h-10 px-8">
        <Search className="h-4 w-4" /> Search
      </Button>
    </form>
  );
}
