import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { VisitStatusBadge } from "@/components/shared/status-badge";
import { getMyVisits } from "@/lib/services/visitService";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My visits" };

export default async function MyVisitsPage() {
  const visits = await getMyVisits();

  return (
    <div className="container py-10">
      <h1 className="font-serif text-3xl font-bold text-primary">My visit requests</h1>
      <p className="mt-1 text-muted-foreground">Track the viewings you've requested.</p>

      <div className="mt-8 space-y-4">
        {visits.length ? (
          visits.map((v) => (
            <Card key={v.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{v.propertyCode}</span>
                    <VisitStatusBadge status={v.status} />
                  </div>
                  <Link href={`/property/${v.slug}`} className="mt-1 block font-serif text-lg font-semibold hover:text-primary">
                    {v.listingTitle}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {v.listingArea} · preferred {formatDate(v.preferredDate)} {v.preferredTime ?? ""}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm"><Link href={`/property/${v.slug}`}>View property</Link></Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={<CalendarCheck className="h-10 w-10" />}
            title="No visit requests yet"
            description="Request a visit on any property and we'll confirm a time."
          >
            <Button asChild><Link href="/search">Browse properties</Link></Button>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
