"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
    start(async () => {
      const res = await deleteListingAction(id);
      toast(res.ok ? { title: res.message } : { variant: "destructive", title: "Error", description: res.error });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 text-xs font-medium">
        <Switch checked={!isRented} onCheckedChange={(available) => toggleRented(!available)} disabled={pending} />
        <span className={isRented ? "text-destructive" : "text-emerald-600"}>
          {isRented ? "Unavailable" : "Available"}
        </span>
      </label>
      <Button asChild variant="outline" size="sm">
        <Link href={`/owner/listings/${id}/edit`}><Pencil className="h-3.5 w-3.5" /> Edit</Link>
      </Button>
      <ConfirmDialog
        title="Delete this listing?"
        description="This permanently removes the listing and cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
      >
        <Button variant="ghost" size="sm" disabled={pending} className="text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </ConfirmDialog>
    </div>
  );
}
