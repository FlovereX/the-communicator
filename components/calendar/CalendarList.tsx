import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDueDate } from "@/lib/format";
import type { Story } from "@/lib/types";

function groupByDueDate(stories: Story[]) {
  const groups = new Map<string, Story[]>();
  for (const story of stories) {
    const existing = groups.get(story.dueDate) ?? [];
    existing.push(story);
    groups.set(story.dueDate, existing);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function CalendarList({ stories }: { stories: Story[] }) {
  const groups = groupByDueDate(stories);

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([dueDate, storiesForDate]) => (
        <div
          key={dueDate}
          className="rounded-xl border border-border bg-surface shadow-sm"
        >
          <div className="border-b border-border px-5 py-3">
            <p className="font-serif text-sm font-semibold text-navy">
              {formatDueDate(dueDate)}
            </p>
          </div>
          <ul className="divide-y divide-border">
            {storiesForDate.map((story) => (
              <li
                key={story.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {story.title}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {story.section} &middot; {story.writer}
                  </p>
                </div>
                <StatusBadge status={story.status} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      {groups.length === 0 ? (
        <p className="text-sm text-foreground/50">No upcoming deadlines.</p>
      ) : null}
    </div>
  );
}
