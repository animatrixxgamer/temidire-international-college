"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "./tokens";

const DEFAULT = [
  { quote: "My daughter walked in shy and left leading the debate team. The teachers noticed her before she did.", name: "Adaeze O.", role: "Parent, JSS 2" },
  { quote: "Small classes meant I could ask the question I was embarrassed to ask. That changed everything for my grades.", name: "Tunde A.", role: "Alumnus, Class of 2021" },
  { quote: "I came to teach physics and ended up learning how to teach people. It is a school that takes both seriously.", name: "Mrs. Bello", role: "Head of Science" },
];

type Item = { quote: string; name: string; role: string };

export default function Testimonials({ items = DEFAULT, interval = 7000 }: { items?: Item[]; interval?: number }) {
  const reduce = useReducedMotion();
  const [[i, dir], set] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const go = (n: number) => set(([cur]) => [(cur + n + items.length) % items.length, n]);

  useEffect(() => {
    if (reduce || paused || items.length < 2) return; // no autoplay under reduced motion
    const id = setInterval(() => go(1), interval);
    return () => clearInterval(id);
  }, [reduce, paused, interval, items.length]);

  const t = items[i];
  return (
    <section
      aria-roledescription="carousel"
      aria-label="Testimonials"
      className="mx-auto max-w-3xl px-6 py-20 text-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative min-h-[16rem]" aria-live={paused ? "polite" : "off"}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.figure
            key={i}
            custom={dir}
            drag={reduce ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, { offset }) => Math.abs(offset.x) > 80 && go(offset.x < 0 ? 1 : -1)}
            initial={{ opacity: 0, x: reduce ? 0 : dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : dir * -60 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
          >
            <blockquote className="font-serif text-2xl leading-relaxed md:text-3xl">“{t.quote}”</blockquote>
            <figcaption className="mt-6 text-ivory-100/70">
              <span className="font-semibold text-gold-500">{t.name}</span>, {t.role}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={() => go(-1)}
          aria-label="Previous testimonial"
          className="rounded-full border border-gold-500/50 px-4 py-2 hover:bg-gold-500/10"
        >
          Prev
        </button>
        <div className="flex gap-2">
          {items.map((_, n) => (
            <button
              key={n}
              onClick={() => set([n, n > i ? 1 : -1])}
              aria-label={`Show testimonial ${n + 1}`}
              aria-current={n === i}
              className="relative h-2 w-2 rounded-full bg-ivory-100/30"
            >
              {n === i && <motion.span layoutId="t-dot" className="absolute -inset-0.5 rounded-full bg-gold-500" />}
            </button>
          ))}
        </div>
        <button
          onClick={() => go(1)}
          aria-label="Next testimonial"
          className="rounded-full border border-gold-500/50 px-4 py-2 hover:bg-gold-500/10"
        >
          Next
        </button>
      </div>
    </section>
  );
}
