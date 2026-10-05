"use client";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "./tokens";

const LenisCtx = createContext<{ current: Lenis | null }>({ current: null });
export const useLenis = () => useContext(LenisCtx);

/** Wrap the app once in the root client wrapper. Desktop only; disabled for reduced motion. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<Lenis | null>(null);
  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer:fine)").matches) return; // Lenis desktop-only per motion catalog
    const lenis = new Lenis({ lerp: 0.09 });
    ref.current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      ref.current = null;
    };
  }, [reduce]);
  return <LenisCtx.Provider value={ref}>{children}</LenisCtx.Provider>;
}

const parent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const child = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

/** Parallax + stagger container: <Section><Item>…</Item></Section> */
export function Section({
  children,
  parallax = 60,
  className = "",
}: {
  children: ReactNode;
  parallax?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [parallax, -parallax]);
  return (
    <motion.section
      ref={ref}
      className={className}
      variants={reduce ? undefined : parent}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      style={reduce ? undefined : { y }}
    >
      {children}
    </motion.section>
  );
}

export function Item({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={child} className={className}>
      {children}
    </motion.div>
  );
}
