"use client";

import { useState } from "react";
import { saveTimetable } from "@/app/admin/actions";
import { BELL, DAY_KEYS } from "@/lib/timetable";

type Status = "idle" | "saving" | "saved" | "error";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetableEditor({
  classroomId,
  subjects,
  initial,
}: {
  classroomId: string;
  subjects: Array<{ id: string; code: string; name: string }>;
  initial: Record<string, string>;
}) {
  const [cells, setCells] = useState<Record<string, string>>(initial);
  const [status, setStatus] = useState<Status>("idle");

  const key = (day: number, period: number) => `${day}-${period}`;

  const set = (day: number, period: number, subjectId: string) => {
    setCells((prev) => {
      const next = { ...prev };
      if (subjectId) next[key(day, period)] = subjectId;
      else delete next[key(day, period)];
      return next;
    });
    setStatus("idle");
  };

  const save = async () => {
    setStatus("saving");
    const slots = Object.entries(cells).map(([k, subjectId]) => {
      const [day, period] = k.split("-").map(Number);
      return { day, period, subjectId };
    });
    try {
      const res = await saveTimetable({ classroomId, slots });
      setStatus(res?.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  };

  const placed = Object.keys(cells).length;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-ivory-100/10 bg-navy-800/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-ivory-100/40">
            <tr>
              <th className="px-3 py-3">Period</th>
              {DAY_NAMES.map((d) => (
                <th key={d} className="px-3 py-3">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BELL.map((b) => (
              <tr key={b.period} className="border-t border-ivory-100/10">
                <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-normal">
                  <span className="block text-ivory-100/80">Period {b.period}</span>
                  <span className="text-xs tabular-nums text-ivory-100/40">
                    {b.start}–{b.end}
                  </span>
                </th>
                {DAY_KEYS.map((_, i) => {
                  const day = i + 1;
                  const value = cells[key(day, b.period)] ?? "";
                  return (
                    <td key={day} className="px-2 py-2">
                      <select
                        aria-label={`${DAY_NAMES[i]} period ${b.period}`}
                        value={value}
                        onChange={(e) => set(day, b.period, e.target.value)}
                        className="w-full rounded-md border border-ivory-100/20 bg-navy-950 px-2 py-1.5 text-xs"
                      >
                        <option value="">— free —</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code} · {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={status === "saving"}
          className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save timetable"}
        </button>
        <p className="text-sm text-ivory-100/50" aria-live="polite">
          {placed} period{placed === 1 ? "" : "s"} placed ·{" "}
          {status === "saving" && "saving…"}
          {status === "saved" && "saved — pupils see it on their portal."}
          {status === "error" && "couldn’t save, try again."}
          {status === "idle" && "empty cells are free periods."}
        </p>
      </div>
    </div>
  );
}
