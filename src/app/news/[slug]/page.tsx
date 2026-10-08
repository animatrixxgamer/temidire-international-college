import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/primitives";
import { TransitionLink } from "@/components/motion/PageTransition";
import { prisma } from "@/lib/db";
import { news as fallbackNews } from "@/content/siteContent";

export const dynamic = "force-dynamic";

const fmt = (d: Date) => d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

async function getPost(slug: string) {
  try {
    const post = await prisma.newsPost.findUnique({ where: { slug } });
    if (post) return post;
  } catch {
    /* fall through to the static fallback */
  }
  // DB empty or unreachable: serve the static post so the link never 404s.
  const fallback = fallbackNews.find((p) => p.slug === slug);
  if (!fallback) return null;
  return {
    title: fallback.title,
    body: fallback.body,
    createdAt: new Date(fallback.date),
    published: true,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post?.title ?? "News" };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-28">
      <TransitionLink href="/news" className="text-sm text-gold-500 hover:text-gold-300">
        ← All news
      </TransitionLink>
      <Reveal>
        <p className="mt-8 text-sm text-gold-500">{fmt(new Date(post.createdAt))}</p>
        <h1 className="mt-2 font-serif text-3xl md:text-5xl">{post.title}</h1>
        <div className="mt-8 space-y-4 text-lg leading-relaxed text-ivory-100/85">
          {post.body.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Reveal>
    </main>
  );
}
