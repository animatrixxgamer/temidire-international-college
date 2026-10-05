import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import RootClient from "@/components/RootClient";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Temidire International College — Ondo",
    template: "%s · Temidire International College",
  },
  description:
    "Temidire International College, Ondo Town: Creche, Nursery, Primary and Secondary education with small classes, committed teachers and results you can see each term.",
  keywords: ["Temidire", "school", "Ondo", "Nigeria", "college", "primary", "secondary"],
  openGraph: {
    title: "Temidire International College — Ondo",
    description: "Where curiosity becomes character. Admissions open for the 2026/2027 session.",
    locale: "en_NG",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="bg-navy-950 font-sans text-ivory-100">
        <RootClient>{children}</RootClient>
      </body>
    </html>
  );
}
