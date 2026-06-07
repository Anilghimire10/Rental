"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordSchema } from "@/lib/validation/auth.schema";

/**
 * Sets a new password. The reset link puts a recovery session in place
 * (handled by Supabase via the URL hash), so updateUser works here.
 */
export function ResetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") || "");
    const parsed = updatePasswordSchema.safeParse({ password });
    if (!parsed.success) {
      toast({ variant: "destructive", title: "Weak password", description: parsed.error.issues[0]?.message });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Could not reset", description: error.message });
      return;
    }
    toast({ title: "Password updated", description: "You can now sign in." });
    router.push("/auth/login");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        <p className="text-xs text-muted-foreground">8+ chars with upper, lower and a number.</p>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Updating…" : "Update password"}</Button>
    </form>
  );
}
