// ============================================================================
// Central app configuration. Single place to rebrand, change the agency contact,
// or add a city later (multi-city is architected for but disabled in v1).
// ============================================================================

/** Brand name. (Set to "RentEase Pokhara" if you prefer the spec's working title.) */
export const BRAND = "GharBhada";
export const BRAND_TAGLINE = "Rooms, flats & homes for rent in Pokhara — without the runaround.";

/**
 * Agency contact shown PUBLICLY on every listing (Call / WhatsApp / Email).
 * This is the platform's number, never the owner's. Read from env so it can be
 * changed without a deploy; falls back to placeholders for local dev.
 */
export const AGENCY = {
  phone: process.env.NEXT_PUBLIC_AGENCY_PHONE ?? "+9779800000000",
  // wa.me wants the number with no +, spaces or dashes.
  whatsapp: (process.env.NEXT_PUBLIC_AGENCY_WHATSAPP ?? "9779800000000").replace(/[^0-9]/g, ""),
  email: process.env.NEXT_PUBLIC_AGENCY_EMAIL ?? "hello@gharbhada.com",
  addressLine: "Lakeside, Pokhara, Nepal",
};

/** City config. v1 = Pokhara only; the shape supports adding more later. */
export const CITIES = [{ name: "Pokhara", code: "PKR", isDefault: true }] as const;
export const DEFAULT_CITY = CITIES[0];

/** Popular areas surfaced on the home page + as quick search filters. */
export const POPULAR_AREAS = [
  "Lakeside",
  "Mahendrapool",
  "New Road",
  "Prithvi Chowk",
  "Chipledhunga",
  "Bagar",
] as const;

/** Approximate map center for Pokhara (used by the map view default viewport). */
export const CITY_CENTER = { lat: 28.2096, lng: 83.9856, zoom: 12 };

/**
 * Default property categories. Also seeded into the `categories` table (which is
 * admin-manageable). This constant is the fallback / seed source of truth.
 */
export const DEFAULT_CATEGORIES = [
  "Room",
  "Single Room",
  "1 BK",
  "2 BK",
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "Apartment",
  "Flat",
  "House Rent",
  "Office Space",
  "Shutter / Shop",
  "Commercial Building",
  "Hostel Room",
  "PG / Paying Guest",
] as const;

/** Master amenity list (multi-select). Admin-extendable later via a table. */
export const AMENITIES = [
  "WiFi",
  "Bike Parking",
  "Car Parking",
  "Pet Allowed",
  "TV Cable",
  "Solar Water",
  "Attached Bathroom",
  "Water Supply",
  "Furnished",
  "Air Conditioner",
  "Balcony",
  "Garden",
  "CCTV",
  "Security Guard",
  "Lift/Elevator",
  "Generator Backup",
  "Laundry Area",
  "Washing Machine",
  "Refrigerator",
  "Study Table",
  "Gas Connection",
  "Separate Meter",
  "Internet Included",
  "Water Included",
  "Electricity Included",
] as const;

export type Amenity = (typeof AMENITIES)[number];
