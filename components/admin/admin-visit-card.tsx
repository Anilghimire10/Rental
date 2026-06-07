"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Home, CalendarDays, MessageCircle, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { VisitStatusBadge } from "@/components/shared/status-badge";
import { toast } from "@/components/ui/use-toast";
import { updateVisitAction } from "@/lib/actions/admin";
import { whatsappLink, formatDate } from "@/lib/utils";
import type { AdminVisit, VisitStatus } from "@/lib/types";

export function AdminVisitCard({ visit }: { visit: AdminVisit }) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<VisitStatus>(visit.status);
  const [notes, setNotes] = useState(visit.adminNotes);
  const router = useRouter();

  function save() {
    start(async () => {
      const res = await updateVisitAction({ visitId: visit.id, status, adminNotes: notes });
      toast(res.ok ? { title: res.message } : { variant: "destructive", title: "Error", description: res.error });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="grid gap-4 p-5 lg:grid-cols-3">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            Tenant <VisitStatusBadge status={visit.status} />
          </p>
          <p className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-muted-foreground" /> {visit.name}</p>
          <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /> {visit.phone}</p>
          <p className="flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4 text-muted-foreground" /> {formatDate(visit.preferredDate)} {visit.preferredTime ?? ""}</p>
          <a href={whatsappLink(visit.phone)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp tenant
          </a>
          {visit.notes && <p className="mt-2 rounded bg-secondary/60 p-2 text-xs text-foreground/80">“{visit.notes}”</p>}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Property & owner</p>
          <p className="flex items-center gap-2 text-sm"><Home className="h-4 w-4 text-muted-foreground" /> {visit.propertyCode} — {visit.listingTitle}</p>
          <div className="mt-2 rounded bg-secondary/60 p-2 text-xs">
            <p className="font-medium">{visit.ownerName ?? "—"}</p>
            {visit.ownerPhone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {visit.ownerPhone}</p>}
            {visit.ownerWhatsapp && (
              <a href={whatsappLink(visit.ownerWhatsapp)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:underline">
                <MessageCircle className="h-3 w-3" /> WhatsApp owner
              </a>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Manage</p>
          <Select value={status} onValueChange={(v) => setStatus(v as VisitStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed (emails tenant)</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Textarea rows={3} placeholder="Internal notes…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button size="sm" className="w-full" disabled={pending} onClick={save}><Save className="h-4 w-4" /> Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
