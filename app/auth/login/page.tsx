import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/components/shared/login-form";
import { GoogleButton } from "@/components/shared/google-button";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to manage inquiries, favorites and listings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense fallback={null}>
          <GoogleButton />
        </Suspense>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" /> or <Separator className="flex-1" />
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/auth/signup" className="font-medium text-accent hover:underline">Create an account</Link>
        </p>
      </CardContent>
    </Card>
  );
}
