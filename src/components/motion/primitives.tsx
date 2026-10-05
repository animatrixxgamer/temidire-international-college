"use client";
import { ReactNode, useRef } from "react";
import { motion, useInView, useScroll, useSpring, useReducedMotion, useTransform } from "framer-motion";
import { EASE_OUT, EASE_CURTAIN } from "./tokens";

/** Rise / blur / mask reveal. Wrap anything. */
export function Reveal({
  children,
  kind = "rise",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  kind?: "rise" | "blur" | "mask";
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const from =
    kind === "mask"
      ? { clipPath: "inset(0 0 100% 0)" }
      : kind === "blur"
        ? { opacity: 0, filter: "blur(10px)" }
        : { opacity: 0, y: 28 };
  const to =
    kind === "mask"
      ? { clipPath: "inset(0 0 0% 0)" }
      : { opacity: 1, y: 0, filter: "blur(0px)" };
  return (
    <motion.div
      className={className}
      initial={reduce ? false : from}
      whileInView={to}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/** Headline that rises word by word. */
export function SplitHeading({ text, className = "" }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <h2 className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-1 align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: EASE_OUT }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

/** Gold progress bar across the top of the page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[9600] h-[3px] origin-left bg-gold-500" style={{ scaleX }} />;
}

/** Image: wipe-in on enter, slow parallax drift while scrolling, gentle zoom on hover. */
export function ImageReveal({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  return (
    <motion.div
      ref={ref}
      className={`group relative overflow-hidden rounded-xl ${className}`}
      initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1, ease: EASE_CURTAIN }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={reduce ? undefined : { y, scale: 1.12 }}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
    </motion.div>
  );
}

/** Link with an underline that draws in. */
export function DrawLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={`relative inline-block ${className}`}>
      {children}
      <span
        aria-hidden
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gold-500 transition-transform duration-300 ease-out [a:hover>&]:scale-x-100 [a:focus-visible>&]:scale-x-100"
      />
    </a>
  );
}

/** Mount children only while on screen so ambient loops don't burn battery. */
export function WhenVisible({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { margin: "100px" });
  return <div ref={ref}>{on ? children : null}</div>;
}
