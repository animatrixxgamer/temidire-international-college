"use client";

import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

export type Period = {
  id: string;
  /** 24-hour "HH:MM", Africa/Lagos time */
  start: string;
  end: string;
  subject: string;
  teacher?: string;
  room?: string;
  kind?: "lesson" | "break";
};

type TodayTimetableProps = {
  week: Partial<Record<Weekday, Period[]>>;
  /** Fixed time for previews and tests. Omit in production. */
  now?: Date;
  className?: string;
};

const DAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_NAMES: Record<Weekday, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
};

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function lagosClock(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: get("weekday"),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function closedDetail(
  day: string,
  minutes: number,
  week: TodayTimetableProps["week"],
) {
  const todays = DAYS.includes(day as Weekday) ? week[day as Weekday] ?? [] : [];
  if (todays.length > 0 && minutes < toMin(todays[0].start)) {
    return `Lessons start at ${todays[0].start} today.`;
  }
  const startIndex = DAYS.indexOf(day as Weekday); // -1 on weekends → begin at Monday
  for (let i = 1; i <= DAYS.length; i++) {
    const next = DAYS[(startIndex + i + DAYS.length) % DAYS.length];
    const periods = week[next];
    if (periods && periods.length > 0) {
      return `Lessons resume ${DAY_NAMES[next]} at ${periods[0].start}.`;
    }
  }
  return "No lessons are scheduled.";
}

export function TodayTimetable({ week, now, className = "" }: TodayTimetableProps) {
  const reduce = useReducedMotion();
  const [clock, setClock] = useState<Date | null>(now ?? null);

  // Clock starts null so server and client markup match; ticks every 30s afterwards.
  useEffect(() => {
    if (now) {
      setClock(now);
      return;
    }
    const tick = () => setClock(new Date());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [now]);

  if (!clock) {
    return (
      <div
        className={`min-h-48 rounded-[12px] bg-navy-950 ${className}`}
        aria-busy="true"
      />
    );
  }

  const { day, minutes } = lagosClock(clock);
  const periods = DAYS.includes(day as Weekday) ? week[day as Weekday] ?? [] : [];
  const isOpen =
    periods.length > 0 &&
    minutes >= toMin(periods[0].start) &&
    minutes < toMin(periods[periods.length - 1].end);

  if (!isOpen) {
    return (
      <motion.section
        className={`rounded-[12px] bg-navy-950 px-6 py-10 text-center ${className}`}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <h3 className="font-serif text-2xl text-ivory-100">School closed</h3>
        <span className="mx-auto mt-3 block h-px w-12 bg-gold-500" aria-hidden />
        <p className="mt-3 text-sm text-ivory-100/70">
          {closedDetail(day, minutes, week)}
        </p>
      </motion.section>
    );
  }

  const currentId =
    periods.find((p) => minutes >= toMin(p.start) && minutes < toMin(p.end))?.id ??
    null;

  return (
    <section className={`rounded-[12px] bg-navy-950 p-2 ${className}`}>
      <LayoutGroup>
        <ul>
          {periods.map((p) => {
            const isCurrent = p.id === currentId;
            const isBreak = p.kind === "break";
            return (
              <li
                key={p.id}
                aria-current={isCurrent ? "time" : undefined}
                className="relative grid min-h-[4.5rem] grid-cols-[6.5rem_1fr_auto] items-center gap-4 px-5"
              >
                {isCurrent && (
                  <motion.div
                    layoutId="current-period"
                    aria-hidden
                    className="absolute inset-0 rounded-[6px] bg-gold-500/10"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 260, damping: 30 }
                    }
                  >
                    {/* 3px gold edge that breathes ±4% on a 4s loop */}
                    <motion.span
                      className="absolute inset-y-0 left-0 w-[3px] rounded-full bg-gold-500"
                      animate={
                        reduce
                          ? undefined
                          : { scaleY: [1, 1.04, 1], opacity: [1, 0.96, 1] }
                      }
                      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                    />
                  </motion.div>
                )}

                <span className="relative text-sm tabular-nums text-ivory-100/70">
                  {p.start}–{p.end}
                </span>

                <span className="relative">
                  <span
                    className={`block font-serif text-lg ${
                      isCurrent
                        ? "text-gold-300"
                        : isBreak
                          ? "text-ivory-100/50"
                          : "text-ivory-100"
                    }`}
                  >
                    {p.subject}
                  </span>
                  {p.teacher && (
                    <span className="block text-sm text-ivory-100/60">{p.teacher}</span>
                  )}
                </span>

                <span className="relative text-sm text-ivory-100/60">{p.room}</span>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>
    </section>
  );
}
