/* eslint-disable no-console */
/**
 * Seed script — creates the first admin, sample owners, categories, approved
 * Pokhara listings (placeholder images), and a couple of ads.
 *
 * Usage:
 *   1. Run schema.sql, rls.sql, storage.sql in Supabase first.
 *   2. Fill .env.local (needs SUPABASE_SERVICE_ROLE_KEY + SEED_ADMIN_*).
 *   3. npm run seed
 *
 * Idempotent-ish: re-running upserts categories and skips users that already
 * exist. Listings are inserted fresh each run (delete them first if needed).
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_CATEGORIES, POPULAR_AREAS, CITY_CENTER } from "../lib/config";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

const IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
  "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1200&q=80",
];

async function ensureUser(opts: {
  email: string;
  password: string;
  name: string;
  role: "tenant" | "owner" | "admin";
  phone?: string;
  whatsapp?: string;
}) {
  // Look for an existing auth user with this email.
  const { data: list } = await db.auth.admin.listUsers();
  let user = list?.users.find((u) => u.email?.toLowerCase() === opts.email.toLowerCase());

  if (!user) {
    const { data, error } = await db.auth.admin.createUser({
      email: opts.email,
      password: opts.password,
      email_confirm: true,
      user_metadata: { name: opts.name, role: opts.role === "admin" ? "tenant" : opts.role },
    });
    if (error) throw error;
    user = data.user;
    console.log(`  created user ${opts.email}`);
  } else {
    console.log(`  user exists ${opts.email}`);
  }

  // Force role/profile fields (trigger created the row; we promote here).
  await db.from("profiles").update({
    name: opts.name,
    role: opts.role,
    phone: opts.phone ?? null,
    whatsapp: opts.whatsapp ?? null,
    is_verified: true,
  }).eq("id", user!.id);

  return user!.id;
}

async function main() {
  console.log("Seeding categories...");
  const categoryRows = DEFAULT_CATEGORIES.map((name, i) => ({
    name,
    slug: slugify(name),
    is_active: true,
    sort_order: i,
  }));
  const { error: catErr } = await db.from("categories").upsert(categoryRows, { onConflict: "slug" });
  if (catErr) throw catErr;
  const { data: categories } = await db.from("categories").select("id, name, slug");
  const catBySlug = new Map((categories ?? []).map((c) => [c.slug, c.id as string]));

  console.log("Seeding users...");
  const adminId = await ensureUser({
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@gharbhada.test",
    password: process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!Admin123",
    name: "GharBhada Admin",
    role: "admin",
    phone: "+9779800000000",
    whatsapp: "9779800000000",
  });
  console.log(`  admin id: ${adminId}`);

  const owner1 = await ensureUser({
    email: "owner1@gharbhada.test", password: "Owner!Pass123", name: "Sita Gurung",
    role: "owner", phone: "+9779812345671", whatsapp: "9779812345671",
  });
  const owner2 = await ensureUser({
    email: "owner2@gharbhada.test", password: "Owner!Pass123", name: "Ramesh Thapa",
    role: "owner", phone: "+9779812345672", whatsapp: "9779812345672",
  });
  await ensureUser({
    email: "tenant@gharbhada.test", password: "Tenant!Pass123", name: "Bina Sharma",
    role: "tenant", phone: "+9779812345673",
  });

  console.log("Seeding listings...");
  const owners = [
    { id: owner1, name: "Sita Gurung", phone: "+9779812345671", whatsapp: "9779812345671", email: "owner1@gharbhada.test" },
    { id: owner2, name: "Ramesh Thapa", phone: "+9779812345672", whatsapp: "9779812345672", email: "owner2@gharbhada.test" },
  ];

  const samples = [
    { title: "Sunny 2 BHK near Lakeside", cat: "2-bhk", area: "Lakeside", rent: 28000, beds: 2, baths: 2, sqft: 850 },
    { title: "Cozy Single Room for Students", cat: "single-room", area: "Bagar", rent: 7000, beds: 1, baths: 1, sqft: 180 },
    { title: "Modern Apartment with Lake View", cat: "apartment", area: "Lakeside", rent: 45000, beds: 3, baths: 2, sqft: 1200 },
    { title: "1 BHK Flat in Mahendrapool", cat: "1-bhk", area: "Mahendrapool", rent: 15000, beds: 1, baths: 1, sqft: 520 },
    { title: "Office Space at Prithvi Chowk", cat: "office-space", area: "Prithvi Chowk", rent: 35000, beds: 0, baths: 2, sqft: 900 },
    { title: "Family House for Rent, New Road", cat: "house-rent", area: "New Road", rent: 55000, beds: 4, baths: 3, sqft: 1800 },
    { title: "Shutter / Shop on Main Street", cat: "shutter-shop", area: "Chipledhunga", rent: 22000, beds: 0, baths: 1, sqft: 300 },
    { title: "PG Room with Meals Included", cat: "pg-paying-guest", area: "Bagar", rent: 12000, beds: 1, baths: 1, sqft: 200 },
    { title: "Furnished Studio near Lakeside", cat: "room", area: "Lakeside", rent: 18000, beds: 1, baths: 1, sqft: 350 },
    { title: "Spacious 3 BHK in Mahendrapool", cat: "3-bhk", area: "Mahendrapool", rent: 40000, beds: 3, baths: 3, sqft: 1400 },
  ];

  const amenitiesPool = ["WiFi", "Bike Parking", "Water Supply", "Furnished", "CCTV", "Solar Water", "Attached Bathroom"];

  const rows = samples.map((s, i) => {
    const owner = owners[i % owners.length];
    const area = POPULAR_AREAS.includes(s.area as never) ? s.area : "Lakeside";
    // jitter coordinates around the city center per listing
    const lat = CITY_CENTER.lat + (Math.sin(i) * 0.012);
    const lng = CITY_CENTER.lng + (Math.cos(i) * 0.012);
    return {
      owner_id: owner.id,
      title: s.title,
      category_id: catBySlug.get(s.cat) ?? null,
      description:
        `${s.title}. Well-maintained property in ${area}, Pokhara. Close to shops, ` +
        `transport and schools. Contact the GharBhada team to arrange a visit. ` +
        `(This is seeded sample data.)`,
      monthly_rent: s.rent,
      security_deposit: s.rent * 2,
      advance_required: i % 3 === 0,
      available_from: "2026-07-01",
      area,
      ward_number: (i % 30) + 1,
      city: "Pokhara",
      nearby_landmark: `${area} chowk`,
      latitude: lat,
      longitude: lng,
      owner_name: owner.name,
      owner_phone: owner.phone,
      owner_whatsapp: owner.whatsapp,
      owner_email: owner.email,
      exact_address: `${area}, Ward ${(i % 30) + 1}, Pokhara`,
      cover_image: IMAGES[i % IMAGES.length],
      gallery_images: [IMAGES[i % IMAGES.length], IMAGES[(i + 1) % IMAGES.length], IMAGES[(i + 2) % IMAGES.length]],
      total_rooms: s.beds + 2,
      bedrooms: s.beds,
      kitchens: s.beds > 0 ? 1 : 0,
      bathrooms: s.baths,
      floor_number: (i % 4) + 1,
      area_sqft: s.sqft,
      amenities: amenitiesPool.slice(0, (i % amenitiesPool.length) + 2),
      status: "approved" as const,
      is_featured: i < 3,
      is_rented: false,
      view_count: Math.floor((Math.sin(i) + 1) * 120),
    };
  });

  const { error: listErr } = await db.from("listings").insert(rows);
  if (listErr) throw listErr;
  console.log(`  inserted ${rows.length} approved listings`);

  console.log("Seeding advertisements...");
  await db.from("advertisements").upsert(
    [
      {
        title: "List your property free on GharBhada",
        image: IMAGES[0],
        link_url: "/owner/listings/new",
        position: "home_hero",
        is_active: true,
      },
    ],
    { onConflict: "title" },
  );

  console.log("\n✅ Seed complete.");
  console.log("   Admin login:", process.env.SEED_ADMIN_EMAIL ?? "admin@gharbhada.test");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
