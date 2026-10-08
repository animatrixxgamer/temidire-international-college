import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";
import { createNewsPost, toggleNewsPost, deleteNewsPost } from "@/app/admin/actions";
import { EmptyBook } from "@/components/motion/EmptyStates";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  await requireStaff();
  const posts = await prisma.newsPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">News</h1>
        <p className="mt-1 text-ivory-100/60">Published posts appear on the website instantly.</p>
      </header>

      <form action={createNewsPost} className="space-y-3 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-6">
        <h2 className="font-serif text-xl">New post</h2>
        <input name="title" required placeholder="Post title" className="w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5" />
        <input name="excerpt" required placeholder="One-line excerpt" className="w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5" />
        <textarea name="body" required rows={5} placeholder="Full story…" className="w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5" />
        <button className="rounded-full bg-gold-500 px-6 py-2.5 font-semibold text-navy-950">Publish post</button>
      </form>

      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-4">
            <div className="min-w-0">
              <p className="font-semibold">{p.title}</p>
              <p className="text-xs text-ivory-100/50">/{p.slug} · {new Date(p.createdAt).toLocaleDateString("en-NG")} · {p.published ? "visible" : "hidden"}</p>
            </div>
            <div className="flex gap-2">
              <form action={toggleNewsPost}>
                <input type="hidden" name="id" value={p.id} />
                <button className="rounded-md border border-ivory-100/20 px-3 py-1.5 text-sm">{p.published ? "Hide" : "Show"}</button>
              </form>
              <form action={deleteNewsPost}>
                <input type="hidden" name="id" value={p.id} />
                <button className="rounded-md border border-ember-500/40 px-3 py-1.5 text-sm text-ember-500">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <EmptyBook
            tone="dark"
            className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 py-8"
            caption="No posts yet — publish the first one."
          />
        )}
      </div>
    </div>
  );
}
