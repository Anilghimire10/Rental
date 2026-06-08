import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/types";

/** Native <details> accordion — no client JS needed. */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {faqs.map((f) => (
        <details key={f.id} className="group rounded-lg border border-border bg-card px-5 py-4 shadow-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
            {f.question}
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
