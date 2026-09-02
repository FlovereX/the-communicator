import { cn } from "@/lib/utils";
import type { Pitch } from "@/lib/types";

const STATUS_STYLES: Record<Pitch["status"], string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

export function PitchCard({ pitch }: { pitch: Pitch }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-base font-semibold text-foreground">
            {pitch.title}
          </p>
          <p className="mt-0.5 text-xs text-foreground/50">
            {pitch.section} &middot; Submitted by {pitch.submittedBy}
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
    </div>
  );
}
