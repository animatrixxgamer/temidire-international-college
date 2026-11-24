import type { Metadata } from "next";
import "./globals.css";
import RootClient from "@/components/RootClient";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://temidirecollege.ng").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Temidire International College — Ondo",
    template: "%s · Temidire International College",
  },
  description:
    "Temidire International College, Ondo Town: Creche, Nursery, Primary and Secondary education with small classes, committed teachers and results you can see each term.",
  keywords: ["Temidire", "school", "Ondo", "Nigeria", "college", "primary", "secondary"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Temidire International College — Ondo",
    description: "Where curiosity becomes character. Admissions open for the 2026/2027 session.",
    siteName: "Temidire International College",
    url: SITE_URL,
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/images/assembly.webp",
        width: 1200,
        height: 630,
        alt: "Morning assembly at Temidire International College",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Temidire International College — Ondo",
    description: "Where curiosity becomes character. Admissions open for the 2026/2027 session.",
    images: ["/images/assembly.webp"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-navy-950 font-sans text-ivory-100">
        <RootClient>{children}</RootClient>
      </body>
    </html>
  );
}
