import { redirect } from "next/navigation";
import { BadgeCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/shared/profile-form";
import { getCurrentUser } from "@/lib/auth/session";
import { titleCase } from "@/lib/utils";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/account");

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-serif text-3xl font-bold text-primary">Account</h1>
      <p className="mt-1 text-muted-foreground">Manage your profile and contact details.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{titleCase(user.role)}</Badge>
        <Badge variant="outline">Plan: {titleCase(user.plan)}</Badge>
        {user.isVerified ? (
          <Badge variant="success"><BadgeCheck className="mr-1 h-3 w-3" /> Verified</Badge>
        ) : (
          <Badge variant="warning"><AlertCircle className="mr-1 h-3 w-3" /> Email not verified</Badge>
        )}
      </div>

      {!user.isVerified && (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Please verify your email (check your inbox). Verification is required before posting properties.
        </p>
      )}

      <Card className="mt-8">
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
