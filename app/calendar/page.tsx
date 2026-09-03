"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { CalendarList } from "@/components/calendar/CalendarList";
import { useStories } from "@/lib/stories-store";

export default function CalendarPage() {
  const { stories, isLoading, error } = useStories();
  const scheduledStories = [...stories].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Story deadlines across the newsroom, by date."
      />
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Couldn&apos;t load stories: {error}
        </div>
      ) : null}
      {isLoading ? (
        <p className="text-sm text-foreground/50">Loading calendar…</p>
      ) : (
        <CalendarList stories={scheduledStories} />
      )}
    </div>
  );
}

