import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { BRAND, BRAND_TAGLINE } from "@/lib/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND} — Rooms, Flats & Homes for Rent in Pokhara`,
    template: `%s · ${BRAND}`,
  },
  description: BRAND_TAGLINE,
  keywords: ["Pokhara rent", "room for rent Pokhara", "flat in Pokhara", "house rent Pokhara", "apartment Pokhara"],
  openGraph: {
    type: "website",
    siteName: BRAND,
    locale: "en_US",
    url: siteUrl,
    title: `${BRAND} — Rent in Pokhara`,
    description: BRAND_TAGLINE,
  },
  twitter: { card: "summary_large_image", title: BRAND, description: BRAND_TAGLINE },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
