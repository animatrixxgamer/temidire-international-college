"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

/* ————— 3D tilt card (feature cards only, max 3 per page) ————— */
export function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 200, damping: 20 });
  const sy = useSpring(py, { stiffness: 200, damping: 20 });
  const rotateY = useTransform(sx, [0, 1], [-10, 10]);
  const rotateX = useTransform(sy, [0, 1], [10, -10]);
  const onMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  return (
    <motion.div
      onMouseMove={reduce ? undefined : onMove}
      onMouseLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className={`rounded-2xl bg-navy-800 p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ————— Count-up number ————— */
export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 1.8,
  format,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setV(to);
    const c = animate(0, to, { duration, ease: "easeOut", onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, to, duration, reduce]);
  return (
    <span ref={ref} className="tabular">
      {prefix}
      {format ? format(v) : v.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ————— Announcement marquee (pauses on hover; static single line on reduced motion) ————— */
export function Marquee({ items, speed = 30 }: { items: string[]; speed?: number }) {
  const reduce = useReducedMotion();
  const row = [...items, ...items];
  if (reduce) {
    return (
      <div className="overflow-hidden whitespace-nowrap py-4 text-center">
        <span className="font-serif text-xl text-gold-500">{items.join("  ·  ")}</span>
      </div>
    );
  }
  return (
    <div className="group overflow-hidden whitespace-nowrap py-4">
      <motion.div
        className="inline-flex gap-12 group-hover:[animation-play-state:paused]"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {row.map((t, i) => (
          <span key={i} aria-hidden={i >= items.length} className="font-serif text-2xl text-gold-500">
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ————— Gallery with lightbox zoom ————— */
export function Gallery({ images }: { images: Array<{ src: string; alt: string }> }) {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((im, i) => (
          <button
            key={i}
            onClick={() => setOpen(i)}
            aria-label={`Enlarge: ${im.alt}`}
            className="overflow-hidden rounded-lg"
          >
            <motion.img
              layoutId={`g-${i}`}
              src={im.src}
              alt={im.alt}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </button>
        ))}
      </div>
      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[9990] grid place-items-center bg-navy-950/90 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label={images[open].alt}
          >
            <motion.img
              layoutId={`g-${open}`}
              src={images[open].src}
              alt={images[open].alt}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ————— Route map: stroke draws stop to stop, bus travels the path ————— */
type Stop = [name: string, x: number, y: number];

export function RouteMap({ stops }: { stops: Stop[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const d = stops
    .map(([, x, y], i) => (i ? `S${(stops[i - 1][1] + x) / 2},${y + (i % 2 ? -60 : 60)} ${x},${y}` : `M${x},${y}`))
    .join(" ");

  const busRef = useRef<SVGGElement>(null);
  const [busT, setBusT] = useState(0);
  useEffect(() => {
    if (reduce || !inView) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 12000;
    const loop = (t: number) => {
      setBusT(((t - t0) % dur) / dur);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduce, inView]);

  const pathRef = useRef<SVGPathElement>(null);
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const len = p.getTotalLength();
    const point = p.getPointAtLength(len * busT);
    setPt({ x: point.x, y: point.y });
  }, [busT]);

  return (
    <svg ref={ref} viewBox="0 0 380 210" className="w-full max-w-xl" role="img" aria-label="Bus route map">
      <motion.path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="#C9A24B"
        strokeWidth={3}
        strokeDasharray="1 8"
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: inView ? 1 : 0 }}
        transition={{ duration: 2.4, ease: "easeInOut" }}
      />
      {stops.map(([name, x, y], i) => (
        <motion.g
          key={name}
          initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.4 }}
          animate={inView || reduce ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: reduce ? 0 : (i / stops.length) * 2.2, type: "spring", stiffness: 300, damping: 16 }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        >
          <circle cx={x} cy={y} r={7} fill="#C9A24B" />
          <circle cx={x} cy={y} r={3} fill="#06122A" />
          <text x={x} y={y + 22} textAnchor="middle" fontSize="11" fill="currentColor">
            {name}
          </text>
        </motion.g>
      ))}
      {/* travelling bus */}
      {!reduce && inView && pt && (
        <g ref={busRef} transform={`translate(${pt.x} ${pt.y - 10})`}>
          <rect x={-9} y={-7} width={18} height={12} rx={3} fill="#C9A24B" />
          <rect x={-6} y={-4} width={4} height={4} rx={1} fill="#06122A" />
          <rect x={2} y={-4} width={4} height={4} rx={1} fill="#06122A" />
          <circle cx={-4} cy={5} r={2.2} fill="#F5EFE0" />
          <circle cx={4} cy={5} r={2.2} fill="#F5EFE0" />
        </g>
      )}
    </svg>
  );
}

/* ————— 404: the lost book (click it — it hops home) ————— */
export function LostBook() {
  const reduce = useReducedMotion();
  const [hopping, setHopping] = useState(false);
  return (
    <main className="grid min-h-screen place-items-center bg-navy-950 px-6 text-center">
      <div>
        <svg viewBox="0 0 240 160" className="mx-auto w-72" role="img" aria-label="An open book wandering among empty shelves">
          {[20, 70, 120].map((y) => (
            <rect key={y} x="10" y={y + 28} width="220" height="4" fill="#1B3A6B" />
          ))}
          {[30, 52, 168, 196].map((x, i) => (
            <rect key={x} x={x} y={i % 2 ? 48 : 98} width="14" height="30" rx="2" fill="#16407A" />
          ))}
          <motion.g
            onClick={() => !reduce && setHopping(true)}
            style={{ cursor: reduce ? undefined : "pointer" }}
            animate={
              hopping
                ? { x: 0, y: [0, -60, 0], rotate: [0, 0, 0], opacity: [1, 1, 0.4] }
                : { x: [-40, 40, -40], y: [0, -10, 0], rotate: [-6, 6, -6] }
            }
            transition={hopping ? { duration: 1.2, ease: "easeInOut" } : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M80 70 Q100 60 120 72 Q140 60 160 70 V104 Q140 94 120 106 Q100 94 80 104 Z" fill="#F5EFE0" stroke="#C9A24B" strokeWidth="2" />
            <path d="M120 72 V106" stroke="#C9A24B" strokeWidth="2" />
            <circle cx="104" cy="84" r="2.5" fill="#06122A" />
            <circle cx="136" cy="84" r="2.5" fill="#06122A" />
            <text x="120" y="60" textAnchor="middle" fontSize="18" fill="#C9A24B">?</text>
          </motion.g>
        </svg>
        <h1 className="mt-6 font-serif text-4xl">This page is out on loan</h1>
        <p className="mt-3 text-ivory-100/70">We can't find that page. It may have moved or the link is wrong.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-gold-500 px-7 py-3 font-semibold text-navy-950"
        >
          Back to the home page
        </Link>
      </div>
    </main>
  );
}
