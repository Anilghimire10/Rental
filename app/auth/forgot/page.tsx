import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ForgotForm } from "@/components/shared/forgot-form";

export const metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Forgot your password?</CardTitle>
        <CardDescription>Enter your email and we'll send a reset link.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ForgotForm />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="font-medium text-accent hover:underline">Back to sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
