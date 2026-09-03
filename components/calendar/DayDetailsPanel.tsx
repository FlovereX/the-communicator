"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDueDate } from "@/lib/format";
import type { CalendarItem } from "@/lib/types";

const GROUP_LABELS: Record<"deadline" | "coverage" | "newsroom", string> = {
  deadline: "Deadlines",
  coverage: "Coverage",
  newsroom: "Newsroom",
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
  onEditEvent,
}: {
  dateKey: string;
  items: CalendarItem[];
  isStaff: boolean;
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
                        className="flex w-full flex-col gap-1 rounded-lg border border-border px-3 py-2.5 text-left hover:bg-background/60"
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
                      className="flex flex-col gap-1.5 rounded-lg border border-border px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        {isStaff ? (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onEditEvent(item.eventId)}
                          >
                            Edit
                          </Button>
                        ) : null}
                      </div>
                      <span className="text-xs text-foreground/50">
                        {formatEventTime(item.startAt, item.endAt)}
                        {item.location ? ` \u00b7 ${item.location}` : ""}
                      </span>
                      {item.description ? (
                        <p className="text-xs text-foreground/60">{item.description}</p>
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
