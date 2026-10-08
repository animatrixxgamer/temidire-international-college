"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export type FeeStatus = "UNPAID" | "PARTIAL" | "PAID";

type FeeProgressBarProps = {
  paid: number;
  total: number;
  status: FeeStatus;
  currency?: string;
  className?: string;
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

const DOTS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const distance = 46 + (i % 3) * 16;
  return {
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance),
    gold: i % 2 === 0,
  };
});

const BADGE: Record<FeeStatus, { label: string; tone: string }> = {
  PAID: { label: "Paid in full", tone: "bg-emerald-600 text-white" },
  PARTIAL: { label: "Part paid", tone: "bg-amber-400 text-navy-950" },
  UNPAID: { label: "Unpaid", tone: "border border-navy-800/30 text-navy-800" },
};

export function FeeProgressBar({
  paid,
  total,
  status,
  currency = "₦",
  className = "",
}: FeeProgressBarProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, margin: "0px 0px -10% 0px" });
  const fmt = useMemo(() => new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }), []);

  const pct = total > 0 ? Math.min(1, Math.max(0, paid / total)) : 0;
  const fill = useMotionValue(0);
  const amount = useMotionValue(0);
  const amountRef = useRef<HTMLSpanElement>(null);
  const initialAmount = useRef(`${currency}${fmt.format(paid)}`);
  const played = useRef(false);

  useEffect(
    () =>
      amount.on("change", (v) => {
        if (amountRef.current)
          amountRef.current.textContent = `${currency}${fmt.format(Math.round(v))}`;
      }),
    [amount, currency, fmt],
  );

  // Plays exactly once. Any later change to `paid` is applied instantly:
  // fees must never re-animate.
  useEffect(() => {
    if (!inView) return;
    if (played.current || reduce) {
      fill.set(pct);
      amount.set(paid);
      return;
    }
    const markPlayed = () => {
      played.current = true;
    };
    const a = animate(fill, pct, { duration: 1.2, ease: EASE, onComplete: markPlayed });
    const b = animate(amount, paid, { duration: 1.2, ease: "easeOut" });
    return () => {
      a.stop();
      b.stop();
    };
  }, [inView, pct, paid, reduce, fill, amount]);

  // One-time burst when status flips to PAID (not when it loads as PAID).
  const prevStatus = useRef(status);
  const [burst, setBurst] = useState(false);
  useEffect(() => {
    const flipped = prevStatus.current !== "PAID" && status === "PAID";
    prevStatus.current = status;
    if (!flipped || reduce) {
      setBurst(false);
      return;
    }
    setBurst(true);
    const t = window.setTimeout(() => setBurst(false), 700);
    return () => window.clearTimeout(t);
  }, [status, reduce]);

  const balance = Math.max(0, total - paid);
  const badge = BADGE[status];

  return (
    <div
      ref={rootRef}
      className={`rounded-[12px] bg-ivory-100 p-5 text-navy-950 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-navy-800">Fees paid</p>
          <p className="font-serif text-3xl">
            <span ref={amountRef} className="tabular-nums">
              {initialAmount.current}
            </span>{" "}
            <span className="font-sans text-base text-navy-800">
              of {currency}
              {fmt.format(total)}
            </span>
          </p>
        </div>

        <span className="relative">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${badge.tone}`}
          >
            {badge.label}
          </span>

          {burst && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0"
            >
              {DOTS.map((d, i) => (
                <motion.span
                  key={i}
                  className={`absolute -ml-1 -mt-1 block h-2 w-2 rounded-full ${
                    d.gold ? "bg-gold-500" : "bg-gold-300"
                  }`}
                  initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
                  animate={{ x: d.x, y: d.y, scale: [0.4, 1, 0.6], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              ))}
            </span>
          )}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Fees paid"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct * 100)}
        className="mt-4 h-3 overflow-hidden rounded-full bg-navy-950/10"
      >
        {/* scaleX from the left edge: transform-only fill */}
        <motion.div
          className="h-full w-full origin-left bg-linear-to-r from-gold-500 to-gold-300"
          style={{ scaleX: fill }}
        />
      </div>

      <p className="mt-3 text-sm text-navy-800">
        {balance > 0
          ? `${currency}${fmt.format(balance)} outstanding`
          : "No balance outstanding"}
      </p>
    </div>
  );
}
