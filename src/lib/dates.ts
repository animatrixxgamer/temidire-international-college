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
