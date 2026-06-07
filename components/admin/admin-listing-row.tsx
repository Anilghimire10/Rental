"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X, Star, Trash2, Phone, Mail, ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { ListingStatusBadge } from "@/components/shared/status-badge";
import { toast } from "@/components/ui/use-toast";
import {
  moderateListingAction, setFeaturedAction, adminDeleteListingAction,
} from "@/lib/actions/admin";
import { formatPrice } from "@/lib/utils";
import type { AdminListing } from "@/lib/types";

export function AdminListingRow({ listing }: { listing: AdminListing }) {
  const [pending, start] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    start(async () => {
      const res = await fn();
      toast(res.ok ? { title: res.message } : { variant: "destructive", title: "Error", description: res.error });
      router.refresh();
    });

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row">
        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-md bg-secondary lg:w-44">
          {listing.coverImage && <Image src={listing.coverImage} alt={listing.title} fill sizes="176px" className="object-cover" />}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{listing.propertyCode}</span>
            <ListingStatusBadge status={listing.status} />
            {listing.isFeatured && <Star className="h-4 w-4 fill-accent text-accent" />}
          </div>
          <Link href={`/property/${listing.slug}`} className="mt-1 flex items-center gap-1 font-serif text-lg font-semibold hover:text-primary">
            {listing.title} <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
          <p className="text-sm text-muted-foreground">{listing.area}, {listing.city} · {formatPrice(listing.monthlyRent)}/mo</p>

          {/* Private owner contact — admin only */}
          <div className="mt-2 rounded-md bg-secondary/60 p-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Owner (private): </span>
            {listing.ownerName ?? listing.accountOwnerName}
            {listing.ownerPhone && <span className="ml-2 inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {listing.ownerPhone}</span>}
            {listing.ownerEmail && <span className="ml-2 inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {listing.ownerEmail}</span>}
            <span className="ml-2">· {listing.inquiryCount} inquiries · {listing.visitCount} visits</span>
          </div>
          {listing.status === "rejected" && listing.rejectionReason && (
            <p className="mt-1 text-xs text-destructive">Reason: {listing.rejectionReason}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
          {listing.status !== "approved" && (
            <Button size="sm" disabled={pending} onClick={() => run(() => moderateListingAction({ listingId: listing.id, action: "approve" }))}>
              <Check className="h-4 w-4" /> Approve
            </Button>
          )}
          {listing.status !== "rejected" && (
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={pending}><X className="h-4 w-4" /> Reject</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Reject listing</DialogTitle></DialogHeader>
                <Textarea placeholder="Reason (shown to the owner)" value={reason} onChange={(e) => setReason(e.target.value)} />
                <DialogFooter>
                  <Button variant="destructive" disabled={pending} onClick={() => {
                    setRejectOpen(false);
                    run(() => moderateListingAction({ listingId: listing.id, action: "reject", rejectionReason: reason }));
                  }}>Confirm reject</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(() => setFeaturedAction(listing.id, !listing.isFeatured))}>
            <Star className="h-4 w-4" /> {listing.isFeatured ? "Unfeature" : "Feature"}
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/owner/listings/${listing.id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} className="text-destructive hover:text-destructive"
            onClick={() => { if (confirm("Delete this listing?")) run(() => adminDeleteListingAction(listing.id)); }}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
