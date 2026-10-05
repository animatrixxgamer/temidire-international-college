"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TransitionLink } from "@/components/motion/PageTransition";
import { EASE_OUT } from "@/components/motion/tokens";
import { schools } from "@/content/siteContent";

/** Four tall panels that behave like book spines; hover/focus expands one. Mobile: accordion. */
export default function SchoolSpines() {
  const reduce = useReducedMotion();
  const [activeMobile, setActiveMobile] = useState<number | null>(0);

  return (
    <>
      {/* Desktop: expanding spines */}
      <div className="hidden gap-3 md:flex" onMouseLeave={() => setActiveMobile(null)}>
        {schools.map((s, i) => (
          <TransitionLink
            key={s.id}
            href={`/schools#${s.id}`}
            className="group relative flex h-[420px] flex-1 basis-0 overflow-hidden rounded-2xl bg-navy-800 transition-[flex-grow] duration-500 hover:flex-[1.6] focus-visible:flex-[1.6]"
            onMouseEnter={() => setActiveMobile(i)}
            aria-label={`${s.name}: ${s.ages}`}
          >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
            </div>
            <div className="relative mt-auto w-full p-5">
              <p className="font-serif text-2xl [writing-mode:vertical-rl] group-hover:[writing-mode:horizontal-tb] group-focus-visible:[writing-mode:horizontal-tb] md:rotate-180">
                {s.name}
              </p>
              <motion.div
                initial={false}
                animate={{ opacity: activeMobile === i ? 1 : 0, y: activeMobile === i ? 0 : 8 }}
                transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT }}
                className="mt-3"
              >
                <p className="text-xs uppercase tracking-wide text-gold-500">{s.ages}</p>
                <p className="mt-1 text-sm text-ivory-100/80">{s.line}</p>
                <p className="mt-3 text-sm font-semibold text-gold-500">See {s.name} →</p>
              </motion.div>
            </div>
          </TransitionLink>
        ))}
      </div>

      {/* Mobile: accordion */}
      <div className="space-y-3 md:hidden">
        {schools.map((s, i) => (
          <div key={s.id} className="overflow-hidden rounded-2xl bg-navy-800">
            <button
              className="flex w-full items-center justify-between p-5 text-left"
              onClick={() => setActiveMobile(activeMobile === i ? null : i)}
              aria-expanded={activeMobile === i}
            >
              <span className="font-serif text-xl">{s.name}</span>
              <span className="text-xs text-ivory-100/60">{s.ages}</span>
            </button>
            <motion.div
              initial={false}
              animate={{ height: activeMobile === i ? "auto" : 0, opacity: activeMobile === i ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT }}
            >
              <div className="px-5 pb-5">
                <p className="text-sm text-ivory-100/80">{s.line}</p>
                <TransitionLink href={`/schools#${s.id}`} className="mt-3 inline-block text-sm font-semibold text-gold-500">
                  See {s.name} →
                </TransitionLink>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </>
  );
}
