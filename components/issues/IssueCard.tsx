import { cn } from "@/lib/utils";
import { formatDueDate } from "@/lib/format";
import type { Issue } from "@/lib/types";

const STATUS_STYLES: Record<Issue["status"], string> = {
  Planning: "bg-zinc-100 text-zinc-600 border-zinc-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "In Review": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Published: "bg-navy/5 text-navy border-navy/20",
};

export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div>
        <p className="font-serif text-base font-semibold text-foreground">
          {issue.name}
        </p>
        <p className="mt-0.5 text-xs text-foreground/50">
          Publishes {formatDueDate(issue.publishDate)} &middot; {issue.storyCount}{" "}
          stories
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
          STATUS_STYLES[issue.status]
        )}
      >
        {issue.status}
      </span>
    </div>
  );
}
