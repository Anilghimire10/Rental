import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Verify your email" };

export default function VerifyPage() {
  return (
    <Card>
      <CardContent className="space-y-4 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-primary">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-primary">Check your inbox</h1>
        <p className="text-sm text-muted-foreground">
          We sent you a verification link. Click it to activate your account. Verification is
          required before you can post a property.
        </p>
        <Button asChild className="w-full"><Link href="/auth/login">Back to sign in</Link></Button>
      </CardContent>
    </Card>
  );
}
