"use client";

import { useEffect, useRef, useState } from "react";
import { AttendanceRegister, type AttendanceMark } from "@/components/dashboard/Attendance";
import { saveAttendance } from "@/app/admin/actions";

type Status = "idle" | "saving" | "saved" | "error";

type Props = {
  date: string;
  students: Array<{ id: string; name: string }>;
  initialMarks?: Record<string, AttendanceMark>;
};

const flush = (date: string, marks: Record<string, AttendanceMark>) => {
  const present = Object.fromEntries(
    Object.entries(marks).filter((m): m is [string, "PRESENT" | "ABSENT" | "LATE"] => m[1] !== null),
  );
  if (!Object.keys(present).length) return Promise.resolve({ ok: true });
  return saveAttendance({ date, marks: present });
};

export default function AttendancePanel({ date, students, initialMarks = {} }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<number | undefined>(undefined);
  const pending = useRef<Record<string, AttendanceMark> | null>(null);
  const firstRun = useRef(true);

  // Flush anything still queued if the teacher navigates away mid-debounce.
  useEffect(() => () => {
    window.clearTimeout(timer.current);
    if (pending.current) void flush(date, pending.current);
  }, [date]);

  const handleChange = (marks: Record<string, AttendanceMark>) => {
    if (firstRun.current) {
      firstRun.current = false; // the register reports its initial state on mount
      return;
    }
    pending.current = marks;
    setStatus("saving");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const queued = pending.current;
      pending.current = null;
      if (!queued) return;
      try {
        const res = await flush(date, queued);
        setStatus(res?.ok ? "saved" : "error");
      } catch {
        setStatus("error");
      }
    }, 500);
  };

  return (
    <div className="space-y-3">
      <AttendanceRegister students={students} initialMarks={initialMarks} onChange={handleChange} />
      <p className="text-sm text-ivory-100/50" aria-live="polite">
        {status === "saving" && "Saving…"}
        {status === "saved" && "Saved to the school record."}
        {status === "error" && "Couldn’t save — your changes are still on screen, try again."}
        {status === "idle" && "Marks are saved to the school record as you make them."}
      </p>
    </div>
  );
}
