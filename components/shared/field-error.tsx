/** Renders the first server-side validation error for a field, if any. */
export function FieldError({
  errors,
  name,
}: {
  errors?: Record<string, string[]>;
  name: string;
}) {
  const msg = errors?.[name]?.[0];
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive">{msg}</p>;
}
