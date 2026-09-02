import { Card } from "@/components/shared/PageHeader";
import { formatDueDate } from "@/lib/format";
import type { Story } from "@/lib/types";

export function UpcomingDeadlines({ deadlines }: { deadlines: Story[] }) {
  return (
    <Card>
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Upcoming Deadlines
        </h2>
      </div>
      <ul className="divide-y divide-border">
        {deadlines.map((story) => (
          <li key={story.id} className="flex items-center gap-3 px-5 py-3.5">
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-navy/5 text-navy">
              <span className="text-[10px] font-semibold uppercase leading-none">
                {formatDueDate(story.dueDate).split(" ")[0].slice(0, 3)}
              </span>
              <span className="text-sm font-bold leading-none">
                {formatDueDate(story.dueDate).split(" ")[1]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {story.title}
              </p>
              <p className="text-xs text-foreground/50">{story.section}</p>
            </div>
          </li>
        ))}
        {deadlines.length === 0 ? (
          <li className="px-5 py-6 text-sm text-foreground/50">
            Nothing due soon.
          </li>
        ) : null}
      </ul>
    </Card>
  );
}
