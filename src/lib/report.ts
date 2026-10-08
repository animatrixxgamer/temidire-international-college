/**
 * Report-card maths, shared by the admin reports pages and the student portal.
 * Pure functions only (no Prisma) so the same numbers are used everywhere a
 * result is shown. Grades come from the one WAEC scale in `@/lib/grading`.
 */
import { gradeFor, type Grade } from "./grading";

export type ScoreRow = {
  subjectId: string;
  code: string;
  name: string;
  ca: number;
  exam: number;
  total: number;
  grade: string;
};

export type StudentReport = {
  studentId: string;
  name: string;
  subjects: ScoreRow[];
  /** Sum of every subject total. */
  totalScore: number;
  /** Number of subjects the pupil has a mark for. */
  subjectCount: number;
  /** Mean of the subject totals, rounded to one decimal. */
  average: number;
  /** Grade for the average (not the sum). */
  grade: Grade;
  /** Class position, 1 = best. 0 when unranked (no marks). */
  position: number;
  /** How many pupils share this position (for "2nd="). */
  tied: number;
};

export const round1 = (n: number) => Math.round(n * 10) / 10;

/** A pupil's own result from their subject rows. */
export function summarise(
  studentId: string,
  name: string,
  subjects: ScoreRow[],
): Omit<StudentReport, "position" | "tied"> {
  const totalScore = subjects.reduce((sum, s) => sum + s.total, 0);
  const subjectCount = subjects.length;
  const average = subjectCount ? round1(totalScore / subjectCount) : 0;
  return {
    studentId,
    name,
    subjects: [...subjects].sort((a, b) => a.name.localeCompare(b.name)),
    totalScore: round1(totalScore),
    subjectCount,
    average,
    grade: gradeFor(average),
  };
}

/**
 * Build a whole class's reports with positions. Pupils are ranked on their
 * average (highest first); equal averages share a position ("2nd="), and the
 * next distinct average skips the tied ranks — the usual competition ranking.
 */
export function buildClassReport(
  pupils: Array<{ studentId: string; name: string; subjects: ScoreRow[] }>,
): StudentReport[] {
  const base = pupils.map((p) => summarise(p.studentId, p.name, p.subjects));

  const ranked = base.filter((r) => r.subjectCount > 0);
  const byAverage = [...ranked].sort((a, b) => b.average - a.average);

  const positions = new Map<string, { position: number; tied: number }>();
  let lastAverage: number | null = null;
  let lastPosition = 0;
  byAverage.forEach((r, index) => {
    const position = r.average === lastAverage ? lastPosition : index + 1;
    const tied = byAverage.filter((o) => o.average === r.average).length;
    positions.set(r.studentId, { position, tied });
    lastAverage = r.average;
    lastPosition = position;
  });

  return base
    .map((r) => ({ ...r, ...(positions.get(r.studentId) ?? { position: 0, tied: 0 }) }))
    .sort((a, b) => {
      if (a.position && b.position) return a.position - b.position;
      if (a.position) return -1;
      if (b.position) return 1;
      return a.name.localeCompare(b.name);
    });
}

/** "1st", "2nd", "3rd", "4th"… */
export function ordinal(n: number): string {
  if (!n) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

/** One-line remark for a pupil's average, for the report footer. */
export function remarkFor(average: number): string {
  if (!average) return "No marks recorded this term.";
  const g = gradeFor(average);
  switch (g.code[0]) {
    case "A":
      return "An excellent result — keep it up.";
    case "B":
      return "A very good result. Aim for the top band next term.";
    case "C":
      return "A solid, creditable result with room to push higher.";
    case "D":
      return "A pass. More consistent revision will lift this.";
    case "E":
      return "A weak pass — extra support is needed.";
    default:
      return "A fail this term. Please meet the class teacher.";
  }
}

/** Count PRESENT / ABSENT / LATE marks for a pupil's attendance summary. */
export function attendanceTally(records: Array<{ status: string }>) {
  let present = 0;
  let absent = 0;
  let late = 0;
  for (const r of records) {
    if (r.status === "PRESENT") present++;
    else if (r.status === "ABSENT") absent++;
    else if (r.status === "LATE") late++;
  }
  return { present, absent, late, total: records.length };
}
