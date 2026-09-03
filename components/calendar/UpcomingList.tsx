"use client";

import { useRouter } from "next/navigation";
import { formatDueDate } from "@/lib/format";
import type { CoverageStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/lib/types";

const ITEM_DOT_STYLES: Record<CalendarItem["kind"], string> = {
  deadline: "bg-amber-500",
  coverage: "bg-blue-500",
  newsroom: "bg-navy",
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

const EVENT_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatItemMeta(item: CalendarItem) {
  if (item.kind === "deadline") return formatDueDate(item.date);
  return EVENT_TIME_FORMATTER.format(new Date(item.startAt));
}

export function UpcomingList({
  items,
  title = "Upcoming",
  emptyLabel = "Nothing coming up.",
  onSelectEvent,
}: {
  items: CalendarItem[];
  title?: string;
  emptyLabel?: string;
  onSelectEvent?: (eventId: string) => void;
}) {
  const router = useRouter();

  function handleClick(item: CalendarItem) {
    if (item.kind === "deadline") router.push(`/stories/${item.storyId}`);
    else onSelectEvent?.(item.eventId);
  }

  return (
    <div className="h-fit rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <p className="font-serif text-base font-semibold text-foreground">{title}</p>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleClick(item)}
              disabled={item.kind !== "deadline" && !onSelectEvent}
              className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-background/60 focus:outline-none focus-visible:bg-background/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy disabled:cursor-default disabled:hover:bg-transparent"
            >
              <span
                aria-hidden="true"
                className={cn("h-2 w-2 shrink-0 rounded-full", ITEM_DOT_STYLES[item.kind])}
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  {item.kind === "coverage" ? (
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium",
                        COVERAGE_STATUS_STYLES[item.coverageStatus]
                      )}
                    >
                      {COVERAGE_STATUS_LABELS[item.coverageStatus]}
                    </span>
                  ) : null}
                </span>
                <span className="block truncate text-xs text-foreground/50">
                  {formatItemMeta(item)}
                  {item.kind === "coverage" && item.assignees.length > 0
                    ? ` \u00b7 ${item.assignees.map((a) => a.name).join(", ")}`
                    : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="px-5 py-6 text-sm text-foreground/50">{emptyLabel}</li>
        ) : null}
      </ul>
    </div>
  );
}
