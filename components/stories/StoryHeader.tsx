import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDueDate } from "@/lib/format";
import type { Story } from "@/lib/types";

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function StoryHeader({ story }: { story: Story }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          {story.title}
        </h1>
        <StatusBadge status={story.status} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetaItem label="Section" value={story.section} />
        <MetaItem label="Writer" value={story.writer} />
        <MetaItem label="Editor" value={story.editor} />
        <MetaItem
          label="Deadline"
          value={story.dueDate ? formatDueDate(story.dueDate) : "No deadline"}
        />
      </div>
    </div>
  );
}
