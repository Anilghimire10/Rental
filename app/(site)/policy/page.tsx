import { BRAND } from "@/lib/config";

export const metadata = {
  title: "Terms & Privacy Policy",
  description: `Terms of use and privacy policy for ${BRAND}.`,
};

export default function PolicyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="font-serif text-3xl font-bold text-primary">Terms &amp; Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <Section title="1. Who we are">
          {BRAND} is a property-rental marketplace and mediator operating in Pokhara, Nepal. We connect
          renters and property owners. We are not a party to any rental agreement between them.
        </Section>

        <Section title="2. How mediation works">
          Renters never see an owner's name, phone, WhatsApp, email or a property's exact coordinates.
          Inquiries and visit requests are sent to our team, who arrange introductions. The contact shown
          publicly on listings is the agency's, not the owner's.
        </Section>

        <Section title="3. Accounts">
          You may create one free account to browse homes and to list your own property. You are responsible
          for the accuracy of the information you provide and for keeping your login secure. You must verify
          your email before posting a property.
        </Section>

        <Section title="4. Listings & approval">
          Every listing is reviewed by an administrator before it appears publicly. We may reject or remove
          listings that are inaccurate, misleading, duplicated, or violate these terms. Owners are responsible
          for the legality and accuracy of their listings.
        </Section>

        <Section title="5. Fees & payments">
          This version of {BRAND} is free for everyone. There are no listing fees, subscription fees, or online
          payments. We may introduce optional paid features in the future, with notice.
        </Section>

        <Section title="6. Privacy">
          We collect only the information needed to operate the service: your name, email, phone and the
          details you submit. Owner contact details and exact addresses are stored privately and shown only to
          our administrators for the purpose of mediation. We do not sell your personal data. Inquiry and
          feedback submissions are stored so we can respond and improve the service.
        </Section>

        <Section title="7. Acceptable use">
          Do not post false, unlawful, or harmful content, attempt to access data you are not authorized to
          see, or use the service to spam or harass others. We may suspend accounts that abuse the platform.
        </Section>

        <Section title="8. Disclaimer">
          {BRAND} provides the platform “as is”. We are not responsible for the conduct of any renter or owner,
          the condition of any property, or the outcome of any rental arrangement.
        </Section>

        <Section title="9. Contact">
          Questions about these terms? Reach us via the contact details in the site footer.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-lg font-semibold text-primary">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
