import { ContentPage } from "@/components/shared/content-page";
import { getSiteContent } from "@/lib/services/contentService";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const content = await getSiteContent("privacy");
  return (
    <ContentPage
      title={content?.title ?? "Privacy Policy"}
      body={content?.body ?? ""}
      updatedAt={content?.updated_at}
    />
  );
}
