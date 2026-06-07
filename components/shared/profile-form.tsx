"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { updateProfileAction } from "@/lib/actions/profile";
import type { ActionResult, SessionUser } from "@/lib/types";

function SaveBtn() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>;
}

export function ProfileForm({ user }: { user: SessionUser }) {
  const [state, action] = useFormState<ActionResult | null, FormData>(updateProfileAction, null);

  useEffect(() => {
    if (!state) return;
    toast(
      state.ok
        ? { title: "Saved", description: state.message }
        : { variant: "destructive", title: "Error", description: state.error },
    );
  }, [state]);

  return (
    <form action={action} className="max-w-lg space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={user.name} required />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input value={user.email} disabled />
        <p className="text-xs text-muted-foreground">Email can't be changed here.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={user.phone ?? ""} placeholder="98xxxxxxxx" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={user.whatsapp ?? ""} placeholder="98xxxxxxxx" />
        </div>
      </div>
      <SaveBtn />
    </form>
  );
}
