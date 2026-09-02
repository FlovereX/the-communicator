"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { NewStoryModal } from "@/components/stories/NewStoryModal";
import { StoriesTable } from "@/components/stories/StoriesTable";
import { StoriesToolbar, type StoryFilters } from "@/components/stories/StoriesToolbar";
import { useStories } from "@/lib/stories-store";

const DEFAULT_FILTERS: StoryFilters = {
  search: "",
  status: "All",
  section: "All",
  writer: "All",
};

export default function StoriesPage() {
  const { stories } = useStories();
  const [filters, setFilters] = useState<StoryFilters>(DEFAULT_FILTERS);
  const [isNewStoryOpen, setIsNewStoryOpen] = useState(false);

  const sections = useMemo(
    () => [...new Set(stories.map((story) => story.section))].sort(),
    [stories]
  );
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
      return true;
    });
  }, [stories, filters]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stories"
        description="Manage articles across The Communicator newsroom."
      />
      <StoriesToolbar
        filters={filters}
        onFiltersChange={setFilters}
        sections={sections}
        writers={writers}
        onNewStory={() => setIsNewStoryOpen(true)}
      />
      <StoriesTable stories={filteredStories} />
      {isNewStoryOpen ? <NewStoryModal onClose={() => setIsNewStoryOpen(false)} /> : null}
    </div>
  );
}
