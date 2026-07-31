"use client";

import { useState } from "react";

interface Props {
  // ISO date strings (yyyy-mm-dd) of confirmed viewings — those days are unavailable.
  bookedDays: string[];
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// A compact month calendar that marks confirmed viewing dates in red, so students can
// see which days are already taken before requesting one. Read-only.
export function ViewingCalendar({ bookedDays }: Props) {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const booked = new Set(bookedDays);

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const shift = (delta: number) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Viewing schedule</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="rounded-lg px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
          >
            ‹
          </button>
          <span className="min-w-[7.5rem] text-center text-xs font-medium text-neutral-600">
            {monthLabel}
          </span>
          <button
            onClick={() => shift(1)}
            aria-label="Next month"
            className="rounded-lg px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day, i) => (
          <span key={i} className="text-[10px] font-medium uppercase text-neutral-400">
            {day}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />;
          const isBooked = booked.has(toKey(view.year, view.month, day));
          return (
            <span
              key={day}
              aria-label={isBooked ? `${day} — booked` : String(day)}
              className={`flex h-8 items-center justify-center rounded-lg text-xs ${
                isBooked ? "bg-rose-100 font-semibold text-rose-700 ring-1 ring-inset ring-rose-300" : "text-neutral-700"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
        <span className="inline-block h-3 w-3 rounded bg-rose-100 ring-1 ring-inset ring-rose-300" />
        Already booked for a viewing
      </p>
    </div>
  );
}
