import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Pitch } from "@/lib/types";

const STATUS_STYLES: Record<Pitch["status"], string> = {
  Submitted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

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
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            STATUS_STYLES[pitch.status]
          )}
        >
          {pitch.status}
        </span>
      </div>
      <p className="mt-3 text-sm text-foreground/70">{pitch.summary}</p>
      {pitch.status === "Rejected" && pitch.editorFeedback ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700/80">
            Editor feedback
          </p>
          <p className="mt-1 text-red-700">{pitch.editorFeedback}</p>
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
