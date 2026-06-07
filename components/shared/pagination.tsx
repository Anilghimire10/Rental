import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Builds a querystring preserving existing params but overriding `page`. */
function pageHref(base: Record<string, string | undefined>, page: number) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) if (v) sp.set(k, v);
  sp.set("page", String(page));
  return `?${sp.toString()}`;
}

export function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={pageHref(params, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn("flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm", page === 1 && "pointer-events-none opacity-50")}
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </Link>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center">
            {gap && <span className="px-1 text-muted-foreground">…</span>}
            <Link
              href={pageHref(params, p)}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm",
                p === page ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary",
              )}
            >
              {p}
            </Link>
          </span>
        );
      })}

      <Link
        href={pageHref(params, Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn("flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm", page === totalPages && "pointer-events-none opacity-50")}
      >
        Next <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
