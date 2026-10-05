"use client";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/components/motion/tokens";
import { whyTemidire } from "@/content/siteContent";

/** Three statements with a gold bookmark ribbon that draws down in the left margin. */
export default function WhyRibbon() {
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto max-w-3xl space-y-14">
      {whyTemidire.map((w, i) => (
        <motion.div
          key={i}
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: i * 0.1, ease: EASE_OUT }}
          className="relative pl-8"
        >
          <span aria-hidden className="absolute left-0 top-1 h-[40px] w-1 overflow-hidden rounded-full bg-gold-500/20">
            <motion.span
              className="block w-full bg-gold-500"
              initial={reduce ? false : { height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: EASE_OUT }}
            />
          </span>
          <h3 className="font-serif text-2xl md:text-3xl">{w.statement}</h3>
          <p className="mt-3 max-w-prose opacity-80">{w.body}</p>
        </motion.div>
      ))}
    </div>
  );
}
