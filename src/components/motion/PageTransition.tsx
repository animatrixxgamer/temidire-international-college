"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_CURTAIN, EASE_OUT } from "./tokens";

/* Curtain covers the page during navigation and lifts once the next route has
   mounted. Wire-up:
   1. RootClient wraps the app in <TransitionProvider>
   2. app/template.tsx re-exports the default below
   3. Use <TransitionLink href="…"> for in-site nav instead of a bare <a>.

   The link itself is Next's <Link>, so the App Router owns the navigation
   (prefetch, RSC fetch, scroll reset, history) — we only raise/lower the
   curtain around it. The curtain MUST be reset on every route change, otherwise
   it stays down over the finished page and the only way out is a hard refresh. */

const Ctx = createContext<{ cover: () => void }>({ cover: () => {} });
export const useTransitionGo = () => useContext(Ctx);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [covering, setCovering] = useState(false);
  const seenPath = useRef(pathname);

  /* Lift the curtain as soon as the destination route has mounted (its own
     fade-in has started by then), so the screen is never left covered. */
  useEffect(() => {
    if (seenPath.current === pathname) return; // route hasn't changed yet
    seenPath.current = pathname;
    const lift = window.setTimeout(() => setCovering(false), 350);
    return () => window.clearTimeout(lift);
  }, [pathname]);

  /* Safety net: if a navigation never lands (redirect back to the same route,
     failed fetch), lift anyway rather than leaving a blank navy screen. */
  useEffect(() => {
    if (!covering) return;
    const t = window.setTimeout(() => setCovering(false), 3000);
    return () => window.clearTimeout(t);
  }, [covering]);

  const cover = useCallback(() => {
    if (reduce) return;
    setCovering(true);
  }, [reduce]);

  return (
    <Ctx.Provider value={{ cover }}>
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
  onClick,
  ...rest
}: {
  href: string;
  children: ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { cover } = useContext(Ctx);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        // Let the browser/Next handle modified clicks and non-primary buttons.
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        // Same-route (hash/scroll) links and reduced motion: no page swap to
        // hide, so don't cover — Next still scrolls to the anchor.
        const target = href.split(/[?#]/)[0];
        if (reduce || target === pathname) return;
        cover();
      }}
    >
      {children}
    </Link>
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
