/** WAEC grading — shared by the score sheet UI and the server actions that persist it. */

export type Grade = { code: string; min: number; remark: string };

export const WAEC_GRADES: Grade[] = [
  { code: "A1", min: 75, remark: "Excellent" },
  { code: "B2", min: 70, remark: "Very good" },
  { code: "B3", min: 65, remark: "Good" },
  { code: "C4", min: 60, remark: "Credit" },
  { code: "C5", min: 55, remark: "Credit" },
  { code: "C6", min: 50, remark: "Credit" },
  { code: "D7", min: 45, remark: "Pass" },
  { code: "E8", min: 40, remark: "Pass" },
  { code: "F9", min: 0, remark: "Fail" },
];

export function gradeFor(total: number): Grade {
  return WAEC_GRADES.find((g) => total >= g.min) ?? WAEC_GRADES[WAEC_GRADES.length - 1];
}
