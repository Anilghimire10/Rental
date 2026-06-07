import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-secondary/40 px-4 text-center">
      <Logo />
      <h1 className="font-serif text-5xl font-bold text-primary">404</h1>
      <p className="max-w-sm text-muted-foreground">
        We couldn't find that page. The property may have been rented or removed.
      </p>
      <div className="flex gap-3">
        <Button asChild><Link href="/">Go home</Link></Button>
        <Button asChild variant="outline"><Link href="/search">Browse properties</Link></Button>
      </div>
    </div>
  );
}
