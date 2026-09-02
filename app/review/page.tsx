import { PageHeader } from "@/components/shared/PageHeader";
import { StoriesTable } from "@/components/stories/StoriesTable";
import { stories } from "@/lib/mock-data";

const REVIEW_STATUSES = ["Submitted", "Editing", "Needs Revision"] as const;

export default function ReviewPage() {
  const queue = stories.filter((story) =>
    REVIEW_STATUSES.includes(story.status as (typeof REVIEW_STATUSES)[number])
  );

  return (
    <div>
      <PageHeader
        title="Review Queue"
        description="Stories submitted, in editing, or awaiting revision."
      />
      <StoriesTable stories={queue} />
    </div>
  );
}
