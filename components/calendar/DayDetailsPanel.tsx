"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDueDate } from "@/lib/format";
import type { CoverageStatus } from "@/lib/supabase/types";
import type { CalendarItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const GROUP_LABELS: Record<"deadline" | "coverage" | "newsroom", string> = {
  deadline: "Deadlines",
  coverage: "Coverage",
  newsroom: "Newsroom",
};

const COVERAGE_STATUS_LABELS: Record<CoverageStatus, string> = {
  unassigned: "Unassigned",
  assigned: "Assigned",
  covered: "Covered",
};

const COVERAGE_STATUS_STYLES: Record<CoverageStatus, string> = {
  unassigned: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  assigned: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  covered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
};

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

/** Parses a "YYYY-MM-DD" key without shifting to a different local day. */
function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatEventTime(startAt: string, endAt: string | null) {
  const start = TIME_FORMATTER.format(new Date(startAt));
  if (!endAt) return start;
  return `${start} \u2013 ${TIME_FORMATTER.format(new Date(endAt))}`;
}

export function DayDetailsPanel({
  dateKey,
  items,
  isStaff,
  onSelectEvent,
  onEditEvent,
}: {
  dateKey: string;
  items: CalendarItem[];
  isStaff: boolean;
  onSelectEvent: (eventId: string) => void;
  onEditEvent: (eventId: string) => void;
}) {
  const router = useRouter();
  const grouped = {
    deadline: items.filter((item) => item.kind === "deadline"),
    coverage: items.filter((item) => item.kind === "coverage"),
    newsroom: items.filter((item) => item.kind === "newsroom"),
  };

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <p className="font-serif text-base font-semibold text-foreground">
          {DAY_LABEL_FORMATTER.format(parseDateKey(dateKey))}
        </p>
      </div>
      <div className="flex flex-col gap-5 px-5 py-4">
        {items.length === 0 ? (
          <p className="text-sm text-foreground/50">Nothing scheduled this day.</p>
        ) : null}

        {(["deadline", "coverage", "newsroom"] as const).map((kind) =>
          grouped[kind].length > 0 ? (
            <div key={kind} className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
                {GROUP_LABELS[kind]}
              </p>
              <ul className="flex flex-col gap-2">
                {grouped[kind].map((item) =>
                  item.kind === "deadline" ? (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`/stories/${item.storyId}`)}
                        className="flex w-full cursor-pointer flex-col gap-1 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:bg-background/60 focus:outline-none focus-visible:bg-background/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy"
                      >
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        <span className="flex flex-wrap items-center gap-2 text-xs text-foreground/50">
                          <span>{item.section}</span>
                          <span>&middot;</span>
                          <span>Due {formatDueDate(item.date)}</span>
                          <StatusBadge status={item.status} />
                        </span>
                      </button>
                    </li>
                  ) : (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-2 rounded-lg border border-border px-3 py-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectEvent(item.eventId)}
                        className="-mx-1 -my-0.5 flex min-w-0 flex-1 cursor-pointer flex-col gap-1.5 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-background/60 focus:outline-none focus-visible:bg-background/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy"
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{item.title}</span>
                          {item.kind === "coverage" ? (
                            <span
                              className={cn(
                                "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
                                COVERAGE_STATUS_STYLES[item.coverageStatus]
                              )}
                            >
                              {COVERAGE_STATUS_LABELS[item.coverageStatus]}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-xs text-foreground/50">
                          {formatEventTime(item.startAt, item.endAt)}
                          {item.location ? ` \u00b7 ${item.location}` : ""}
                        </span>
                        {item.kind === "coverage" && item.assignees.length > 0 ? (
                          <span className="text-xs text-foreground/50">
                            Assigned to {item.assignees.map((a) => a.name).join(", ")}
                          </span>
                        ) : null}
                        {item.description ? (
                          <p className="text-xs text-foreground/60">{item.description}</p>
                        ) : null}
                      </button>
                      {isStaff ? (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => onEditEvent(item.eventId)}
                        >
                          Edit
                        </Button>
                      ) : null}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
