"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "./tokens";

type Step = { title: string; when: string; text: string };

const DEFAULT: Step[] = [
  { title: "Apply online", when: "Any time", text: "Send us a short form. We reply within two working days with dates and fees." },
  { title: "Visit", when: "Weekdays 9:00–14:00", text: "Tour the campus, sit in a lesson and meet the head of year." },
  { title: "Assessment", when: "First Saturday of the month", text: "A friendly written test and a conversation. No preparation needed." },
  { title: "Offer", when: "Within one week", text: "We send a place offer with a fee schedule and a start date." },
  { title: "Enrol", when: "Before term starts", text: "Upload documents, pay the acceptance fee and receive your portal login." },
];

// A real sequence, so numbering is meaningful here. The gold line fills step by step.
export default function AdmissionsSteps({ steps = DEFAULT }: { steps?: Step[] }) {
  const reduce = useReducedMotion();
  const [a, setA] = useState(0);
  const pct = (a / (steps.length - 1)) * 100;
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="relative">
        <div aria-hidden className="absolute left-4 right-4 top-4 h-px bg-ivory-100/20" />
        <motion.div
          aria-hidden
          className="absolute left-4 top-4 h-px bg-gold-500"
          initial={false}
          animate={{ width: `calc((100% - 2rem) * ${pct / 100})` }}
          transition={{ duration: reduce ? 0 : 0.5, ease: "easeInOut" }}
        />
        <ol className="relative flex justify-between">
          {steps.map((s, i) => (
            <li key={s.title}>
              <button
                onClick={() => setA(i)}
                aria-current={i === a ? "step" : undefined}
                className="group flex w-16 flex-col items-center gap-2 focus-visible:outline-none"
              >
                <motion.span
                  animate={{
                    backgroundColor: i <= a ? "#C9A24B" : "#0F2B57",
                    color: i <= a ? "#06122A" : "#F5EFE0",
                    scale: i === a && !reduce ? 1.2 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="grid h-8 w-8 place-items-center rounded-full border border-gold-500 text-sm font-semibold"
                >
                  {i + 1}
                </motion.span>
                <span className={`text-sm ${i === a ? "text-gold-500" : "text-ivory-100/60"}`}>{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-10 min-h-[9rem] rounded-2xl bg-navy-800 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={a}
            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="font-serif text-2xl">{steps[a].title}</h3>
            <p className="mt-1 text-sm text-gold-500">{steps[a].when}</p>
            <p className="mt-3 max-w-prose text-ivory-100/80">{steps[a].text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex justify-between">
        <button
          disabled={a === 0}
          onClick={() => setA(a - 1)}
          className="rounded-full border border-gold-500/50 px-5 py-2 disabled:opacity-30"
        >
          Back
        </button>
        <button
          disabled={a === steps.length - 1}
          onClick={() => setA(a + 1)}
          className="rounded-full bg-gold-500 px-5 py-2 font-semibold text-navy-950 disabled:opacity-30"
        >
          Next step
        </button>
      </div>
    </section>
  );
}
