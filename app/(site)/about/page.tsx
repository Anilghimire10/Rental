import Link from "next/link";
import { ShieldCheck, MessageCircle, KeyRound, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND, AGENCY } from "@/lib/config";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "About us",
  description: `About ${BRAND} — a mediated property rental marketplace for Pokhara.`,
};

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="font-serif text-3xl font-bold text-primary">About {BRAND}</h1>
      <p className="mt-4 text-muted-foreground">
        {BRAND} is a complete rental solution for Pokhara. We connect renters and property owners as a
        trusted mediator — so renters never have to chase brokers, and owners never have to share their
        personal contact details publicly. Browsing and listing are completely free.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <Step icon={<Search className="h-6 w-6" />} title="Browse" text="Search rooms, flats, houses, office spaces and more across Pokhara." />
        <Step icon={<MessageCircle className="h-6 w-6" />} title="Inquire" text="Send an inquiry or request a visit — it goes to our team, not the owner." />
        <Step icon={<KeyRound className="h-6 w-6" />} title="Move in" text="We mediate the introduction and help you get the keys." />
      </div>

      <div className="mt-10 rounded-lg border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
          <ShieldCheck className="h-5 w-5 text-accent" /> Your privacy comes first
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Owner contact details and exact addresses are never shown publicly. The contact shown on every
          listing is ours — we handle the introductions.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild><Link href="/">Browse homes</Link></Button>
        <Button asChild variant="outline">
          <a href={whatsappLink(AGENCY.whatsapp)} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </Button>
      </div>

      <div className="mt-10 text-sm text-muted-foreground">
        <p>Email: <a href={`mailto:${AGENCY.email}`} className="text-accent hover:underline">{AGENCY.email}</a></p>
        <p>Phone: <a href={`tel:${AGENCY.phone}`} className="text-accent hover:underline">{AGENCY.phone}</a></p>
        <p className="mt-2">
          See our <Link href="/policy" className="text-accent hover:underline">Terms &amp; Privacy Policy</Link> and{" "}
          <Link href="/faq" className="text-accent hover:underline">FAQ</Link>.
        </p>
      </div>
    </div>
  );
}

function Step({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-primary">{icon}</div>
      <h3 className="font-serif font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
