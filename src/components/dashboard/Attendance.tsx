"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
export type AttendanceMark = AttendanceStatus | null;

const LAYERS: {
  status: AttendanceStatus;
  label: string;
  surface: string;
  icon: string;
}[] = [
  { status: "PRESENT", label: "Present", surface: "bg-emerald-600 text-white", icon: "M3 8.5l3.2 3.2L13 5" },
  { status: "ABSENT", label: "Absent", surface: "bg-ember-500 text-white", icon: "M4 4l8 8M12 4l-8 8" },
  { status: "LATE", label: "Late", surface: "bg-amber-400 text-navy-950", icon: "M8 4v4.5l3 1.5" },
];

export function nextMark(mark: AttendanceMark): AttendanceStatus {
  if (mark === null) return "PRESENT";
  if (mark === "PRESENT") return "ABSENT";
  if (mark === "ABSENT") return "LATE";
  return "PRESENT";
}

/* ---------- single chip ---------- */

type ChipProps = {
  name: string;
  status: AttendanceMark;
  onToggle: () => void;
};

export function AttendanceChip({ name, status, onToggle }: ChipProps) {
  const reduce = useReducedMotion();
  // Colours flip by cross-fading stacked layers, so only opacity/transform animate.
  const spring = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 26 };
  const readable = status
    ? LAYERS.find((l) => l.status === status)!.label
    : "Not marked";

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      aria-label={`${name}: ${readable}. Press to change.`}
      className="relative inline-flex h-9 w-28 items-center justify-center overflow-hidden rounded-full border border-navy-800/25 bg-ivory-100 text-sm font-medium text-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
    >
      <motion.span
        aria-hidden
        animate={{ opacity: status ? 0 : 1 }}
        transition={spring}
      >
        Mark
      </motion.span>

      {LAYERS.map((layer) => {
        const active = status === layer.status;
        return (
          <motion.span
            key={layer.status}
            aria-hidden
            className={`absolute inset-0 flex items-center justify-center gap-1.5 ${layer.surface}`}
            initial={false}
            animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.6 }}
            transition={spring}
          >
            <svg
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d={layer.icon}
                initial={false}
                animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.3, delay: active ? 0.12 : 0 }
                }
              />
            </svg>
            {layer.label}
          </motion.span>
        );
      })}
    </motion.button>
  );
}

/* ---------- live counts ---------- */

function AnimatedCount({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const initial = useRef(String(value)); // constant child so React never fights the tween

  useEffect(
    () =>
      mv.on("change", (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      }),
    [mv],
  );

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.45, ease: "easeOut" });
    return () => controls.stop();
  }, [value, reduce, mv]);

  return (
    <span ref={ref} className="tabular-nums">
      {initial.current}
    </span>
  );
}

/* ---------- register ---------- */

export type RegisterStudent = { id: string; name: string };

type RegisterProps = {
  students: RegisterStudent[];
  initialMarks?: Record<string, AttendanceMark>;
  onChange?: (marks: Record<string, AttendanceMark>) => void;
  className?: string;
};

export function AttendanceRegister({
  students,
  initialMarks = {},
  onChange,
  className = "",
}: RegisterProps) {
  const reduce = useReducedMotion();
  const [marks, setMarks] = useState<Record<string, AttendanceMark>>(initialMarks);
  const [waving, setWaving] = useState(false);
  const timers = useRef<number[]>([]);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    onChangeRef.current?.(marks);
  }, [marks]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const counts = useMemo(() => {
    const c = { PRESENT: 0, ABSENT: 0, LATE: 0, none: 0 };
    for (const s of students) {
      const m = marks[s.id] ?? null;
      if (m === null) c.none += 1;
      else c[m] += 1;
    }
    return c;
  }, [marks, students]);

  const toggle = (id: string) =>
    setMarks((m) => ({ ...m, [id]: nextMark(m[id] ?? null) }));

  const markAllPresent = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];

    if (reduce) {
      setMarks(
        Object.fromEntries(students.map((s) => [s.id, "PRESENT"])) as Record<
          string,
          AttendanceMark
        >,
      );
      return;
    }

    setWaving(true);
    students.forEach((s, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setMarks((m) => ({ ...m, [s.id]: "PRESENT" }));
          if (i === students.length - 1) setWaving(false);
        }, i * 60), // 60ms staggered wave down the list
      );
    });
  };

  const pills: { key: keyof typeof counts; label: string; dot: string }[] = [
    { key: "PRESENT", label: "Present", dot: "bg-emerald-600" },
    { key: "ABSENT", label: "Absent", dot: "bg-ember-500" },
    { key: "LATE", label: "Late", dot: "bg-amber-400" },
    { key: "none", label: "Not marked", dot: "bg-navy-800/30" },
  ];

  return (
    <section className={`rounded-[12px] bg-ivory-100 text-navy-950 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-950/10 px-4 py-3">
        <div className="flex flex-wrap gap-2" aria-live="polite">
          {pills.map((p) => (
            <span
              key={p.key}
              className="inline-flex items-center gap-2 rounded-full border border-navy-800/15 px-3 py-1 text-sm"
            >
              <span className={`h-2 w-2 rounded-full ${p.dot}`} aria-hidden />
              <AnimatedCount value={counts[p.key]} />
              <span className="text-navy-800">{p.label}</span>
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={markAllPresent}
          disabled={waving}
          className="rounded-full bg-navy-950 px-4 py-2 text-sm font-medium text-ivory-100 transition-opacity hover:bg-navy-800 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
        >
          Mark all present
        </button>
      </div>

      <ul>
        {students.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-4 border-b border-navy-950/10 px-4 py-2.5 last:border-b-0"
          >
            <span className="font-medium">{s.name}</span>
            <AttendanceChip
              name={s.name}
              status={marks[s.id] ?? null}
              onToggle={() => toggle(s.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
