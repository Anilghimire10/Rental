import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { adminListFeedback } from "@/lib/services/feedbackService";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Feedback" };

export default async function AdminFeedbackPage() {
  const items = await adminListFeedback();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Feedback</h1>
        <p className="text-sm text-muted-foreground">What visitors have shared from the landing page.</p>
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((f) => (
            <Card key={f.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{f.name}</p>
                    {f.email && <p className="text-xs text-muted-foreground">{f.email}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {f.rating ? (
                      <span className="flex items-center gap-0.5 text-accent">
                        {Array.from({ length: f.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                      </span>
                    ) : null}
                    <span className="text-xs text-muted-foreground">{formatDate(f.createdAt)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-foreground/90">{f.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No feedback yet" description="Submissions from the landing page will show here." />
      )}
    </div>
  );
}
