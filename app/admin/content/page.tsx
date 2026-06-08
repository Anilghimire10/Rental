import { ContentManager } from "@/components/admin/content-manager";
import { adminListContent } from "@/lib/services/contentService";

export const metadata = { title: "Site content" };

export default async function AdminContentPage() {
  const rows = await adminListContent();
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Terms &amp; Privacy</h1>
        <p className="text-sm text-muted-foreground">
          Edit the Terms &amp; Conditions and Privacy Policy shown in the About Us menu and footer.
        </p>
      </div>
      <ContentManager rows={rows} />
    </div>
  );
}
