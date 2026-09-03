"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { StoriesTable } from "@/components/stories/StoriesTable";
import { useStories } from "@/lib/stories-store";
import type { StoryStatus } from "@/lib/types";

const REVIEW_STATUSES: StoryStatus[] = ["Submitted", "Editing", "Needs Revision"];

export default function ReviewPage() {
  const { stories, isLoading, error } = useStories();
  const queue = stories.filter((story) => REVIEW_STATUSES.includes(story.status));

  return (
    <div>
      <PageHeader
        title="Review Queue"
        description="Stories submitted, in editing, or awaiting revision."
      />
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Couldn&apos;t load stories: {error}
        </div>
      ) : null}
      {isLoading ? (
        <p className="text-sm text-foreground/50">Loading review queue…</p>
      ) : (
        <StoriesTable stories={queue} />
      )}
    </div>
  );
}

