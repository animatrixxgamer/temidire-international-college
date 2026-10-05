"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_CURTAIN, EASE_OUT } from "./tokens";

/* Curtain covers the page before navigation (TransitionLink) and lifts when the
   next page mounts (template). Wire-up:
   1. RootClient wraps the app in <TransitionProvider>
   2. app/template.tsx re-exports the default below
   3. Use <TransitionLink href="…"> instead of next/link for in-site nav. */

const Ctx = createContext<{ go: (href: string) => void }>({ go: () => {} });
export const useTransitionGo = () => useContext(Ctx);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [covering, setCovering] = useState(false);
  const go = (href: string) => {
    if (reduce) return router.push(href);
    setCovering(true);
    setTimeout(() => router.push(href), 650);
  };
  return (
    <Ctx.Provider value={{ go }}>
      {children}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[9000] bg-navy-900"
          style={{ originY: covering ? 1 : 0 }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: covering ? 1 : 0 }}
          transition={{ duration: 0.65, ease: EASE_CURTAIN }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gold-500" />
        </motion.div>
      )}
    </Ctx.Provider>
  );
}

export function TransitionLink({
  href,
  children,
  ...rest
}: {
  href: string;
  children: ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { go } = useContext(Ctx);
  return (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(href);
      }}
    >
      {children}
    </a>
  );
}

export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: reduce ? 0 : 0.3, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
