import type { AdvertisementRow, CategoryRow, ProfileRow } from "@/lib/types/database";
import type { AdminUser, Advertisement, Category } from "@/lib/types";

/** Admin user-management view. Never expose to non-admins. */
export function toAdminUser(row: ProfileRow): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    role: row.role,
    plan: row.plan,
    isVerified: row.is_verified,
    isBanned: row.is_banned,
    createdAt: row.created_at,
  };
}

export function toCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, slug: row.slug };
}

export function toAdvertisement(row: AdvertisementRow): Advertisement {
  return {
    id: row.id,
    title: row.title,
    image: row.image,
    linkUrl: row.link_url,
    position: row.position,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}
