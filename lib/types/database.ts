// ============================================================================
// Hand-maintained DB types matching supabase/schema.sql.
// Regenerate with: supabase gen types typescript --project-id <ref>
// ============================================================================

export type UserRole = "tenant" | "owner" | "admin";
export type UserPlan = "free" | "premium" | "featured";
export type ListingStatus = "pending" | "approved" | "rejected";
export type InquiryStatus = "new" | "contacted" | "resolved";
export type VisitStatus = "pending" | "confirmed" | "completed" | "cancelled";

// NOTE: these are `type` aliases (not interfaces) on purpose — object-literal
// type aliases get an implicit index signature, which Supabase's GenericSchema
// constraint (Record<string, unknown>) requires. Interfaces would make every
// insert/update collapse to `never`.
export type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  role: UserRole;
  plan: UserPlan;
  is_verified: boolean;
  is_banned: boolean;
  created_at: string;
}

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type ListingRow = {
  id: string;
  property_code: string;
  owner_id: string;
  title: string;
  category_id: string | null;
  description: string;
  monthly_rent: number;
  security_deposit: number;
  advance_required: boolean;
  is_negotiable: boolean;
  electricity_included: boolean;
  water_included: boolean;
  available_from: string | null;
  area: string;
  ward_number: number | null;
  city: string;
  nearby_landmark: string | null;
  latitude: number; // PRIVATE
  longitude: number; // PRIVATE
  owner_name: string | null; // PRIVATE
  owner_phone: string | null; // PRIVATE
  owner_whatsapp: string | null; // PRIVATE
  owner_email: string | null; // PRIVATE
  exact_address: string | null; // PRIVATE
  cover_image: string | null;
  gallery_images: string[];
  total_rooms: number;
  bedrooms: number;
  kitchens: number;
  bathrooms: number;
  floor_number: number | null;
  area_sqft: number | null;
  amenities: string[];
  status: ListingStatus;
  rejection_reason: string | null;
  is_featured: boolean;
  is_rented: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export type InquiryRow = {
  id: string;
  listing_id: string;
  tenant_id: string | null;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: InquiryStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export type VisitRequestRow = {
  id: string;
  listing_id: string;
  tenant_id: string | null;
  name: string;
  phone: string;
  preferred_date: string | null;
  preferred_time: string | null;
  notes: string;
  status: VisitStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export type FavoriteRow = {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export type AdvertisementRow = {
  id: string;
  title: string;
  image: string;
  link_url: string | null;
  position: string;
  is_active: boolean;
  created_at: string;
}

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type FeedbackRow = {
  id: string;
  name: string;
  email: string | null;
  rating: number | null;
  message: string;
  created_at: string;
}

// Each table must include `Relationships` (and the schema `CompositeTypes`) for
// @supabase/supabase-js v2 to recognize the type — otherwise insert/update args
// collapse to `never`.
type Rel = [];

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow> & { id: string; email: string }; Update: Partial<ProfileRow>; Relationships: Rel };
      categories: { Row: CategoryRow; Insert: Partial<CategoryRow> & { name: string; slug: string }; Update: Partial<CategoryRow>; Relationships: Rel };
      listings: {
        Row: ListingRow;
        Insert: Partial<ListingRow> & {
          owner_id: string; title: string; monthly_rent: number;
          area: string; latitude: number; longitude: number;
        };
        Update: Partial<ListingRow>;
        Relationships: Rel;
      };
      inquiries: { Row: InquiryRow; Insert: Partial<InquiryRow> & { listing_id: string; name: string; phone: string; email: string }; Update: Partial<InquiryRow>; Relationships: Rel };
      visit_requests: { Row: VisitRequestRow; Insert: Partial<VisitRequestRow> & { listing_id: string; name: string; phone: string }; Update: Partial<VisitRequestRow>; Relationships: Rel };
      favorites: { Row: FavoriteRow; Insert: { user_id: string; listing_id: string }; Update: Partial<FavoriteRow>; Relationships: Rel };
      advertisements: { Row: AdvertisementRow; Insert: Partial<AdvertisementRow> & { title: string; image: string }; Update: Partial<AdvertisementRow>; Relationships: Rel };
      faqs: { Row: FaqRow; Insert: Partial<FaqRow> & { question: string; answer: string }; Update: Partial<FaqRow>; Relationships: Rel };
      feedback: { Row: FeedbackRow; Insert: Partial<FeedbackRow> & { name: string; message: string }; Update: Partial<FeedbackRow>; Relationships: Rel };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_role: { Args: Record<string, never>; Returns: UserRole };
      is_not_banned: { Args: Record<string, never>; Returns: boolean };
      increment_listing_view: { Args: { p_id: string }; Returns: undefined };
    };
    Enums: {
      user_role: UserRole;
      user_plan: UserPlan;
      listing_status: ListingStatus;
      inquiry_status: InquiryStatus;
      visit_status: VisitStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
