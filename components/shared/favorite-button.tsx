"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { toggleFavoriteAction } from "@/lib/actions/favorite";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  listingId,
  initialFavorited,
  isAuthed,
  variant = "icon",
}: {
  listingId: string;
  initialFavorited: boolean;
  isAuthed: boolean;
  variant?: "icon" | "full";
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    if (!isAuthed) {
      toast({ title: "Sign in to save", description: "Create a free account to shortlist properties." });
      router.push("/auth/login?next=/search");
      return;
    }
    // Optimistic.
    setFavorited((f) => !f);
    startTransition(async () => {
      const res = await toggleFavoriteAction(listingId);
      if (!res.ok) {
        setFavorited((f) => !f); // revert
        toast({ variant: "destructive", title: "Could not update", description: res.error });
      }
    });
  }

  if (variant === "full") {
    return (
      <Button type="button" variant="outline" onClick={onClick} disabled={pending}>
        <Heart className={cn("h-4 w-4", favorited && "fill-accent text-accent")} />
        {favorited ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={favorited ? "Remove from saved" : "Save property"}
      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow-card backdrop-blur transition hover:scale-105"
    >
      <Heart className={cn("h-4 w-4", favorited ? "fill-accent text-accent" : "text-foreground/70")} />
    </button>
  );
}
