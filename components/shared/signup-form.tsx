"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { signUpAction } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/types";

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || disabled}>
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [state, action] = useFormState<ActionResult | null, FormData>(signUpAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast({ title: "Account created", description: state.message });
      router.push("/auth/verify");
    } else {
      toast({ variant: "destructive", title: "Sign up failed", description: state.error });
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required placeholder="Your name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="su-email">Email</Label>
        <Input id="su-email" name="email" type="email" autoComplete="email" required placeholder="you@email.com" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" placeholder="98xxxxxxxx" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="su-password">Password</Label>
        <Input id="su-password" name="password" type="password" autoComplete="new-password" required />
        <p className="text-xs text-muted-foreground">8+ chars with upper, lower and a number.</p>
      </div>

      {/* Terms & Conditions — required */}
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <Checkbox
          name="terms"
          value="yes"
          checked={accepted}
          onCheckedChange={(v) => setAccepted(v === true)}
          className="mt-0.5"
        />
        <span>
          I agree to the{" "}
          <Link href="/policy" target="_blank" className="font-medium text-accent hover:underline">
            Terms &amp; Conditions and Privacy Policy
          </Link>
          .
        </span>
      </label>

      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <Submit disabled={!accepted} />
      <p className="text-center text-xs text-muted-foreground">
        One account — browse homes and list your own property, all in one place.
      </p>
    </form>
  );
}
