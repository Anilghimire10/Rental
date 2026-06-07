import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignupForm } from "@/components/shared/signup-form";
import { GoogleButton } from "@/components/shared/google-button";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Free for renters and owners — no listing fees, ever.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense fallback={null}>
          <GoogleButton />
        </Suspense>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" /> or <Separator className="flex-1" />
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-accent hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
