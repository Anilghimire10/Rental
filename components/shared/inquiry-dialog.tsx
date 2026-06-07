"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { MessageSquare } from "lucide-react";
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
import { submitInquiry } from "@/lib/actions/inquiry";
import type { ActionResult } from "@/lib/types";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send inquiry"}
    </Button>
  );
}

export function InquiryDialog({
  listingId,
  propertyCode,
  defaults,
}: {
  listingId: string;
  propertyCode: string;
  defaults?: { name?: string; email?: string; phone?: string };
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState<ActionResult | null, FormData>(submitInquiry, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast({ title: "Inquiry sent", description: state.message });
      setOpen(false);
      formRef.current?.reset();
    } else {
      toast({ variant: "destructive", title: "Could not send", description: state.error });
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" size="lg" className="w-full">
          <MessageSquare className="h-4 w-4" /> Send inquiry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send an inquiry</DialogTitle>
          <DialogDescription>
            Our team will connect you with this property ({propertyCode}). Your details stay private.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="listingId" value={listingId} />
          {/* Honeypot */}
          <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

          <div className="space-y-1.5">
            <Label htmlFor="iq-name">Full name</Label>
            <Input id="iq-name" name="name" required defaultValue={defaults?.name} placeholder="Your name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="iq-phone">Phone</Label>
              <Input id="iq-phone" name="phone" required defaultValue={defaults?.phone} placeholder="98xxxxxxxx" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iq-email">Email</Label>
              <Input id="iq-email" name="email" type="email" required defaultValue={defaults?.email} placeholder="you@email.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="iq-msg">Message</Label>
            <Textarea id="iq-msg" name="message" placeholder="I'm interested in this property…" />
          </div>
          <SubmitBtn />
        </form>
      </DialogContent>
    </Dialog>
  );
}
