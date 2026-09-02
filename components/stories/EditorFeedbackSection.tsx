import { formatRelativeTime } from "@/lib/format";
import type { Story } from "@/lib/types";

export function EditorFeedbackSection({ story }: { story: Story }) {
  if (story.feedback.length === 0) {
    return <p className="text-sm text-foreground/50">No editor feedback yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {[...story.feedback].reverse().map((entry) => (
        <div key={entry.id} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">{entry.editor}</p>
            <p className="text-xs text-foreground/45">{formatRelativeTime(entry.timestamp)}</p>
          </div>
          <p className="mt-2 text-sm text-foreground/75">{entry.message}</p>
        </div>
      ))}
    </div>
  );
}
