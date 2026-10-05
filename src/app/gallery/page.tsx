import type { Metadata } from "next";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { Gallery } from "@/components/motion/Extras";
import { galleryImages } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from campus life at Temidire International College, Ondo.",
};

export default function GalleryPage() {
  return (
    <main className="pt-16">
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-20 text-center">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">Gallery</p>
          <SplitHeading text="Around our campus" className="mt-3 font-serif text-3xl md:text-5xl" />
          <p className="mx-auto mt-6 max-w-xl text-ivory-100/70">
            Tap any photo to view it full size. Hovering shows the "View" cursor.
          </p>
        </Reveal>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Gallery images={galleryImages} />
        <p className="mt-6 text-center text-xs text-ivory-100/40">
          Placeholder images — real, consented school photos will replace these before launch.
        </p>
      </section>
    </main>
  );
}
