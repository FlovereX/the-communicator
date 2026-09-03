import type { Pitch, StoryStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<StoryStatus, string> = {
  Idea: "bg-zinc-100 text-zinc-600 border-zinc-200",
  Assigned: "bg-blue-50 text-blue-700 border-blue-200",
  Writing: "bg-amber-50 text-amber-700 border-amber-200",
  Submitted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Editing: "bg-purple-50 text-purple-700 border-purple-200",
  "Needs Revision": "bg-red-50 text-red-700 border-red-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Published: "bg-navy/5 text-navy border-navy/20",
};

export function StatusBadge({ status }: { status: StoryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}

const PITCH_STATUS_STYLES: Record<Pitch["status"], string> = {
  Submitted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

export function PitchStatusBadge({ status }: { status: Pitch["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        PITCH_STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
