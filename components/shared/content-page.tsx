import { formatDate } from "@/lib/utils";

/** Renders an admin-edited content page (plain text, blank-line paragraphs). */
export function ContentPage({
  title,
  body,
  updatedAt,
}: {
  title: string;
  body: string;
  updatedAt?: string | null;
}) {
  const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="font-serif text-3xl font-bold text-primary">{title}</h1>
      {updatedAt && <p className="mt-2 text-sm text-muted-foreground">Last updated: {formatDate(updatedAt)}</p>}
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/90">
        {paragraphs.length ? (
          paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))
        ) : (
          <p className="text-muted-foreground">This content hasn't been added yet.</p>
        )}
      </div>
    </div>
  );
}
