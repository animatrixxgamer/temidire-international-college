"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const VIEWBOX = "0 0 240 290";
const NAVY = "#13243b";
const GOLD = "#C9A24B";
const IVORY = "#F4EFE6";

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

export default function Preloader({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [doneIdx, setDoneIdx] = useState(-1);

  useEffect(() => {
    if (sessionStorage.getItem("tmd-preloaded")) return;
    setShow(true);
    sessionStorage.setItem("tmd-preloaded", "1");
  }, []);

  const finish = () => {
    setShow(false);
    onDone?.();
  };

  const lastTiming = STROKES[TOTAL - 1];
  const lastDelay = (lastTiming.delay ?? 0) * 0.9 + 0.9;

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          key="pre"
          className="fixed inset-0 z-[10000] grid cursor-pointer place-items-center bg-transparent"
          onClick={finish}
          role="button"
          aria-label="Skip intro"
        >
          {/* curtain wipe: two halves slide apart */}
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-y-0 w-1/2 bg-navy-950"
              style={{ left: i ? "50%" : 0 }}
              exit={{
                y: i ? "100%" : "-100%",
                transition: {
                  duration: reduce ? 0.01 : 0.9,
                  ease: [0.76, 0, 0.24, 1],
                  delay: i * 0.08,
                },
              }}
            />
          ))}

          {/* crest stroke-draw */}
          <motion.svg
            viewBox={VIEWBOX}
            className="relative h-56 w-48"
            role="img"
            aria-label="Loading"
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
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
                    duration: reduce ? 0.01 : 0.9,
                    delay: reduce ? 0 : (s.delay ?? 0) * 0.9,
                    ease: "easeInOut",
                  }}
                  onAnimationComplete={
                    isLast
                      ? () => {
                          setDoneIdx(idx);
                          setTimeout(finish, reduce ? 0 : 700);
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
