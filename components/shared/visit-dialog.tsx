"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CalendarCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { FieldError } from "@/components/shared/field-error";
import { submitVisit } from "@/lib/actions/inquiry";
import type { ActionResult } from "@/lib/types";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Requesting…" : "Request visit"}
    </Button>
  );
}

export function VisitDialog({
  listingId,
  propertyCode,
  defaults,
}: {
  listingId: string;
  propertyCode: string;
  defaults?: { name?: string; phone?: string };
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState<ActionResult | null, FormData>(submitVisit, null);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast({ title: "Visit requested", description: state.message });
      setOpen(false);
      formRef.current?.reset();
    } else {
      toast({ variant: "destructive", title: "Could not request", description: state.error });
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          <CalendarCheck className="h-4 w-4" /> Request a visit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a visit</DialogTitle>
          <DialogDescription>
            Pick a time for {propertyCode}. Our team confirms and coordinates with the owner.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="listingId" value={listingId} />
          <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

          <div className="space-y-1.5">
            <Label htmlFor="v-name">Full name</Label>
            <Input id="v-name" name="name" required defaultValue={defaults?.name} placeholder="Your name" />
            <FieldError errors={fieldErrors} name="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-phone">Phone</Label>
            <Input id="v-phone" name="phone" required defaultValue={defaults?.phone} placeholder="98xxxxxxxx" />
            <FieldError errors={fieldErrors} name="phone" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-date">Preferred date</Label>
              <Input id="v-date" name="preferredDate" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-time">Preferred time</Label>
              <Input id="v-time" name="preferredTime" placeholder="e.g. 2–4 PM" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-notes">Notes</Label>
            <Textarea id="v-notes" name="notes" placeholder="Anything we should know?" />
            <FieldError errors={fieldErrors} name="notes" />
          </div>
          <SubmitBtn />
        </form>
      </DialogContent>
    </Dialog>
  );
}
