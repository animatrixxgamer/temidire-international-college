"use client";

import { useRef, useState } from "react";
import { ScoreSheet, type ScoreResult } from "@/components/dashboard/ScoreSheet";
import { saveScores } from "@/app/admin/actions";

type Status = "idle" | "saving" | "saved" | "error";

type Props = {
  classroomId: string;
  subjectId: string;
  session: string;
  term: number;
  students: Array<{ id: string; name: string }>;
  initial?: Record<string, { ca?: number | null; exam?: number | null }>;
};

export default function ScorePanel({
  classroomId,
  subjectId,
  session,
  term,
  students,
  initial,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<number | undefined>(undefined);
  const queue = useRef(new Map<string, { studentId: string; ca: number; exam: number }>());

  const handleChange = (studentId: string, result: ScoreResult) => {
    if (result.total === null) return; // both fields cleared — nothing to store
    queue.current.set(studentId, {
      studentId,
      ca: result.ca ?? 0,
      exam: result.exam ?? 0,
    });
    setStatus("saving");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const entries = Array.from(queue.current.values());
      queue.current.clear();
      if (!entries.length) return;
      try {
        const res = await saveScores({ classroomId, subjectId, session, term, entries });
        setStatus(res?.ok ? "saved" : "error");
      } catch {
        setStatus("error");
      }
    }, 600);
  };

  return (
    <div className="space-y-3">
      <ScoreSheet students={students} initial={initial} onChange={handleChange} />
      <p className="text-sm text-ivory-100/50" aria-live="polite">
        {status === "saving" && "Saving…"}
        {status === "saved" && "Saved to the school record."}
        {status === "error" && "Couldn’t save — your changes are still on screen, try again."}
        {status === "idle" && "Marks are saved to the school record as you type."}
      </p>
    </div>
  );
}
