import { Phone, MessageCircle, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InquiryDialog } from "@/components/shared/inquiry-dialog";
import { VisitDialog } from "@/components/shared/visit-dialog";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { AGENCY } from "@/lib/config";
import { whatsappLink, formatPrice } from "@/lib/utils";
import type { PublicListingDetail, SessionUser } from "@/lib/types";

/**
 * Contact panel shown on the property detail page. Displays the AGENCY's contact
 * details only — never the owner's. Inquiry + visit requests route to the admin.
 */
export function PropertyContact({
  listing,
  user,
  favorited,
}: {
  listing: PublicListingDetail;
  user: SessionUser | null;
  favorited: boolean;
}) {
  const waMessage = `Hi, I'm interested in ${listing.propertyCode} — ${listing.title} (${listing.area}, Pokhara).`;
  const defaults = user
    ? { name: user.name, email: user.email, phone: user.phone ?? undefined }
    : undefined;

  return (
    <Card className="sticky top-20">
      <CardContent className="space-y-4 p-6">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary">{formatPrice(listing.monthlyRent)}</span>
            <span className="text-sm text-muted-foreground">/ month</span>
          </div>
          {listing.securityDeposit > 0 && (
            <p className="text-sm text-muted-foreground">Deposit {formatPrice(listing.securityDeposit)}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InquiryDialog listingId={listing.id} propertyCode={listing.propertyCode} defaults={defaults} />
          <VisitDialog listingId={listing.id} propertyCode={listing.propertyCode} defaults={defaults} />
        </div>
        <FavoriteButton
          listingId={listing.id}
          initialFavorited={favorited}
          isAuthed={!!user}
          variant="full"
        />

        <Separator />

        <div>
          <p className="mb-2 text-sm font-semibold">Contact GharBhada</p>
          <div className="space-y-2">
            <a href={`tel:${AGENCY.phone}`} className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm transition hover:bg-secondary">
              <Phone className="h-4 w-4 text-primary" /> Call {AGENCY.phone}
            </a>
            <a href={whatsappLink(AGENCY.whatsapp, waMessage)} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm transition hover:bg-secondary">
              <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp us
            </a>
            <a href={`mailto:${AGENCY.email}?subject=${encodeURIComponent(listing.propertyCode)}`} className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm transition hover:bg-secondary">
              <Mail className="h-4 w-4 text-primary" /> {AGENCY.email}
            </a>
          </div>
        </div>

        <p className="flex items-start gap-2 rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          For your safety, we mediate every introduction. Owner details are never shared publicly.
        </p>
      </CardContent>
    </Card>
  );
}
