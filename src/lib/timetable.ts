/**
 * The school's bell schedule and the one place that turns stored TimetableSlot
 * rows into the week the portal renders. Breaks are inserted automatically so a
 * saved timetable always reads like a real day.
 */
import type { Period, Weekday } from "@/components/portal/TodayTimetable";

export const DAY_KEYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

/** Lesson periods 1–8. Slots only ever store these; breaks are derived. */
export const BELL: Array<{ period: number; start: string; end: string }> = [
  { period: 1, start: "08:00", end: "08:45" },
  { period: 2, start: "08:45", end: "09:30" },
  { period: 3, start: "09:30", end: "10:15" },
  { period: 4, start: "10:45", end: "11:30" },
  { period: 5, start: "11:30", end: "12:15" },
  { period: 6, start: "13:00", end: "13:45" },
  { period: 7, start: "13:45", end: "14:30" },
  { period: 8, start: "14:30", end: "15:15" },
];

export const PERIODS = BELL.map((b) => b.period);

const BREAKS = [
  { start: "10:15", end: "10:45", subject: "Break" },
  { start: "12:15", end: "13:00", subject: "Lunch" },
];

export type WeekSlot = {
  day: number;
  period: number;
  subjectName: string;
  teacher?: string | null;
};

/** Group lessons by weekday, add breaks, and sort each day by start time. */
export function buildWeek(slots: WeekSlot[]): Partial<Record<Weekday, Period[]>> {
  const byDay = new Map<Weekday, Period[]>();

  for (const s of slots) {
    const key = DAY_KEYS[s.day - 1];
    const times = BELL.find((b) => b.period === s.period);
    if (!key || !times || !s.subjectName) continue;
    const list = byDay.get(key) ?? [];
    list.push({
      id: `${key}-${s.period}`,
      start: times.start,
      end: times.end,
      subject: s.subjectName,
      teacher: s.teacher ?? undefined,
    });
    byDay.set(key, list);
  }

  for (const [key, list] of byDay) {
    const withBreaks: Period[] = [...list];
    if (list.some((p) => p.start < BREAKS[0].end)) {
      withBreaks.push({
        id: `${key}-break`,
        start: BREAKS[0].start,
        end: BREAKS[0].end,
        subject: BREAKS[0].subject,
        kind: "break",
      });
    }
    if (list.some((p) => p.start < BREAKS[1].end)) {
      withBreaks.push({
        id: `${key}-lunch`,
        start: BREAKS[1].start,
        end: BREAKS[1].end,
        subject: BREAKS[1].subject,
        kind: "break",
      });
    }
    withBreaks.sort((a, b) => a.start.localeCompare(b.start));
    byDay.set(key, withBreaks);
  }

  return Object.fromEntries(byDay) as Partial<Record<Weekday, Period[]>>;
}
