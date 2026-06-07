import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <header className="container flex h-16 items-center">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="container py-6 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">← Back to GharBhada</Link>
      </footer>
    </div>
  );
}
