import { Card } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Story } from "@/lib/types";
import { formatDueDate } from "@/lib/format";

export function AssignmentsList({
  assignments,
  title = "My Assignments",
}: {
  assignments: Story[];
  title?: string;
}) {
  return (
    <Card>
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <ul className="divide-y divide-border">
        {assignments.map((story) => (
          <li
            key={story.id}
            className="flex flex-col items-start gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{story.title}</p>
              <p className="mt-0.5 text-xs text-foreground/50">
                {story.section} &middot; Due {formatDueDate(story.dueDate)}
              </p>
            </div>
            <StatusBadge status={story.status} />
          </li>
        ))}
        {assignments.length === 0 ? (
          <li className="px-5 py-6 text-sm text-foreground/50">
            No assignments right now.
          </li>
        ) : null}
      </ul>
    </Card>
  );
}
