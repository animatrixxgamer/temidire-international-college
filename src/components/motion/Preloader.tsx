"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const VIEWBOX = "0 0 240 290";
const NAVY = "#13243b";
const GOLD = "#C9A24B";
const IVORY = "#F4EFE6";

// Timing is compressed so the intro never feels like a wait. `step` is the gap
// between one stroke starting and the next.
const STEP = 0.22;
const STROKE_MS = 520;

// Hard ceiling: if the stroke animation has not finished by now (e.g. the tab
// was opened in the background and requestAnimationFrame is throttled, so
// onAnimationComplete never fires), we dismiss anyway. This is the guarantee
// that the overlay can never sit over the page and swallow every click.
const ENTRY_CEILING_MS = 4000;
// Time we allow the exit wipe to play before unmounting outright.
const EXIT_MS = 900;

// Stroke-draw sequence for the preloader: crown → inner ring → book → lamp →
// star → laurel → motto. Each entry is a path + optional mirror flag.
const STROKES = [
  // outer navy disc (filled, no stroke animation needed — drawn as solid)
  { d: `M30 50 H210 A90 90 0 1 0 30 50 Z`, fill: NAVY, shield: true },
  // gold outer rim
  { d: "M30 50 H210 A90 90 0 1 0 30 50 Z", fill: "none", stroke: true },
  // gold inner rim
  { d: "M40 62 H200 A78 78 0 1 0 40 62 Z", fill: "none", stroke: true, delay: 1 },
  // ivory inner field
  { d: "M48 72 H192 A68 68 0 1 0 48 72 Z", fill: IVORY, shield: true, delay: 2 },
  // crown
  { d: "M88 40 L88 22 L96 32 L104 10 L112 32 L120 18 L128 32 L136 10 L144 32 L152 22 L152 40 Z M88 40 H152 V48 H88 Z", fill: GOLD, stroke: false, delay: 3 },
  // shield panel
  { d: "M64 96 H176 V200 C176 232 154 252 120 258 C86 252 64 232 64 200 Z", fill: NAVY, stroke: true, delay: 4 },
  // open book
  { d: "M78 152 Q120 142 162 152 L162 192 Q120 182 78 192 Z M120 148 V196 M78 152 H162 M78 152 Q99 147 120 152 Q141 147 162 152 M78 188 Q99 184 120 188 Q141 184 162 188", fill: "none", stroke: true, delay: 5 },
  // lamp body
  { d: "M138 92 C132 84 134 76 138 70 C142 76 144 84 138 92 Z M133 92 H143 M130 96 C128 104 132 110 138 110 C144 110 148 104 146 96", fill: "none", stroke: true, delay: 6 },
  // lamp flame
  { d: "M138 70 C136 66 140 62 142 62 C144 62 146 66 144 70 Z", fill: IVORY, stroke: true, delay: 7 },
  // star (upper-left of emblem)
  { d: "M100 62 L102 68 L108 68 L103 72 L105 78 L100 74 L95 78 L97 72 L92 68 L98 68 Z", fill: GOLD, stroke: false, delay: 8 },
  // laurel left
  { d: "M62 250 C44 228 38 188 58 150 M58 150 q-2 -6 -8 -4 M58 150 q2 -6 8 -4 M58 170 q-2 -6 -8 -4 M58 170 q2 -6 8 -4 M58 190 q-2 -6 -8 -4 M58 190 q2 -6 8 -4 M58 210 q-2 -6 -8 -4 M58 210 q2 -6 8 -4 M58 230 q-2 -6 -8 -4 M58 230 q2 -6 8 -4", fill: "none", stroke: true, delay: 9 },
  // laurel right
  { d: "M178 250 C196 228 202 188 182 150 M182 150 q2 -6 8 -4 M182 150 q-2 -6 -8 -4 M182 170 q2 -6 8 -4 M182 170 q-2 -6 -8 -4 M182 190 q2 -6 8 -4 M182 190 q-2 -6 -8 -4 M182 210 q2 -6 8 -4 M182 210 q-2 -6 -8 -4 M182 230 q2 -6 8 -4 M182 230 q-2 -6 -8 -4", fill: "none", stroke: true, delay: 10 },
  // motto ribbon
  { d: "M40 272 H200 V278 H40 Z", fill: NAVY, stroke: true, delay: 11 },
];

const TOTAL = STROKES.length;

type Phase = "idle" | "play" | "closing" | "gone";

export default function Preloader({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [doneIdx, setDoneIdx] = useState(-1);
  const doneNotified = useRef(false);
  const decided = useRef(false);

  const notifyDone = useCallback(() => {
    if (doneNotified.current) return;
    doneNotified.current = true;
    onDone?.();
  }, [onDone]);

  // Start closing (either naturally or by click). A wall-clock timer — not an
  // animation callback — is what guarantees the overlay is finally removed.
  const close = useCallback(() => {
    setPhase((p) => (p === "play" || p === "idle" ? "closing" : p));
    window.setTimeout(() => {
      setPhase("gone");
      notifyDone();
    }, reduce ? 50 : EXIT_MS);
  }, [notifyDone, reduce]);

  // Decide once, on mount, whether to play the intro at all.
  useEffect(() => {
    if (decided.current) return; // survives StrictMode's double-invoke
    decided.current = true;
    // Skip the whole intro in a background tab: requestAnimationFrame is
    // throttled there, so the crest would never finish drawing.
    if (typeof document !== "undefined" && document.hidden) {
      setPhase("gone");
      notifyDone();
      return;
    }
    try {
      if (sessionStorage.getItem("tmd-preloaded")) {
        setPhase("gone");
        notifyDone();
        return;
      }
      sessionStorage.setItem("tmd-preloaded", "1");
    } catch {
      /* storage blocked (private mode) — show the intro once, it self-dismisses */
    }
    setPhase("play");
  }, [notifyDone]);

  // While the intro is playing, hold a wall-clock ceiling so a throttled tab
  // (or a stuck animation) can never leave the overlay covering the page.
  useEffect(() => {
    if (phase !== "play") return;
    const ceiling = window.setTimeout(close, reduce ? 300 : ENTRY_CEILING_MS);
    return () => window.clearTimeout(ceiling);
  }, [phase, close, reduce]);

  if (phase === "gone") return null;

  const closing = phase === "closing";

  return (
    <div
      className="fixed inset-0 z-[10000] grid cursor-pointer place-items-center bg-transparent"
      onClick={close}
      role="button"
      aria-label="Skip intro"
      // Never let the overlay intercept clicks once it is on its way out.
      style={{ pointerEvents: closing ? "none" : "auto" }}
    >
      {/* curtain wipe: two halves slide apart */}
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-y-0 w-1/2 bg-navy-950"
          style={{ left: i ? "50%" : 0 }}
          initial={{ y: 0 }}
          animate={closing ? { y: i ? "100%" : "-100%" } : { y: 0 }}
          transition={{
            duration: reduce ? 0.01 : 0.9,
            ease: [0.76, 0, 0.24, 1],
            delay: closing ? i * 0.08 : 0,
          }}
        />
      ))}

      {/* crest stroke-draw */}
      <motion.svg
        viewBox={VIEWBOX}
        className="relative h-56 w-48"
        role="img"
        aria-label="Loading"
        initial={{ opacity: 1 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: reduce ? 0.01 : 0.25 }}
      >
        {STROKES.map((s, idx) => {
          const isLast = idx === TOTAL - 1;
          return (
            <motion.path
              key={idx}
              d={s.d}
              fill={s.fill ?? "none"}
              stroke={s.stroke ? GOLD : "none"}
              strokeWidth={s.fill ? (s.shield ? 0 : 2) : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: reduce ? 0.01 : STROKE_MS / 1000,
                delay: reduce ? 0 : (s.delay ?? 0) * STEP,
                ease: "easeInOut",
              }}
              onAnimationComplete={
                isLast
                  ? () => {
                      setDoneIdx(idx);
                      window.setTimeout(close, reduce ? 0 : 500);
                    }
                  : undefined
              }
            />
          );
        })}
        {/* motto text fades in after ribbon */}
        <motion.text
          x="120"
          y="278"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          letterSpacing="3"
          fill={GOLD}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="700"
          initial={{ opacity: 0 }}
          animate={{ opacity: doneIdx >= 0 ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          SCIENTIA  ·  ET  ·  VIRTUS
        </motion.text>
      </motion.svg>
    </div>
  );
}
