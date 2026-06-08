import { FaqAccordion } from "@/components/shared/faq-accordion";
import { FeedbackForm } from "@/components/shared/feedback-form";
import { getActiveFaqs } from "@/lib/services/faqService";
import { BRAND } from "@/lib/config";

export const metadata = {
  title: "FAQ & Feedback",
  description: `Frequently asked questions about ${BRAND} and how to share feedback.`,
};

export default async function FaqPage() {
  const faqs = await getActiveFaqs();

  return (
    <div className="container max-w-3xl py-12">
      <h1 className="font-serif text-3xl font-bold text-primary">Frequently asked questions</h1>
      <p className="mt-2 text-muted-foreground">Everything you need to know about renting and listing on {BRAND}.</p>

      <div className="mt-8">
        {faqs.length ? (
          <FaqAccordion faqs={faqs} />
        ) : (
          <p className="text-sm text-muted-foreground">FAQs will appear here soon.</p>
        )}
      </div>

      <div id="feedback" className="mt-16">
        <h2 className="mb-2 font-serif text-2xl font-bold text-primary">Share your feedback</h2>
        <p className="mb-6 text-muted-foreground">We'd love to hear how we can make {BRAND} better.</p>
        <FeedbackForm />
      </div>
    </div>
  );
}
