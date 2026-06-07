"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, Home, MessageCircle, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { InquiryStatusBadge } from "@/components/shared/status-badge";
import { toast } from "@/components/ui/use-toast";
import { updateInquiryAction } from "@/lib/actions/admin";
import { whatsappLink, formatDate } from "@/lib/utils";
import type { AdminInquiry, InquiryStatus } from "@/lib/types";

export function AdminInquiryCard({ inquiry }: { inquiry: AdminInquiry }) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [notes, setNotes] = useState(inquiry.adminNotes);
  const router = useRouter();

  function save() {
    start(async () => {
      const res = await updateInquiryAction({ inquiryId: inquiry.id, status, adminNotes: notes });
      toast(res.ok ? { title: res.message } : { variant: "destructive", title: "Error", description: res.error });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="grid gap-4 p-5 lg:grid-cols-3">
        {/* Tenant (renter) contact */}
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            Tenant <InquiryStatusBadge status={inquiry.status} />
          </p>
          <p className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-muted-foreground" /> {inquiry.name}</p>
          <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /> {inquiry.phone}</p>
          <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /> {inquiry.email}</p>
          <a href={whatsappLink(inquiry.phone)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp tenant
          </a>
          {inquiry.message && <p className="mt-2 rounded bg-secondary/60 p-2 text-xs text-foreground/80">“{inquiry.message}”</p>}
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(inquiry.createdAt)}</p>
        </div>

        {/* Property + matched owner contact */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Property & owner</p>
          <p className="flex items-center gap-2 text-sm"><Home className="h-4 w-4 text-muted-foreground" /> {inquiry.propertyCode} — {inquiry.listingTitle}</p>
          <div className="mt-2 rounded bg-secondary/60 p-2 text-xs">
            <p className="font-medium">{inquiry.ownerName ?? "—"}</p>
            {inquiry.ownerPhone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {inquiry.ownerPhone}</p>}
            {inquiry.ownerEmail && <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {inquiry.ownerEmail}</p>}
            {inquiry.ownerWhatsapp && (
              <a href={whatsappLink(inquiry.ownerWhatsapp)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:underline">
                <MessageCircle className="h-3 w-3" /> WhatsApp owner
              </a>
            )}
          </div>
        </div>

        {/* Mediation controls */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Mediate</p>
          <Select value={status} onValueChange={(v) => setStatus(v as InquiryStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Textarea rows={3} placeholder="Internal notes…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button size="sm" className="w-full" disabled={pending} onClick={save}><Save className="h-4 w-4" /> Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
