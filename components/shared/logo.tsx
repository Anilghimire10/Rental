import Link from "next/link";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/config";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Home className="h-4 w-4" />
      </span>
      <span className="font-serif text-xl font-bold text-primary">{BRAND}</span>
    </Link>
  );
}
