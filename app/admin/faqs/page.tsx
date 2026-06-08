import { FaqManager } from "@/components/admin/faq-manager";
import { adminListFaqs } from "@/lib/services/faqService";

export const metadata = { title: "FAQs" };

export default async function AdminFaqsPage() {
  const faqs = await adminListFaqs();
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">FAQs</h1>
        <p className="text-sm text-muted-foreground">Manage the questions shown on the landing page.</p>
      </div>
      <FaqManager faqs={faqs} />
    </div>
  );
}
