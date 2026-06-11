import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/types";

/** Native <details> accordion — no client JS needed. Grouped by category. */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  // Group while preserving the incoming order (service sorts by category, then sort_order).
  const groups: { title: string; items: Faq[] }[] = [];
  for (const f of faqs) {
    const last = groups[groups.length - 1];
    if (last && last.title === f.category) last.items.push(f);
    else groups.push({ title: f.category, items: [f] });
  }

  // A single "General" group reads as ungrouped — skip the redundant heading.
  const showHeadings = groups.length > 1 || groups[0]?.title !== "General";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {groups.map((group) => (
        <section key={group.title} className="space-y-3">
          {showHeadings && (
            <h3 className="font-serif text-lg font-semibold text-foreground">{group.title}</h3>
          )}
          {group.items.map((f) => (
            <details key={f.id} className="group rounded-lg border border-border bg-card px-5 py-4 shadow-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                {f.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
            </details>
          ))}
        </section>
      ))}
    </div>
  );
}
