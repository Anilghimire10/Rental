import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResetForm } from "@/components/shared/reset-form";

export const metadata = { title: "Set a new password" };

export default function ResetPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Set a new password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetForm />
      </CardContent>
    </Card>
  );
}
