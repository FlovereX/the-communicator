"use client";

import { useRouter } from "next/navigation";
import { formatDueDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/lib/types";

const ITEM_DOT_STYLES: Record<CalendarItem["kind"], string> = {
  deadline: "bg-amber-500",
  coverage: "bg-blue-500",
  newsroom: "bg-navy",
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

export function UpcomingList({ items }: { items: CalendarItem[] }) {
  const router = useRouter();

  function handleClick(item: CalendarItem) {
    if (item.kind === "deadline") router.push(`/stories/${item.storyId}`);
  }

  return (
    <div className="h-fit rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <p className="font-serif text-base font-semibold text-foreground">Upcoming</p>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleClick(item)}
              disabled={item.kind !== "deadline"}
              className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-background/60 disabled:cursor-default disabled:hover:bg-transparent"
            >
              <span
                aria-hidden="true"
                className={cn("h-2 w-2 shrink-0 rounded-full", ITEM_DOT_STYLES[item.kind])}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {item.title}
                </span>
                <span className="block text-xs text-foreground/50">{formatItemMeta(item)}</span>
              </span>
            </button>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="px-5 py-6 text-sm text-foreground/50">Nothing coming up.</li>
        ) : null}
      </ul>
    </div>
  );
}
