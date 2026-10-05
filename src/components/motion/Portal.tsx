"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";

/* Small, calm motion for portals: it should confirm actions, not perform. */

// 1. Sidebar/tab nav with a gliding indicator
export function PortalTabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (t: string) => void }) {
  return (
    <nav aria-label="Portal" className="flex flex-wrap gap-1 rounded-full bg-navy-800 p-1">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          aria-current={t === value ? "page" : undefined}
          className="relative rounded-full px-5 py-2 text-sm text-ivory-100"
        >
          {t === value && (
            <motion.span
              layoutId="tab"
              className="absolute inset-0 rounded-full bg-gold-500"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <span className={`relative ${t === value ? "font-semibold text-navy-950" : ""}`}>{t}</span>
        </button>
      ))}
    </nav>
  );
}

// 2. Progress ring (attendance %, fees paid %)
export function ProgressRing({ value, label, size = 96 }: { value: number; label: string; size?: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) return setN(value);
    const c = animate(0, value, { duration: 1.2, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [value, reduce]);
  const r = size / 2 - 6;
  const C = 2 * Math.PI * r;
  return (
    <figure className="text-center">
      <svg width={size} height={size} role="img" aria-label={`${label}: ${value}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F5EFE0" strokeOpacity=".15" strokeWidth="6" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#C9A24B"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: reduce ? C * (1 - value / 100) : C }}
          animate={{ strokeDashoffset: C * (1 - value / 100) }}
          transition={{ duration: reduce ? 0 : 1.2, ease: "easeOut" }}
          style={{ rotate: -90, transformOrigin: "50% 50%" }}
        />
        <text x="50%" y="50%" dy=".35em" textAnchor="middle" fill="currentColor" fontSize="18" className="tabular">
          {n}%
        </text>
      </svg>
      <figcaption className="mt-1 text-sm text-ivory-100/70">{label}</figcaption>
    </figure>
  );
}

// 3. Skeleton → content swap
export function SkeletonSwap({ loading, rows = 4, children }: { loading: boolean; rows?: number; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {loading ? (
        <motion.div key="s" exit={{ opacity: 0 }} className="space-y-3" aria-busy="true">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="relative h-10 overflow-hidden rounded-lg bg-navy-800">
              <motion.div
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-ivory-100/10 to-transparent"
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div key="c" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 4. Staggered list rows (announcements, assignments)
export function StaggerList<T extends { id: string | number }>({
  items,
  render,
}: {
  items: T[];
  render: (it: T) => ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.ul
      initial="h"
      animate="s"
      variants={{ s: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
      className="divide-y divide-ivory-100/10"
    >
      <AnimatePresence initial={false}>
        {items.map((it) => (
          <motion.li
            key={it.id}
            layout={!reduce}
            variants={{ h: { opacity: 0, x: -12 }, s: { opacity: 1, x: 0 } }}
            exit={{ opacity: 0, height: 0 }}
            className="py-3"
          >
            {render(it)}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}

// 5. Toasts: confirm an action in the same words as the button
const ToastCtx = createContext<(text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Array<{ id: number; text: string }>>([]);
  const push = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, text }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-[9500] flex flex-col gap-2">
        <AnimatePresence>
          {list.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="rounded-xl border border-gold-500/40 bg-navy-900 px-5 py-3 shadow-lg"
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
