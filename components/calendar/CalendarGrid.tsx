import type { CoverageStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/lib/types";
import type { MonthGridDay } from "@/lib/calendar";

const ITEM_STYLES: Record<CalendarItem["kind"], string> = {
  deadline: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  coverage: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  newsroom: "bg-navy/5 text-navy",
};

const COVERAGE_STATUS_DOT_STYLES: Record<CoverageStatus, string> = {
  unassigned: "bg-zinc-400",
  assigned: "bg-amber-500",
  covered: "bg-emerald-500",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const EVENT_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const MAX_VISIBLE_ITEMS_PER_DAY = 3;

/** Only events (not deadlines) carry a time — keeps the grid to title-only for deadlines. */
function formatItemLabel(item: CalendarItem) {
  if (item.kind === "deadline") return item.title;
  return `${item.title} \u00b7 ${EVENT_TIME_FORMATTER.format(new Date(item.startAt))}`;
}

export function CalendarGrid({
  visibleMonth,
  days,
  itemsByDate,
  selectedDateKey,
  onSelectDate,
  onSelectEvent,
  onPrevMonth,
  onNextMonth,
  onToday,
}: {
  visibleMonth: Date;
  days: MonthGridDay[];
  itemsByDate: Map<string, CalendarItem[]>;
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
  onSelectEvent: (eventId: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <p className="font-serif text-lg font-semibold text-foreground">
          {MONTH_YEAR_FORMATTER.format(visibleMonth)}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-foreground/70 hover:bg-background/60"
          >
            &lt; Previous
          </button>
          <button
            type="button"
            onClick={onToday}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-foreground/70 hover:bg-background/60"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-foreground/70 hover:bg-background/60"
          >
            Next &gt;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border text-center text-xs font-medium uppercase tracking-wide text-foreground/40">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-2 py-2">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const items = itemsByDate.get(day.dateKey) ?? [];
          const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS_PER_DAY);
          const overflowCount = items.length - visibleItems.length;
          const isSelected = day.dateKey === selectedDateKey;

          return (
            <div
              key={day.dateKey}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDate(day.dateKey)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectDate(day.dateKey);
                }
              }}
              className={cn(
                "flex min-h-24 cursor-pointer flex-col items-stretch gap-1 border-b border-r border-border px-1.5 py-1.5 text-left transition-colors hover:bg-background/60 focus:outline-none focus-visible:bg-background/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy",
                !day.isCurrentMonth && "bg-background/40 text-foreground/30",
                isSelected && "ring-2 ring-inset ring-navy"
              )}
            >
              <span
                className={cn(
                  "self-end text-xs font-semibold",
                  day.isToday &&
                    "flex h-5 w-5 items-center justify-center rounded-full bg-navy text-navy-foreground"
                )}
              >
                {day.date.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {visibleItems.map((item) =>
                  item.kind === "deadline" ? (
                    <span
                      key={item.id}
                      className={cn(
                        "truncate rounded px-1 py-0.5 text-[10px] font-medium",
                        ITEM_STYLES[item.kind]
                      )}
                    >
                      {formatItemLabel(item)}
                    </span>
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      title={formatItemLabel(item)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(item.eventId);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] font-medium transition-colors hover:ring-1 hover:ring-inset hover:ring-navy/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-navy",
                        ITEM_STYLES[item.kind]
                      )}
                    >
                      {item.kind === "coverage" ? (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            COVERAGE_STATUS_DOT_STYLES[item.coverageStatus]
                          )}
                        />
                      ) : null}
                      <span className="truncate">{formatItemLabel(item)}</span>
                    </button>
                  )
                )}
                {overflowCount > 0 ? (
                  <span className="text-[10px] font-medium text-foreground/40">
                    +{overflowCount} more
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
