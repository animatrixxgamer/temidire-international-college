"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CREST_STROKES, CREST_VIEWBOX, MIRROR } from "./Crest";

// Crest draws itself stroke by stroke → shield fills, motto fades in → curtain wipes away.
// Plays once per session; skippable by click.
export default function Preloader({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [filled, setFilled] = useState(false);
  const last = CREST_STROKES.length - 1;

  useEffect(() => {
    if (sessionStorage.getItem("tmd-preloaded")) return;
    setShow(true);
    sessionStorage.setItem("tmd-preloaded", "1");
  }, []);

  const finish = () => {
    setShow(false);
    onDone?.();
  };

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
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-y-0 w-1/2 bg-navy-950"
              style={{ left: i ? "50%" : 0 }}
              exit={{
                y: i ? "100%" : "-100%",
                transition: { duration: reduce ? 0.01 : 0.9, ease: [0.76, 0, 0.24, 1], delay: i * 0.08 },
              }}
            />
          ))}
          <motion.svg
            viewBox={CREST_VIEWBOX}
            className="relative h-56 w-48"
            role="img"
            aria-label="Loading"
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            {CREST_STROKES.map((s, i) => (
              <motion.path
                key={i}
                d={s.d}
                transform={s.mirror ? MIRROR : undefined}
                fill={s.shield && filled ? "#C9A24B22" : "none"}
                stroke="#C9A24B"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: reduce ? 0.01 : 0.9,
                  delay: reduce ? 0 : i * 0.14,
                  ease: "easeInOut",
                }}
                onAnimationComplete={
                  i === last
                    ? () => {
                        setFilled(true);
                        setTimeout(finish, reduce ? 0 : 900);
                      }
                    : undefined
                }
              />
            ))}
            <motion.text
              x="120"
              y="280"
              textAnchor="middle"
              fontSize="13"
              letterSpacing="3"
              fill="#C9A24B"
              fontFamily="serif"
              initial={{ opacity: 0 }}
              animate={{ opacity: filled ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              Scientia et Virtus
            </motion.text>
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
