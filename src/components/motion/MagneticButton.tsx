"use client";
import { useRef, type ReactNode, type ButtonHTMLAttributes } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onAnimationEnd" | "onDragStart" | "onDrag" | "onDragEnd"> & {
  children: ReactNode;
  strength?: number;
};

export default function MagneticButton({ children, strength = 0.35, ...props }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 15, mass: 0.4 });
  const y = useSpring(my, { stiffness: 200, damping: 15, mass: 0.4 });

  const move = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      style={{ x, y }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
      initial="rest"
      whileHover="hover"
      className="relative overflow-hidden rounded-full bg-gradient-to-b from-gold-300 to-[#B58A2E] px-8 py-3.5 font-semibold text-navy-950 shadow-[0_6px_24px_rgba(201,162,75,.35)]"
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {!reduce && (
        <motion.span
          aria-hidden
          className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
          variants={{ rest: { x: "0%" }, hover: { x: "520%", transition: { duration: 0.7, ease: "easeInOut" } } }}
        />
      )}
    </motion.button>
  );
}
