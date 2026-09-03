"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { NewStoryModal } from "@/components/stories/NewStoryModal";
import { StoriesTable } from "@/components/stories/StoriesTable";
import { StoriesToolbar, type StoryFilters } from "@/components/stories/StoriesToolbar";
import { useCurrentUser } from "@/lib/auth-context";
import { NEWSROOM_SECTIONS } from "@/lib/sections";
import { useStories } from "@/lib/stories-store";

const DEFAULT_FILTERS: StoryFilters = {
  search: "",
  status: "All",
  section: "All",
  writer: "All",
  mineOnly: false,
};

export default function StoriesPage() {
  const currentUser = useCurrentUser();
  const { stories, isLoading, error, clearError } = useStories();
  const [filters, setFilters] = useState<StoryFilters>(DEFAULT_FILTERS);
  const [isNewStoryOpen, setIsNewStoryOpen] = useState(false);
  const canCreateStory = currentUser.role !== "writer";

  const writers = useMemo(
    () => [...new Set(stories.map((story) => story.writer))].sort(),
    [stories]
  );

  const filteredStories = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return stories.filter((story) => {
      if (search && !story.title.toLowerCase().includes(search)) return false;
      if (filters.status !== "All" && story.status !== filters.status) return false;
      if (filters.section !== "All" && story.section !== filters.section) return false;
      if (filters.writer !== "All" && story.writer !== filters.writer) return false;
      if (filters.mineOnly && story.writerId !== currentUser.id) return false;
      return true;
    });
  }, [stories, filters, currentUser.id]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stories"
        description="Manage articles across The Communicator newsroom."
      />
      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span>Couldn&apos;t load stories: {error}</span>
          <button type="button" onClick={clearError} className="font-medium underline">
            Dismiss
          </button>
        </div>
      ) : null}
      <StoriesToolbar
        filters={filters}
        onFiltersChange={setFilters}
        sections={NEWSROOM_SECTIONS}
        writers={writers}
        onNewStory={() => setIsNewStoryOpen(true)}
        showMineOnlyFilter={canCreateStory}
        showNewStory={canCreateStory}
      />
      {isLoading ? (
        <p className="text-sm text-foreground/50">Loading stories…</p>
      ) : (
        <StoriesTable stories={filteredStories} />
      )}
      {isNewStoryOpen ? <NewStoryModal onClose={() => setIsNewStoryOpen(false)} /> : null}
    </div>
  );
}

