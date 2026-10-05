import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";
import { createAlbum, addPhoto, deletePhoto } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requireStaff();
  const albums = await prisma.galleryAlbum.findMany({ include: { photos: true }, orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Gallery</h1>
        <p className="mt-1 text-ivory-100/60">
          Add photos by URL — upload files to the <code className="text-gold-500">public/images</code> folder (or any image host) and paste the path.
        </p>
      </header>

      <form action={createAlbum} className="flex flex-wrap gap-3 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-6">
        <input name="name" required placeholder="New album name (e.g. Sports Day 2026)" className="min-w-64 flex-1 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5" />
        <button className="rounded-full bg-gold-500 px-6 py-2.5 font-semibold text-navy-950">Create album</button>
      </form>

      <div className="space-y-6">
        {albums.map((a) => (
          <div key={a.id} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-6">
            <h2 className="font-serif text-xl">{a.name} <span className="text-sm font-normal text-ivory-100/50">({a.photos.length} photos)</span></h2>
            <form action={addPhoto} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="albumId" value={a.id} />
              <input name="src" required placeholder="/images/photo.webp or https://…" className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm" />
              <input name="alt" placeholder="Description (alt text)" className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm" />
              <button className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950">Add photo</button>
            </form>
            {a.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {a.photos.map((p) => (
                  <div key={p.id} className="group relative overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt={p.alt} className="aspect-square w-full object-cover" loading="lazy" />
                    <form action={deletePhoto} className="absolute inset-x-0 bottom-0 opacity-0 transition group-hover:opacity-100">
                      <input type="hidden" name="id" value={p.id} />
                      <button className="w-full bg-ember-500/90 py-1 text-xs font-semibold text-white">Remove</button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {albums.length === 0 && <p className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-8 text-center text-ivory-100/50">No albums yet — create one above.</p>}
      </div>
    </div>
  );
}
