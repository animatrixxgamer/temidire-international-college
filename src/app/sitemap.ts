import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { news as fallbackNews } from "@/content/siteContent";

export const dynamic = "force-dynamic";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://temidirecollege.ng").replace(/\/$/, "");

const PAGES: Array<[string, number]> = [
  ["", 1],
  ["/schools", 0.9],
  ["/admissions", 0.9],
  ["/admissions/apply", 0.8],
  ["/academics", 0.8],
  ["/news", 0.8],
  ["/gallery", 0.7],
  ["/about", 0.7],
  ["/about/leadership", 0.6],
  ["/student-life", 0.6],
  ["/transport", 0.6],
  ["/alumni", 0.5],
  ["/contact", 0.7],
];

/** Public pages plus every published news story, so search engines see new posts. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    posts = await prisma.newsPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    posts = fallbackNews.map((p) => ({ slug: p.slug, updatedAt: new Date(p.date) }));
  }

  return [
    ...PAGES.map(([path, priority]) => ({
      url: `${BASE}${path}`,
      lastModified: new Date(),
      changeFrequency: (path === "" || path === "/news" ? "weekly" : "monthly") as
        | "weekly"
        | "monthly",
      priority,
    })),
    ...posts.map((p) => ({
      url: `${BASE}/news/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
