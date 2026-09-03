import Link from "next/link";
import { PitchStatusBadge } from "@/components/shared/StatusBadge";
import { formatRelativeTime } from "@/lib/format";
import type { Pitch } from "@/lib/types";

export function PitchCard({ pitch }: { pitch: Pitch }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-base font-semibold text-foreground">{pitch.title}</p>
          <p className="mt-0.5 text-xs text-foreground/50">
            {pitch.section} &middot; Submitted {formatRelativeTime(pitch.createdAt)}
          </p>
        </div>
        <PitchStatusBadge status={pitch.status} />
      </div>
      <p className="mt-3 text-sm text-foreground/70">{pitch.summary}</p>
      {pitch.status === "Rejected" && pitch.editorFeedback ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900/60 dark:bg-red-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700/80 dark:text-red-400/80">
            Editor feedback
          </p>
          <p className="mt-1 text-red-700 dark:text-red-400">{pitch.editorFeedback}</p>
        </div>
      ) : null}
      {pitch.status === "Approved" && pitch.storyId ? (
        <Link
          href={`/stories/${pitch.storyId}`}
          className="mt-3 inline-block text-sm font-medium text-navy hover:underline"
        >
          View story &rarr;
        </Link>
      ) : null}
    </div>
  );
}
