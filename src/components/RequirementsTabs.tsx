"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { admissionRequirements } from "@/content/siteContent";

const LEVELS = Object.keys(admissionRequirements);

export default function RequirementsTabs() {
  const [level, setLevel] = useState(LEVELS[0]);
  const reduce = useReducedMotion();
  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-full bg-navy-800 p-1">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            aria-current={l === level ? "true" : undefined}
            className="relative rounded-full px-5 py-2 text-sm"
          >
            {l === level && (
              <motion.span
                layoutId="req-tab"
                className="absolute inset-0 rounded-full bg-gold-500"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className={`relative ${l === level ? "font-semibold text-navy-950" : "text-ivory-100"}`}>{l}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.ul
          key={level}
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-6 grid gap-3 sm:grid-cols-2"
        >
          {admissionRequirements[level].map((r) => (
            <li key={r} className="flex items-center gap-3 rounded-xl border border-ivory-100/15 bg-navy-800/60 px-4 py-3 text-sm">
              <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-gold-500" aria-hidden>
                <path d="M4 10.5 8.5 15 16 5.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {r}
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}
