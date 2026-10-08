"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { WAEC_GRADES, gradeFor, type Grade } from "@/lib/grading";

/* WAEC grading lives in @/lib/grading so the server actions that persist scores
   can compute the same grade. Re-exported here to keep this module's API. */
export { WAEC_GRADES, gradeFor };
export type { Grade } from "@/lib/grading";

function toneFor(code: string) {
  if (code === "F9") return "bg-ember-500 text-white";
  const letter = code[0];
  if (letter === "A" || letter === "B") return "bg-emerald-600 text-white";
  if (letter === "C") return "bg-navy-800 text-ivory-100";
  return "bg-amber-400 text-navy-950";
}

/* ---------- count-up text ---------- */

function CountText({
  value,
  decimals = 0,
  className = "",
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const initial = useRef(value.toFixed(decimals));

  useEffect(
    () =>
      mv.on("change", (v) => {
        if (ref.current) ref.current.textContent = v.toFixed(decimals);
      }),
    [mv, decimals],
  );

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.6, ease: "easeOut" });
    return () => controls.stop();
  }, [value, reduce, mv]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {initial.current}
    </span>
  );
}

/* ---------- grade chip (flips on rotateX) ---------- */

function GradeChip({ grade }: { grade: Grade | null }) {
  const reduce = useReducedMotion();
  const label = grade?.code ?? "–";
  const tone = grade ? toneFor(grade.code) : "bg-navy-950/10 text-navy-800";
  const base =
    "inline-flex h-8 w-12 items-center justify-center rounded-full text-sm font-semibold tabular-nums";

  if (reduce) return <span className={`${base} ${tone}`}>{label}</span>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={label}
        className={`${base} ${tone}`}
        style={{ transformPerspective: 400 }}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: 90, opacity: 0 }}
        transition={{ duration: 0.16, ease: "easeInOut" }}
      >
        {label}
      </motion.span>
    </AnimatePresence>
  );
}

/* ---------- score input ---------- */

export type ScoreResult = {
  ca: number | null;
  exam: number | null;
  total: number | null;
  grade: Grade | null;
};

type ScoreInputProps = {
  name: string;
  caMax?: number;
  examMax?: number;
  initialCa?: number;
  initialExam?: number;
  onChange?: (result: ScoreResult) => void;
};

function clampDigits(raw: string, max: number) {
  const digits = raw.replace(/\D/g, "").slice(0, 3);
  if (digits === "") return "";
  return String(Math.min(Number(digits), max));
}

function focusNextField(current: HTMLInputElement) {
  const fields = Array.from(
    document.querySelectorAll<HTMLInputElement>("[data-score-field]"),
  );
  const i = fields.indexOf(current);
  fields[i + 1]?.focus();
}

export function ScoreInput({
  name,
  caMax = 40,
  examMax = 60,
  initialCa,
  initialExam,
  onChange,
}: ScoreInputProps) {
  const reduce = useReducedMotion();
  const [ca, setCa] = useState(initialCa === undefined ? "" : String(initialCa));
  const [exam, setExam] = useState(initialExam === undefined ? "" : String(initialExam));
  const [flash, setFlash] = useState(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const result = useMemo<ScoreResult>(() => {
    const c = ca === "" ? null : Number(ca);
    const e = exam === "" ? null : Number(exam);
    const total = c === null && e === null ? null : (c ?? 0) + (e ?? 0);
    return { ca: c, exam: e, total, grade: total === null ? null : gradeFor(total) };
  }, [ca, exam]);

  useEffect(() => {
    onChangeRef.current?.(result);
  }, [result]);

  // Flash the total gold once per change (never on first render).
  const lastTotal = useRef(result.total);
  useEffect(() => {
    if (result.total !== lastTotal.current) {
      lastTotal.current = result.total;
      setFlash((n) => n + 1);
    }
  }, [result.total]);

  const inputClass =
    "h-10 w-16 rounded-[6px] border border-navy-800/30 bg-white px-2 text-center text-base tabular-nums text-navy-950 focus:border-gold-500 focus:outline-2 focus:outline-gold-500";

  const keyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      focusNextField(e.currentTarget);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-navy-950/10 px-4 py-3 last:border-b-0">
      <span className="min-w-40 flex-1 font-medium text-navy-950">{name}</span>

      <label className="flex items-center gap-2 text-sm text-navy-800">
        CA
        <input
          data-score-field
          inputMode="numeric"
          autoComplete="off"
          value={ca}
          onChange={(e) => setCa(clampDigits(e.target.value, caMax))}
          onKeyDown={keyHandler}
          aria-label={`${name} continuous assessment, out of ${caMax}`}
          placeholder={`/${caMax}`}
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-navy-800">
        Exam
        <input
          data-score-field
          inputMode="numeric"
          autoComplete="off"
          value={exam}
          onChange={(e) => setExam(clampDigits(e.target.value, examMax))}
          onKeyDown={keyHandler}
          aria-label={`${name} exam, out of ${examMax}`}
          placeholder={`/${examMax}`}
          className={inputClass}
        />
      </label>

      <output
        aria-live="polite"
        className="relative flex h-10 w-16 items-center justify-center overflow-hidden rounded-[6px] font-serif text-xl text-navy-950"
      >
        {!reduce && flash > 0 && (
          <motion.span
            key={flash}
            aria-hidden
            className="absolute inset-0 bg-gold-300"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        )}
        <span className="relative tabular-nums">{result.total ?? "–"}</span>
      </output>

      <GradeChip grade={result.grade} />
    </div>
  );
}

/* ---------- class average + sheet ---------- */

export function ClassAverage({ value }: { value: number }) {
  return <CountText value={value} decimals={1} />;
}

export type SheetStudent = { id: string; name: string };

export function ScoreSheet({
  students,
  caMax = 40,
  examMax = 60,
  initial,
  onChange,
  className = "",
}: {
  students: SheetStudent[];
  caMax?: number;
  examMax?: number;
  /** Saved marks keyed by student id, so a sheet reopens where it was left. */
  initial?: Record<string, { ca?: number | null; exam?: number | null }>;
  /** Fired (debounced by the caller) whenever a pupil's marks change. */
  onChange?: (studentId: string, result: ScoreResult) => void;
  className?: string;
}) {
  const [totals, setTotals] = useState<Record<string, number | null>>({});
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const average = useMemo(() => {
    const values = Object.values(totals).filter((v): v is number => v !== null);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }, [totals]);

  return (
    <section className={`overflow-hidden rounded-[12px] bg-ivory-100 ${className}`}>
      <header className="flex items-center justify-between bg-navy-950 px-5 py-4">
        <span className="text-sm text-ivory-100/70">Class average</span>
        <span className="font-serif text-3xl text-gold-500">
          <ClassAverage value={average} />
        </span>
      </header>
      {students.map((s) => (
        <ScoreInput
          key={s.id}
          name={s.name}
          caMax={caMax}
          examMax={examMax}
          initialCa={initial?.[s.id]?.ca ?? undefined}
          initialExam={initial?.[s.id]?.exam ?? undefined}
          onChange={(r) => {
            setTotals((t) => (t[s.id] === r.total ? t : { ...t, [s.id]: r.total }));
            onChangeRef.current?.(s.id, r);
          }}
        />
      ))}
    </section>
  );
}
