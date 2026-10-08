"use client";

import { motion, useReducedMotion } from "framer-motion";

export type EmptyKind = "book" | "calendar" | "inbox";

type ArtPath = { d: string; accent?: boolean; dot?: boolean };

const ART: Record<EmptyKind, ArtPath[]> = {
  book: [
    { d: "M14 96 C36 88 62 88 80 98 C98 88 124 88 146 96" },
    { d: "M80 36 C62 26 36 26 18 34 V90 C36 82 62 82 80 92 Z" },
    { d: "M80 36 C98 26 124 26 142 34 V90 C124 82 98 82 80 92" },
    { d: "M30 48 C42 44 54 45 68 50" },
    { d: "M30 60 C42 56 54 57 68 62" },
    { d: "M30 72 C42 68 54 69 60 72" },
    { d: "M104 28 V50 L110 45 L116 50 V30", accent: true },
  ],
  calendar: [
    { d: "M26 30 H134 A8 8 0 0 1 142 38 V98 A8 8 0 0 1 134 106 H26 A8 8 0 0 1 18 98 V38 A8 8 0 0 1 26 30 Z" },
    { d: "M18 52 H142" },
    { d: "M48 20 V36" },
    { d: "M112 20 V36" },
    { d: "M42 68 h.01", dot: true },
    { d: "M66 68 h.01", dot: true },
    { d: "M90 68 h.01", dot: true },
    { d: "M42 88 h.01", dot: true },
    { d: "M66 88 h.01", dot: true },
    { d: "M114 88 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0", accent: true },
  ],
  inbox: [
    { d: "M20 70 L36 34 H124 L140 70 V98 A6 6 0 0 1 134 104 H26 A6 6 0 0 1 20 98 Z" },
    { d: "M20 70 H54 L60 82 H100 L106 70 H140" },
    { d: "M58 48 H102" },
    { d: "M64 58 H96" },
    { d: "M80 14 V28 M72 22 L80 14 L88 22", accent: true },
  ],
};

const DEFAULT_CAPTION: Record<EmptyKind, string> = {
  book: "No lessons yet. Add the first one.",
  calendar: "Nothing scheduled. Add an event.",
  inbox: "Nothing new here. Check back soon.",
};

const STAGGER = 0.14;
const DRAW = 0.8;

type EmptyStateProps = {
  kind: EmptyKind;
  caption?: string;
  className?: string;
  /** "light" for ivory/paper surfaces, "dark" for the navy dashboard cards. */
  tone?: "light" | "dark";
};

export function EmptyState({ kind, caption, className = "", tone = "light" }: EmptyStateProps) {
  const reduce = useReducedMotion();
  const paths = ART[kind];
  const text = caption ?? DEFAULT_CAPTION[kind];
  const drawEnd = (paths.length - 1) * STAGGER + DRAW;
  const onDark = tone === "dark";

  return (
    <figure className={`flex flex-col items-center gap-4 text-center ${className}`}>
      <svg
        viewBox="0 0 160 120"
        className="h-32 w-44"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label={text}
      >
        {/* One gentle breathe after drawing finishes. It loops, so count it as an ambient loop. */}
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
            delay: drawEnd + 0.3,
          }}
        >
          {paths.map((p, i) => (
            <motion.path
              key={i}
              d={p.d}
              className={
                p.accent
                  ? "stroke-gold-500"
                  : onDark
                    ? "stroke-ivory-100/70"
                    : "stroke-navy-800"
              }
              strokeWidth={p.dot ? 5 : 2.5}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: DRAW, delay: i * STAGGER, ease: "easeInOut" }}
            />
          ))}
        </motion.g>
      </svg>

      <figcaption className={onDark ? "text-sm text-ivory-100/70" : "text-sm text-navy-800"}>{text}</figcaption>
    </figure>
  );
}

export const EmptyBook = (props: Omit<EmptyStateProps, "kind">) => (
  <EmptyState kind="book" {...props} />
);
export const EmptyCalendar = (props: Omit<EmptyStateProps, "kind">) => (
  <EmptyState kind="calendar" {...props} />
);
export const EmptyInbox = (props: Omit<EmptyStateProps, "kind">) => (
  <EmptyState kind="inbox" {...props} />
);
