import { AdManager } from "@/components/admin/ad-manager";
import { adminListAds } from "@/lib/services/advertisementService";

export const metadata = { title: "Advertisements" };

export default async function AdminAdsPage() {
  const ads = await adminListAds();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Advertisements</h1>
        <p className="text-sm text-muted-foreground">Manage banner placements. A future monetization hook.</p>
      </div>
      <AdManager ads={ads} />
    </div>
  );
}
