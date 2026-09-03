import Link from "next/link";
import { Card } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Story } from "@/lib/types";
import { formatDueDate } from "@/lib/format";

export function AssignmentsList({
  assignments,
  title = "My Assignments",
  emptyLabel = "No assignments right now.",
}: {
  assignments: Story[];
  title?: string;
  emptyLabel?: string;
}) {
  return (
    <Card>
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <ul className="divide-y divide-border">
        {assignments.map((story) => (
          <li key={story.id}>
            <Link
              href={`/stories/${story.id}`}
              className="flex flex-col items-start gap-2 px-5 py-4 hover:bg-background/60 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{story.title}</p>
                <p className="mt-0.5 text-xs text-foreground/50">
                  {story.section} &middot;{" "}
                  {story.dueDate ? `Due ${formatDueDate(story.dueDate)}` : "No deadline"}
                </p>
              </div>
              <StatusBadge status={story.status} />
            </Link>
          </li>
        ))}
        {assignments.length === 0 ? (
          <li className="px-5 py-6 text-sm text-foreground/50">{emptyLabel}</li>
        ) : null}
      </ul>
    </Card>
  );
}
