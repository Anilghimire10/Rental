"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { signInAction } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/types";

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [state, action] = useFormState<ActionResult | null, FormData>(signInAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      router.push(next);
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Sign in failed", description: state.error });
    }
  }, [state, next, router]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@email.com" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/auth/forgot" className="text-xs text-accent hover:underline">Forgot?</Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Submit />
    </form>
  );
}
