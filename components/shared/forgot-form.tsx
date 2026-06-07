"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/types";

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</Button>;
}

export function ForgotForm() {
  const [done, setDone] = useState(false);
  const [state, action] = useFormState<ActionResult | null, FormData>(requestPasswordResetAction, null);

  useEffect(() => {
    if (state?.ok) setDone(true);
  }, [state]);

  if (done) {
    return <p className="rounded-md bg-secondary p-4 text-sm text-muted-foreground">If that email exists, a reset link is on its way. Check your inbox.</p>;
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@email.com" />
      </div>
      <Submit />
    </form>
  );
}
