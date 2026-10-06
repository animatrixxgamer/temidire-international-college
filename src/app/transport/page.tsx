"use client";
import Link from "next/link";
import { useState } from "react";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { RouteMap, CountUp } from "@/components/motion/Extras";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { routes, naira, school } from "@/content/siteContent";

export default function TransportPage() {
  const reduce = useReducedMotion();
  const [r, setR] = useState(0);
  const route = routes[r];
  const stops = route.stops.map((name, i): [string, number, number] => [name, 40 + (i * 300) / (route.stops.length - 1), 60 + (i % 2) * 90]);

  return (
    <main className="pt-16">
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 text-center">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">School bus service</p>
          <SplitHeading text="Four routes across Ondo Town" className="mt-3 font-serif text-3xl md:text-5xl" />
          <p className="mx-auto mt-6 max-w-2xl text-ivory-100/70">
            Trained drivers, attendants on every bus, and pickup points near your home. Fees are per term, per child.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        {/* Route chips */}
        <div className="flex flex-wrap justify-center gap-1 rounded-full bg-navy-800 p-1">
          {routes.map((rt, i) => (
            <button
              key={rt.id}
              onClick={() => setR(i)}
              aria-current={i === r ? "true" : undefined}
              className="relative rounded-full px-4 py-2 text-sm"
            >
              {i === r && (
                <motion.span layoutId="route-tab" className="absolute inset-0 rounded-full bg-gold-500" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <span className={`relative ${i === r ? "font-semibold text-navy-950" : "text-ivory-100"}`}>{rt.name}</span>
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="mt-10 grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <AnimatePresence mode="wait">
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-ivory-100"
            >
              <RouteMap stops={stops} />
            </motion.div>
          </AnimatePresence>
          <div className="rounded-2xl border border-gold-500/25 bg-navy-800 p-6">
            <h2 className="font-serif text-2xl">{route.name}</h2>
            <ul className="mt-4 space-y-2 text-sm text-ivory-100/80">
              {route.stops.map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-gold-500/20 text-[10px] text-gold-500">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-ivory-100/50">Morning pickup</p>
                <p className="mt-1 font-semibold text-gold-500">{route.pickup}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ivory-100/50">Term fee</p>
                <p className="mt-1 font-serif text-2xl text-gold-500">
                  <CountUp key={route.id} to={route.termFee} prefix={"₦"} format={(n) => naira(n)} />
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-ivory-100/50">Stops and times are placeholders pending confirmation.</p>
          </div>
        </div>
      </section>

      <section className="bg-ivory-100 py-20 text-navy-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <h2 className="font-serif text-3xl">Questions about transport?</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-70">
              Call the office on {school.phone} or message us on WhatsApp — we'll confirm the nearest stop to your home.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block rounded-full bg-navy-950 px-7 py-3 font-semibold text-ivory-100"
            >
              Contact the school
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
