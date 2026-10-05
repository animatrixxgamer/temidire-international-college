"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

// Gold dot + lagging ring. Ring grows on links, becomes a "View" badge over images.
// Add data-cursor="view" to any element to force the badge.
export default function CustomCursor() {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  const [mode, setMode] = useState<"idle" | "link" | "view">("idle");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 140, damping: 18, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 140, damping: 18, mass: 0.6 });

  useEffect(() => setFine(window.matchMedia("(pointer:fine)").matches), []);

  useEffect(() => {
    if (!fine || reduce) return; // reduced motion: keep the native cursor
    document.documentElement.classList.add("cursor-none-all");
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("img,[data-cursor='view']")) setMode("view");
      else if (t.closest("a,button,[role='button']")) setMode("link");
      else setMode("idle");
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      document.documentElement.classList.remove("cursor-none-all");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [fine, reduce, x, y]);

  if (!fine || reduce) return null;
  const size = mode === "view" ? 76 : mode === "link" ? 64 : 34;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-gold-500"
        style={{ x, y, translateX: "-50%", translateY: "-50%", opacity: mode === "view" ? 0 : 1 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex items-center justify-center rounded-full border border-gold-500"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: size,
          height: size,
          backgroundColor:
            mode === "view" ? "#C9A24B" : mode === "link" ? "rgba(201,162,75,.18)" : "rgba(201,162,75,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <motion.span
          className="text-[13px] font-semibold text-navy-950"
          animate={{ opacity: mode === "view" ? 1 : 0, scale: mode === "view" ? 1 : 0.6 }}
        >
          View
        </motion.span>
      </motion.div>
    </>
  );
}
