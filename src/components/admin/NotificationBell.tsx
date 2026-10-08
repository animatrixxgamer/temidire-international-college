"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

export type BellNotification = {
  id: string;
  title: string;
  detail?: string;
  time: string;
};

type NotificationBellProps = {
  unreadCount: number;
  items: BellNotification[];
  /** Called when the dropdown opens (a good place to mark items as read). */
  onOpen?: () => void;
  onItemSelect?: (id: string) => void;
  className?: string;
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE } },
};

export function NotificationBell({
  unreadCount,
  items,
  onOpen,
  onItemSelect,
  className = "",
}: NotificationBellProps) {
  const reduce = useReducedMotion();
  const wiggle = useAnimationControls();
  const [open, setOpen] = useState(false);
  const [pulseRun, setPulseRun] = useState(0);
  const previous = useRef(unreadCount);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Wiggle (±12°, three swings) and re-run the dot pulse only when the count goes up.
  useEffect(() => {
    if (unreadCount > previous.current) {
      setPulseRun((n) => n + 1);
      if (!reduce) {
        void wiggle.start({
          rotate: [0, 12, -12, 12, -12, 12, -12, 0],
          transition: { duration: 0.9, ease: "easeInOut" },
        });
      }
    }
    previous.current = unreadCount;
  }, [unreadCount, reduce, wiggle]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) onOpen?.();
  };

  const label =
    unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : "Notifications, none unread";

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        className="relative rounded-full p-2.5 text-ivory-100 transition-colors hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
      >
        <motion.svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={wiggle}
          style={{ transformOrigin: "50% 15%" }}
          aria-hidden
        >
          <path d="M12 3a6 6 0 0 0-6 6v3.2c0 .6-.2 1.2-.6 1.7L4 15.5h16l-1.4-1.6a2.6 2.6 0 0 1-.6-1.7V9a6 6 0 0 0-6-6Z" />
          <path d="M10 18.5a2 2 0 0 0 4 0" />
        </motion.svg>

        {unreadCount > 0 && (
          <span className="pointer-events-none absolute right-2 top-2 block h-2.5 w-2.5">
            {!reduce && (
              <motion.span
                key={pulseRun}
                className="absolute inset-0 rounded-full bg-gold-500"
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 2.4, opacity: 0 }}
                // repeat: 2 → three pulses in total, then it stops for good.
                transition={{ duration: 0.8, repeat: 2, ease: "easeOut" }}
              />
            )}
            <span className="absolute inset-0 rounded-full bg-gold-500" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-label="Notifications"
            className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-[12px] bg-ivory-100 p-2 text-navy-950 shadow-xl shadow-navy-950/30"
            style={{ transformOrigin: "top right" }}
            initial={reduce ? false : { opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.22, ease: EASE }
            }
          >
            <p className="px-3 pb-1 pt-2 font-serif text-lg">Notifications</p>

            {items.length === 0 ? (
              <p className="px-3 pb-3 pt-1 text-sm text-navy-800">
                You are all caught up.
              </p>
            ) : (
              <motion.ul
                variants={list}
                initial={reduce ? false : "hidden"}
                animate="show"
                className="max-h-80 overflow-y-auto"
              >
                {items.map((item) => (
                  <motion.li key={item.id} variants={row}>
                    <button
                      type="button"
                      onClick={() => {
                        onItemSelect?.(item.id);
                        setOpen(false);
                      }}
                      className="block w-full rounded-[6px] px-3 py-2.5 text-left transition-colors hover:bg-navy-950/5 focus-visible:outline-2 focus-visible:outline-gold-500"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="shrink-0 text-xs text-navy-800">
                          {item.time}
                        </span>
                      </span>
                      {item.detail && (
                        <span className="mt-0.5 block text-sm text-navy-800">
                          {item.detail}
                        </span>
                      )}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
