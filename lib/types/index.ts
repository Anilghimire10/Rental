// Domain-facing DTO types returned to the UI. Public-facing types intentionally
// OMIT private fields (owner contact, exact lat/lng, exact address).
import type {
  InquiryStatus,
  ListingStatus,
  UserPlan,
  UserRole,
  VisitStatus,
} from "./database";

export type {
  InquiryStatus,
  ListingStatus,
  UserPlan,
  UserRole,
  VisitStatus,
} from "./database";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  avatarUrl: string | null; // from Google OAuth, if available
  role: UserRole;
  plan: UserPlan;
  isVerified: boolean;
  isBanned: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

/** Card shown to tenants in lists/grids. NO private fields. */
export interface PublicListingCard {
  id: string;
  propertyCode: string;
  slug: string;
  title: string;
  categoryName: string | null;
  monthlyRent: number;
  area: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number | null;
  coverImage: string | null;
  images: string[]; // cover + gallery, for the card carousel
  amenities: string[];
  isFeatured: boolean;
  isRented: boolean;
  isNegotiable: boolean;
  availableFrom: string | null;
  createdAt: string;
}

/**
 * Full public detail. Adds gallery/description/details + APPROXIMATE coordinates
 * only (jittered server-side). NEVER includes owner contact or exact lat/lng.
 */
export interface PublicListingDetail extends PublicListingCard {
  description: string;
  securityDeposit: number;
  advanceRequired: boolean;
  electricityIncluded: boolean;
  waterIncluded: boolean;
  wardNumber: number | null;
  nearbyLandmark: string | null;
  approxLat: number; // jittered — approximate circle center, not the exact pin
  approxLng: number;
  gallery: string[];
  totalRooms: number;
  kitchens: number;
  floorNumber: number | null;
  isRented: boolean;
  viewCount: number;
}

/** Owner's own listing — adds management + their own private fields + count. */
export interface OwnerListing extends PublicListingDetail {
  status: ListingStatus;
  rejectionReason: string | null;
  exactAddress: string | null; // owner can see their own
  exactLat: number;
  exactLng: number;
  // The owner's OWN contact (so the edit form can prefill). Still never exposed
  // to other users — only the owner of this row and admins receive it.
  ownerName: string | null;
  ownerPhone: string | null;
  ownerWhatsapp: string | null;
  ownerEmail: string | null;
  inquiryCount: number; // COUNT only — never tenant details
  visitCount: number;
  updatedAt: string;
}

/** Admin view — everything, including owner contact. Service-role only. */
export interface AdminListing extends OwnerListing {
  ownerId: string;
  ownerName: string | null;
  ownerPhone: string | null;
  ownerWhatsapp: string | null;
  ownerEmail: string | null;
  accountOwnerName: string; // the profile's name (account holder)
  accountOwnerEmail: string;
}

/** Tenant's view of their own inquiry. */
export interface TenantInquiry {
  id: string;
  listingId: string;
  propertyCode: string;
  slug: string;
  listingTitle: string;
  listingArea: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

/** Tenant's view of their own visit request. */
export interface TenantVisit {
  id: string;
  listingId: string;
  propertyCode: string;
  slug: string;
  listingTitle: string;
  listingArea: string;
  preferredDate: string | null;
  preferredTime: string | null;
  notes: string;
  status: VisitStatus;
  createdAt: string;
}

/** Admin (mediator) inquiry view: tenant contact + matched owner contact. */
export interface AdminInquiry {
  id: string;
  status: InquiryStatus;
  name: string;
  phone: string;
  email: string;
  message: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  listingId: string;
  propertyCode: string;
  listingTitle: string;
  ownerName: string | null;
  ownerPhone: string | null;
  ownerWhatsapp: string | null;
  ownerEmail: string | null;
}

export interface AdminVisit {
  id: string;
  status: VisitStatus;
  name: string;
  phone: string;
  preferredDate: string | null;
  preferredTime: string | null;
  notes: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  listingId: string;
  propertyCode: string;
  listingTitle: string;
  ownerName: string | null;
  ownerPhone: string | null;
  ownerWhatsapp: string | null;
  ownerEmail: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  role: UserRole;
  plan: UserPlan;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface Advertisement {
  id: string;
  title: string;
  image: string;
  linkUrl: string | null;
  position: string;
  isActive: boolean;
  createdAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface AdminFeedback {
  id: string;
  name: string;
  email: string | null;
  rating: number | null;
  message: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProperties: number;
  activeProperties: number; // approved + not rented
  pendingApprovals: number;
  totalUsers: number;
  totalInquiries: number;
  newInquiries: number;
  totalVisits: number;
  pendingVisits: number;
  mostViewed: { id: string; propertyCode: string; title: string; viewCount: number } | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListingSearchParams {
  q?: string;
  area?: string;
  categorySlug?: string;
  minRent?: number;
  maxRent?: number;
  furnished?: boolean;
  parking?: boolean;
  petFriendly?: boolean;
  attachedBathroom?: boolean;
  availableNow?: boolean;
  sort?: "newest" | "rent_asc" | "rent_desc" | "popular";
  page?: number;
  pageSize?: number;
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
