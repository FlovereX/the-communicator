"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDueDate } from "@/lib/format";
import type { Story } from "@/lib/types";

function isOverdue(story: Story) {
  if (story.status === "Published" || !story.dueDate) return false;
  return story.dueDate < new Date().toISOString().slice(0, 10);
}

// Clicking one of these (or a descendant of one) should not also trigger row navigation.
const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, [role="button"]';

export function StoriesTable({ stories }: { stories: Story[] }) {
  const router = useRouter();

  function handleRowClick(event: React.MouseEvent<HTMLTableRowElement>, storyId: string) {
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    router.push(`/stories/${storyId}`);
  }

  function handleRowKeyDown(event: React.KeyboardEvent<HTMLTableRowElement>, storyId: string) {
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    router.push(`/stories/${storyId}`);
  }

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
            <tr
              key={story.id}
              tabIndex={0}
              onClick={(event) => handleRowClick(event, story.id)}
              onKeyDown={(event) => handleRowKeyDown(event, story.id)}
              className="group cursor-pointer hover:bg-background/60 focus:outline-none focus-visible:bg-background/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy"
            >
              <td className="px-5 py-3.5 font-medium text-foreground">
                <Link href={`/stories/${story.id}`} className="group-hover:underline">
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
                {story.dueDate ? formatDueDate(story.dueDate) : "\u2014"}
                {isOverdue(story) ? (
                  <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-950/40 dark:text-red-400">
                    Overdue
                  </span>
                ) : null}
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
