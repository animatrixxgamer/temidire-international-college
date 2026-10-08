import type { Metadata } from "next";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { FilterGallery, type GalleryImage } from "@/components/motion/FilterGallery";
import { galleryImages } from "@/content/siteContent";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from campus life at Temidire International College, Ondo.",
};

/** Albums staff create in /admin/gallery — merged in after the standing set. */
async function getCmsImages(): Promise<GalleryImage[]> {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      include: { photos: true },
      orderBy: { name: "asc" },
    });
    return albums.flatMap((a) =>
      a.photos.map((p) => ({
        id: p.id,
        src: p.src,
        alt: p.alt,
        album: a.name,
        caption: p.alt,
      })),
    );
  } catch {
    return []; // DB unreachable — the static set still renders
  }
}

export default async function GalleryPage() {
  const cms = await getCmsImages();
  const images: GalleryImage[] = [...galleryImages, ...cms];

  return (
    <main className="pt-16">
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-20 text-center">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">Gallery</p>
          <SplitHeading text="Around our campus" className="mt-3 font-serif text-3xl md:text-5xl" />
          <p className="mx-auto mt-6 max-w-xl text-ivory-100/70">
            Filter by album, then tap any photo to open it full size. Arrow keys
            move through the album, Escape closes.
          </p>
        </Reveal>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <FilterGallery images={images} />
      </section>
    </main>
  );
}
