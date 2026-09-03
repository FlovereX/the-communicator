import Link from "next/link";
import { Card } from "@/components/shared/PageHeader";
import { PitchStatusBadge } from "@/components/shared/StatusBadge";
import { formatRelativeTime } from "@/lib/format";
import type { Pitch } from "@/lib/types";

export function PitchesList({
  pitches,
  title,
  emptyLabel = "No pitches to show.",
  showSubmitter = false,
}: {
  pitches: Pitch[];
  title: string;
  emptyLabel?: string;
  showSubmitter?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">{title}</h2>
        <Link href="/pitches" className="text-xs font-medium text-navy hover:underline">
          View all
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {pitches.map((pitch) => (
          <li key={pitch.id}>
            <Link
              href="/pitches"
              className="flex flex-col items-start gap-2 px-5 py-4 hover:bg-background/60 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{pitch.title}</p>
                <p className="mt-0.5 text-xs text-foreground/50">
                  {pitch.section}
                  {showSubmitter ? ` \u00b7 ${pitch.submittedBy}` : ""} &middot;{" "}
                  {formatRelativeTime(pitch.createdAt)}
                </p>
              </div>
              <PitchStatusBadge status={pitch.status} />
            </Link>
          </li>
        ))}
        {pitches.length === 0 ? (
          <li className="px-5 py-6 text-sm text-foreground/50">{emptyLabel}</li>
        ) : null}
      </ul>
    </Card>
  );
}
