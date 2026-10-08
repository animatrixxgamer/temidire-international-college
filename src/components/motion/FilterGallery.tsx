"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onImgError } from "@/lib/img";

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  album: string;
  /** width / height, gives the masonry its varied heights */
  ratio?: number;
  caption?: string;
};

type FilterGalleryProps = {
  images: GalleryImage[];
  className?: string;
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function FilterGallery({ images, className = "" }: FilterGalleryProps) {
  const reduce = useReducedMotion();
  const [album, setAlbum] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const albums = useMemo(
    () => ["All", ...Array.from(new Set(images.map((i) => i.album)))],
    [images],
  );
  const visible = useMemo(
    () => (album === "All" ? images : images.filter((i) => i.album === album)),
    [album, images],
  );

  const index = openId ? visible.findIndex((i) => i.id === openId) : -1;
  const current = index >= 0 ? visible[index] : null;

  const close = useCallback(() => setOpenId(null), []);
  const step = useCallback(
    (dir: 1 | -1) => {
      if (index < 0) return;
      setOpenId(visible[(index + dir + visible.length) % visible.length].id);
    },
    [index, visible],
  );

  // Arrow keys + Escape, scroll lock, focus handling while the lightbox is open.
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const toRestore = returnFocus.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      toRestore?.focus();
    };
  }, [current === null, close, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const layoutTransition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 32 };

  return (
    <div className={className}>
      <div role="group" aria-label="Filter by album" className="mb-6 flex flex-wrap gap-2">
        {albums.map((a) => {
          const active = a === album;
          return (
            <button
              key={a}
              type="button"
              aria-pressed={active}
              onClick={() => setAlbum(a)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${
                active
                  ? "bg-navy-950 text-ivory-100"
                  : "border border-navy-800/25 text-navy-800 hover:bg-navy-950/5"
              }`}
            >
              {a}
            </button>
          );
        })}
      </div>

      <LayoutGroup>
        <motion.ul layout className="columns-2 gap-4 md:columns-3">
          <AnimatePresence mode="popLayout">
            {visible.map((img, i) => (
              <motion.li
                key={img.id}
                layout
                className="mb-4 break-inside-avoid"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ layout: layoutTransition, opacity: { duration: 0.25 } }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    returnFocus.current = e.currentTarget;
                    setOpenId(img.id);
                  }}
                  aria-label={`Open ${img.alt}`}
                  className="block w-full rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                >
                  {/* clip-path mask wipe, staggered 60ms */}
                  <motion.div
                    className="overflow-hidden rounded-[12px]"
                    initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
                    whileInView={{ clipPath: "inset(0 0% 0 0)" }}
                    viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                    transition={{
                      duration: 0.7,
                      ease: EASE,
                      delay: reduce ? 0 : (i % 12) * 0.06,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <motion.img
                      layoutId={`gallery-${img.id}`}
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      onError={onImgError}
                      className="block h-auto w-full object-cover"
                      style={img.ratio ? { aspectRatio: String(img.ratio) } : undefined}
                      transition={layoutTransition}
                    />
                  </motion.div>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        <AnimatePresence>
          {current && (
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={current.alt}
              tabIndex={-1}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-950/92 p-4 outline-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
              onClick={close}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                key={current.id}
                layoutId={`gallery-${current.id}`}
                src={current.src}
                alt={current.alt}
                onError={onImgError}
                className="max-h-[78vh] max-w-[92vw] rounded-[12px] object-contain"
                transition={layoutTransition}
                onClick={(e) => e.stopPropagation()}
              />

              <motion.p
                className="mt-4 max-w-xl text-center text-sm text-ivory-100"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : 0.2, duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-gold-500">{current.album}</span>
                {current.caption ? `: ${current.caption}` : ""}
                <span className="ml-3 tabular-nums text-ivory-100/60">
                  {index + 1} of {visible.length}
                </span>
              </motion.p>

              <button
                type="button"
                aria-label="Close"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
                className="absolute right-4 top-4 rounded-full bg-navy-800 px-4 py-2 text-sm text-ivory-100 hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-gold-500"
              >
                Close
              </button>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-navy-800 px-4 py-3 text-ivory-100 hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-gold-500"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-navy-800 px-4 py-3 text-ivory-100 hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-gold-500"
              >
                →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
