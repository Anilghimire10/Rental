"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { deleteListingAction, toggleRentedAction } from "@/lib/actions/listing";

export function OwnerListingActions({
  id,
  isRented,
}: {
  id: string;
  isRented: boolean;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function toggleRented(next: boolean) {
    start(async () => {
      const res = await toggleRentedAction(id, next);
      toast(res.ok ? { title: res.message } : { variant: "destructive", title: "Error", description: res.error });
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Delete this listing permanently? This cannot be undone.")) return;
    start(async () => {
      const res = await deleteListingAction(id);
      toast(res.ok ? { title: res.message } : { variant: "destructive", title: "Error", description: res.error });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <Switch checked={isRented} onCheckedChange={toggleRented} disabled={pending} />
        Rented
      </label>
      <Button asChild variant="outline" size="sm">
        <Link href={`/owner/listings/${id}/edit`}><Pencil className="h-3.5 w-3.5" /> Edit</Link>
      </Button>
      <Button variant="ghost" size="sm" onClick={remove} disabled={pending} className="text-destructive hover:text-destructive">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
