import { formatRelativeTime } from "@/lib/format";
import type { Story } from "@/lib/types";

export function VersionHistorySection({ story }: { story: Story }) {
  if (story.versions.length === 0) {
    return <p className="text-sm text-foreground/50">No versions submitted yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {[...story.versions].reverse().map((entry) => (
        <li
          key={entry.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border p-4"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Version {entry.version}</p>
            <p className="text-xs text-foreground/50">{entry.label}</p>
          </div>
          <p className="text-xs text-foreground/45">{formatRelativeTime(entry.timestamp)}</p>
        </li>
      ))}
    </ul>
  );
}
