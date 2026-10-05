"use client";
import { useEffect, useState } from "react";
import { TransitionLink } from "@/components/motion/PageTransition";

const LINES = "Where curiosity becomes character.";
// deterministic "random" so server and client markup match
const dots = Array.from({ length: 28 }, (_, i) => ({
  l: (i * 37) % 100,
  t: (i * 61) % 100,
  s: 2 + (i % 3),
  d: (i % 9) * 0.8,
}));

export default function Hero() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(LINES.length);
    if (n >= LINES.length) return;
    const id = setTimeout(() => setN(n + 1), n === 0 ? 900 : 55);
    return () => clearTimeout(id);
  }, [n]);

  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden px-6 md:px-16">
      {/* gradient mesh */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(60%_50%_at_15%_20%,#16407A_0%,transparent_70%),radial-gradient(50%_45%_at_85%_30%,#0F2B57_0%,transparent_70%),radial-gradient(55%_50%_at_60%_95%,#1B3A6B_0%,transparent_70%)]"
      />
      <div aria-hidden className="absolute -left-1/4 top-0 -z-10 h-[70vh] w-[70vh] animate-drift rounded-full bg-gold-500/10 blur-3xl" />
      {/* particles */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {dots.map((p, i) => (
          <span
            key={i}
            style={{ left: `${p.l}%`, top: `${p.t}%`, width: p.s, height: p.s, animationDelay: `${p.d}s` }}
            className="absolute animate-float rounded-full bg-gold-500 motion-reduce:animate-none motion-reduce:opacity-40"
          />
        ))}
      </div>

      <div className="max-w-3xl pb-16 pt-28">
        <p className="animate-rise text-sm tracking-wide text-gold-500 [animation-delay:100ms] motion-reduce:animate-none">
          Admissions open for 2026/2027
        </p>
        <h1 aria-label={LINES} className="mt-4 min-h-[2.4em] font-serif text-5xl leading-[1.1] md:text-7xl">
          {LINES.slice(0, n)}
          <span aria-hidden className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-1 animate-caret bg-gold-500 motion-reduce:animate-none" />
        </h1>
        <p className="mt-6 max-w-xl animate-rise text-lg text-ivory-100/75 [animation-delay:600ms] motion-reduce:animate-none">
          Small classes, serious teaching, and a campus that feels like home — from Creche to SSS 3.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 animate-rise [animation-delay:800ms] motion-reduce:animate-none">
          <TransitionLink
            href="/admissions/apply"
            className="rounded-full bg-gold-500 px-7 py-3 font-semibold text-navy-950 transition hover:brightness-110"
          >
            Apply now
          </TransitionLink>
          <TransitionLink
            href="/contact"
            className="rounded-full border border-ivory-100/30 px-7 py-3 transition hover:border-gold-500"
          >
            Book a campus visit
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
