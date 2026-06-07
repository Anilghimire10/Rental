"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { signUpAction } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/types";

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? "Creating account…" : "Create account"}</Button>;
}

export function SignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<"tenant" | "owner">("tenant");
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
      {/* Role chooser */}
      <input type="hidden" name="role" value={role} />
      <div className="grid grid-cols-2 gap-2">
        {(["tenant", "owner"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "rounded-md border p-3 text-sm font-medium transition",
              role === r ? "border-accent bg-accent/10 text-primary" : "border-border text-muted-foreground hover:border-accent",
            )}
          >
            {r === "tenant" ? "I'm looking to rent" : "I'm a property owner"}
          </button>
        ))}
      </div>

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

      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <Submit />
    </form>
  );
}
