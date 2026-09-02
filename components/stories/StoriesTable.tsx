import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDueDate } from "@/lib/format";
import type { Story } from "@/lib/types";

export function StoriesTable({ stories }: { stories: Story[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-background/60 text-xs uppercase tracking-wide text-foreground/45">
          <tr>
            <th className="px-5 py-3 font-medium">Headline</th>
            <th className="hidden px-5 py-3 font-medium md:table-cell">Writer</th>
            <th className="hidden px-5 py-3 font-medium sm:table-cell">Section</th>
            <th className="hidden px-5 py-3 font-medium lg:table-cell">Deadline</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="hidden px-5 py-3 font-medium lg:table-cell">Editor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stories.map((story) => (
            <tr key={story.id} className="group relative cursor-pointer hover:bg-background/60">
              <td className="px-5 py-3.5 font-medium text-foreground">
                <Link
                  href={`/stories/${story.id}`}
                  className="after:absolute after:inset-0 group-hover:underline"
                >
                  {story.title}
                </Link>
              </td>
              <td className="hidden px-5 py-3.5 text-foreground/60 md:table-cell">
                {story.writer}
              </td>
              <td className="hidden px-5 py-3.5 text-foreground/60 sm:table-cell">
                {story.section}
              </td>
              <td className="hidden px-5 py-3.5 whitespace-nowrap text-foreground/60 lg:table-cell">
                {formatDueDate(story.dueDate)}
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={story.status} />
              </td>
              <td className="hidden px-5 py-3.5 text-foreground/60 lg:table-cell">
                {story.editor}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {stories.length === 0 ? (
        <p className="px-5 py-6 text-sm text-foreground/50">
          No stories match your filters.
        </p>
      ) : null}
    </div>
  );
}
