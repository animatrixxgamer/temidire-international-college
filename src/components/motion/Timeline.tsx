"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "./tokens";

type Milestone = { year: string; title: string; text: string };

const DEFAULT: Milestone[] = [
  { year: "2006", title: "Founded", text: "Twelve pupils, two teachers and one borrowed classroom." },
  { year: "2011", title: "Secondary section opens", text: "First JSS 1 class admitted." },
  { year: "2016", title: "First full WAEC set", text: "Our first SSS 3 class sits the exam on campus." },
  { year: "2021", title: "School bus service", text: "Four routes across Ondo Town." },
  { year: "2025", title: "New science block", text: "Purpose-built laboratories for every year group." },
];

// The gold spine draws as you scroll; each milestone pops in when reached.
export default function Timeline({ items = DEFAULT }: { items?: Milestone[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <ol ref={ref} className="relative mx-auto max-w-4xl px-6 py-16">
      <span aria-hidden className="absolute bottom-16 left-6 top-16 w-px bg-ivory-100/15 md:left-1/2" />
      <motion.span
        aria-hidden
        className="absolute bottom-16 left-6 top-16 w-px origin-top bg-gold-500 md:left-1/2"
        style={{ scaleY: reduce ? 1 : scaleY }}
      />
      {items.map((it, i) => (
        <li
          key={it.year}
          className={`relative mb-16 pl-10 md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-12" : "md:pr-12 md:text-right"}`}
        >
          <motion.span
            aria-hidden
            className={`absolute left-[-5px] top-2 h-3 w-3 rounded-full bg-gold-500 md:left-auto ${i % 2 ? "md:-left-[6px]" : "md:-right-[6px]"}`}
            initial={reduce ? false : { scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 14 }}
          />
          <motion.div
            initial={reduce ? false : { opacity: 0, x: i % 2 ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <p className="font-serif text-3xl text-gold-500">{it.year}</p>
            <h3 className="mt-1 text-xl font-semibold">{it.title}</h3>
            <p className="mt-2 text-ivory-100/70">{it.text}</p>
          </motion.div>
        </li>
      ))}
    </ol>
  );
}
