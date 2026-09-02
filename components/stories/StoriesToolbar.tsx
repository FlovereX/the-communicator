"use client";

import { Button } from "@/components/shared/Button";
import { Select, TextInput } from "@/components/shared/FormControls";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { STORY_STATUSES, type StoryStatus } from "@/lib/types";

export interface StoryFilters {
  search: string;
  status: StoryStatus | "All";
  section: string | "All";
  writer: string | "All";
}

export function StoriesToolbar({
  filters,
  onFiltersChange,
  sections,
  writers,
  onNewStory,
}: {
  filters: StoryFilters;
  onFiltersChange: (filters: StoryFilters) => void;
  sections: string[];
  writers: string[];
  onNewStory: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative sm:w-64">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <TextInput
            type="text"
            placeholder="Search stories"
            aria-label="Search stories"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
        <Select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({ ...filters, status: e.target.value as StoryFilters["status"] })
          }
          className="sm:w-40"
        >
          <option value="All">All statuses</option>
          {STORY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by section"
          value={filters.section}
          onChange={(e) => onFiltersChange({ ...filters, section: e.target.value })}
          className="sm:w-40"
        >
          <option value="All">All sections</option>
          {sections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by writer"
          value={filters.writer}
          onChange={(e) => onFiltersChange({ ...filters, writer: e.target.value })}
          className="sm:w-40"
        >
          <option value="All">All writers</option>
          {writers.map((writer) => (
            <option key={writer} value={writer}>
              {writer}
            </option>
          ))}
        </Select>
      </div>
      <Button variant="primary" onClick={onNewStory} className="shrink-0">
        <PlusIcon className="h-4 w-4" />
        New Story
      </Button>
    </div>
  );
}
