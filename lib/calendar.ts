import type { CalendarEvent, CalendarItem, Story } from "./types";

/** "YYYY-MM-DD" for a local Date, matching the raw format of story.dueDate. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Derives "deadline" calendar items from stories — skips Published stories and stories with no deadline set. */
export function deriveDeadlineItems(stories: Story[]): CalendarItem[] {
  return stories
    .filter(
      (story): story is Story & { dueDate: string } =>
        story.status !== "Published" && story.dueDate !== null
    )
    .map((story) => ({
      kind: "deadline" as const,
      id: `deadline-${story.id}`,
      date: story.dueDate,
      storyId: story.id,
      title: `Deadline: ${story.title}`,
      section: story.section,
      status: story.status,
    }));
}

/** Buckets manual calendar_events rows by their LOCAL start date (never the UTC date). */
export function deriveEventItems(events: CalendarEvent[]): CalendarItem[] {
  return events.map((event) => ({
    kind: event.eventType,
    id: `event-${event.id}`,
    date: toDateKey(new Date(event.startAt)),
    eventId: event.id,
    title: event.title,
    startAt: event.startAt,
    endAt: event.endAt,
    location: event.location,
    description: event.description,
    coverageStatus: event.coverageStatus,
    assignees: event.assignees,
  }));
}

export function groupItemsByDate(items: CalendarItem[]): Map<string, CalendarItem[]> {
  const groups = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const existing = groups.get(item.date) ?? [];
    existing.push(item);
    groups.set(item.date, existing);
  }
  return groups;
}

export interface MonthGridDay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/** Builds a 6-week (42-day) grid for `year`/`month` (0-indexed), starting on Sunday — all local Date math. */
export function buildMonthGrid(year: number, month: number): MonthGridDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  const today = toDateKey(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index
    );
    const dateKey = toDateKey(date);
    return {
      date,
      dateKey,
      isCurrentMonth: date.getMonth() === month,
      isToday: dateKey === today,
    };
  });
}

function itemSortKey(item: CalendarItem): string {
  return item.kind === "deadline" ? `${item.date}T00:00:00` : item.startAt;
}

/** Chronologically sorted upcoming items (deadlines + events combined, each item appears once). */
export function buildUpcomingItems(items: CalendarItem[], limit: number): CalendarItem[] {
  const todayKey = toDateKey(new Date());
  return [...items]
    .filter((item) => item.date >= todayKey)
    .sort((a, b) => itemSortKey(a).localeCompare(itemSortKey(b)))
    .slice(0, limit);
}

/** Combines a local "YYYY-MM-DD" date + "HH:MM" time into an ISO timestamptz string using local wall-clock time. */
export function toTimestamptz(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

/** Splits a stored timestamptz back into local "YYYY-MM-DD" date + "HH:MM" time for form inputs. */
export function splitTimestamptz(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: toDateKey(d),
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}
