import Link from "next/link";
import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { AGENCY, POPULAR_AREAS, BRAND } from "@/lib/config";
import { whatsappLink } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            {BRAND} connects renters and property owners in Pokhara — safely, with no broker
            runaround. We mediate every introduction.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-primary">Browse homes</Link></li>
            <li><Link href="/search" className="hover:text-primary">All properties</Link></li>
            <li><Link href="/owner/listings/new" className="hover:text-primary">List your property</Link></li>
            <li><Link href="/about" className="hover:text-primary">About us</Link></li>
            <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
            <li><Link href="/policy" className="hover:text-primary">Terms &amp; Privacy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Popular areas</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {POPULAR_AREAS.map((area) => (
              <li key={area}>
                <Link href={`/search?area=${encodeURIComponent(area)}`} className="hover:text-primary">
                  {area}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact the agency</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {AGENCY.addressLine}</li>
            <li><a href={`tel:${AGENCY.phone}`} className="flex items-center gap-2 hover:text-primary"><Phone className="h-4 w-4" /> {AGENCY.phone}</a></li>
            <li><a href={whatsappLink(AGENCY.whatsapp)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary"><MessageCircle className="h-4 w-4" /> WhatsApp</a></li>
            <li><a href={`mailto:${AGENCY.email}`} className="flex items-center gap-2 hover:text-primary"><Mail className="h-4 w-4" /> {AGENCY.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-6">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>© {BRAND}, Pokhara — Nepal. Mediated rentals.</p>
          <p>No online payments · No listing fees · Free for everyone.</p>
        </div>
      </div>
    </footer>
  );
}
