import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-lg", accent ? "bg-accent/15 text-accent-foreground" : "bg-secondary text-primary")}>
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}
