import { Button } from "@/components/shared/Button";
import { formatRelativeTime } from "@/lib/format";
import type { Announcement } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRIORITY_LABELS: Record<Announcement["priority"], string> = {
  normal: "Normal",
  important: "Important",
  urgent: "Urgent",
};

const PRIORITY_STYLES: Record<Announcement["priority"], string> = {
  normal:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  important:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
  urgent:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60",
};

export function AnnouncementCard({
  announcement,
  onEdit,
  onDelete,
}: {
  announcement: Announcement;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={cn(
              "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
              PRIORITY_STYLES[announcement.priority]
            )}
          >
            {PRIORITY_LABELS[announcement.priority]}
          </span>
          <p className="mt-2 break-words font-serif text-base font-semibold text-foreground">
            {announcement.title}
          </p>
        </div>
        {onEdit || onDelete ? (
          <div className="flex shrink-0 gap-2">
            {onEdit ? (
              <Button type="button" variant="secondary" onClick={onEdit}>
                Edit
              </Button>
            ) : null}
            {onDelete ? (
              <Button type="button" variant="danger" onClick={onDelete}>
                Delete
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      <p className="whitespace-pre-wrap text-sm text-foreground/70">{announcement.body}</p>
      <p className="text-xs text-foreground/50">
        Posted {formatRelativeTime(announcement.createdAt)}
        {announcement.expiresAt ? ` \u00b7 Expires ${formatRelativeTime(announcement.expiresAt)}` : ""}
      </p>
    </div>
  );
}
