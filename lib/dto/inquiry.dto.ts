import type { InquiryRow, ListingRow, VisitRequestRow } from "@/lib/types/database";
import type { AdminInquiry, AdminVisit, TenantInquiry, TenantVisit } from "@/lib/types";
import { listingSlug } from "@/lib/utils";

type ListingLite = Pick<
  ListingRow,
  "id" | "title" | "area" | "property_code" | "owner_name" | "owner_phone" | "owner_whatsapp" | "owner_email"
>;

// --- Tenant views (status tracking only) -----------------------------------

export function toTenantInquiry(row: InquiryRow, l: ListingLite): TenantInquiry {
  return {
    id: row.id,
    listingId: row.listing_id,
    propertyCode: l.property_code,
    slug: listingSlug({ propertyCode: l.property_code, title: l.title, area: l.area }),
    listingTitle: l.title,
    listingArea: l.area,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function toTenantVisit(row: VisitRequestRow, l: ListingLite): TenantVisit {
  return {
    id: row.id,
    listingId: row.listing_id,
    propertyCode: l.property_code,
    slug: listingSlug({ propertyCode: l.property_code, title: l.title, area: l.area }),
    listingTitle: l.title,
    listingArea: l.area,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
  };
}

// --- Admin (mediator) views: tenant contact + matched owner contact --------

export function toAdminInquiry(row: InquiryRow, l: ListingLite): AdminInquiry {
  return {
    id: row.id,
    status: row.status,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    listingId: row.listing_id,
    propertyCode: l.property_code,
    listingTitle: l.title,
    ownerName: l.owner_name,
    ownerPhone: l.owner_phone,
    ownerWhatsapp: l.owner_whatsapp,
    ownerEmail: l.owner_email,
  };
}

export function toAdminVisit(row: VisitRequestRow, l: ListingLite): AdminVisit {
  return {
    id: row.id,
    status: row.status,
    name: row.name,
    phone: row.phone,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    notes: row.notes,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    listingId: row.listing_id,
    propertyCode: l.property_code,
    listingTitle: l.title,
    ownerName: l.owner_name,
    ownerPhone: l.owner_phone,
    ownerWhatsapp: l.owner_whatsapp,
    ownerEmail: l.owner_email,
  };
}
