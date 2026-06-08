"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { FieldError } from "@/components/shared/field-error";
import { submitFeedback } from "@/lib/actions/feedback";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? "Sending…" : "Send feedback"}</Button>;
}

export function FeedbackForm() {
  const [state, action] = useFormState<ActionResult | null, FormData>(submitFeedback, null);
  const [rating, setRating] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast({ title: "Thank you!", description: state.message });
      formRef.current?.reset();
      setRating(0);
    } else {
      toast({ variant: "destructive", title: "Could not send", description: state.error });
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mx-auto max-w-lg space-y-4 rounded-lg border border-border bg-card p-6 shadow-card">
      <input type="hidden" name="rating" value={rating || ""} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fb-name">Name</Label>
          <Input id="fb-name" name="name" required placeholder="Your name" />
          <FieldError errors={fieldErrors} name="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fb-email">Email (optional)</Label>
          <Input id="fb-email" name="email" type="email" placeholder="you@email.com" />
          <FieldError errors={fieldErrors} name="email" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <Star className={cn("h-6 w-6 transition", n <= rating ? "fill-accent text-accent" : "text-border")} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fb-msg">Your feedback</Label>
        <Textarea id="fb-msg" name="message" required rows={4} placeholder="Tell us what you think…" />
        <FieldError errors={fieldErrors} name="message" />
      </div>

      <Submit />
    </form>
  );
}
