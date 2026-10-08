/** Attendance days are stored at midday so a date never drifts across timezones. */
export const parseDay = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T12:00:00`);

/** Today in the school's timezone as YYYY-MM-DD. */
export function todayKey(timeZone = "Africa/Lagos") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export const isDayKey = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Settings keys that hold a term's first and last day. */
export const termStartKey = (term: number) => `term_${term}_start`;
export const termEndKey = (term: number) => `term_${term}_end`;

/** A Prisma date filter for a term window; empty when neither end is set. */
export function dayRange(start?: string | null, end?: string | null) {
  const range: { gte?: Date; lte?: Date } = {};
  if (isDayKey(start)) range.gte = parseDay(start);
  if (isDayKey(end)) range.lte = parseDay(end);
  return range;
}
