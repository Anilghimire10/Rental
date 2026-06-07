import { SearchX } from "lucide-react";

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon,
  children,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="mb-3 text-muted-foreground">{icon ?? <SearchX className="h-10 w-10" />}</div>
      <h3 className="font-serif text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
