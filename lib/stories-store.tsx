"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { currentUser, stories as initialStories } from "./mock-data";
import type { MediaItem, Source, Story, VersionEntry } from "./types";

export interface NewStoryInput {
  title: string;
  section: string;
  writer: string;
  editor: string;
  dueDate: string;
  assignmentNotes?: string;
}

interface StoriesContextValue {
  stories: Story[];
  getStory: (id: string) => Story | undefined;
  addStory: (input: NewStoryInput) => Story;
  updateArticle: (id: string, updates: { title?: string; body?: string }) => void;
  startWriting: (id: string) => void;
  submitForReview: (id: string) => void;
  resubmit: (id: string) => void;
  startEditing: (id: string) => void;
  requestRevision: (id: string, message: string) => void;
  approveStory: (id: string) => void;
  markPublished: (id: string) => void;
  addSource: (id: string, source: Omit<Source, "id">) => void;
  addMedia: (id: string, media: Omit<MediaItem, "id">) => void;
}

const StoriesContext = createContext<StoriesContextValue | null>(null);

function appendVersion(story: Story, label: string): VersionEntry[] {
  const version = story.versions.length + 1;
  return [
    ...story.versions,
    { id: `${story.id}-v${version}`, version, label, timestamp: new Date().toISOString() },
  ];
}

export function StoriesProvider({ children }: { children: ReactNode }) {
  const [stories, setStories] = useState<Story[]>(initialStories);

  function updateStory(id: string, updater: (story: Story) => Story) {
    setStories((prev) => prev.map((story) => (story.id === id ? updater(story) : story)));
  }

  const value = useMemo<StoriesContextValue>(
    () => ({
      stories,
      getStory: (id) => stories.find((story) => story.id === id),
      addStory: (input) => {
        const id = `story-${Date.now()}`;
        const newStory: Story = {
          id,
          title: input.title,
          section: input.section,
          writer: input.writer,
          editor: input.editor,
          dueDate: input.dueDate,
          status: "Assigned",
          assignmentNotes: input.assignmentNotes,
          body: "",
          sources: [],
          media: [],
          feedback: [],
          versions: [],
        };
        setStories((prev) => [newStory, ...prev]);
        return newStory;
      },
      updateArticle: (id, updates) => {
        updateStory(id, (story) => ({
          ...story,
          ...updates,
          status:
            story.status === "Idea" || story.status === "Assigned" ? "Writing" : story.status,
          wordCount: updates.body
            ? updates.body.trim().split(/\s+/).filter(Boolean).length
            : story.wordCount,
        }));
      },
      startWriting: (id) => {
        updateStory(id, (story) => ({
          ...story,
          status: "Writing",
          versions: appendVersion(story, "Writing Started"),
        }));
      },
      submitForReview: (id) => {
        updateStory(id, (story) => ({
          ...story,
          status: "Submitted",
          versions: appendVersion(story, "Submitted"),
        }));
      },
      resubmit: (id) => {
        updateStory(id, (story) => ({
          ...story,
          status: "Submitted",
          versions: appendVersion(story, "Resubmitted"),
        }));
      },
      startEditing: (id) => {
        updateStory(id, (story) => ({
          ...story,
          status: "Editing",
          versions: appendVersion(story, "Editing Started"),
        }));
      },
      requestRevision: (id, message) => {
        updateStory(id, (story) => ({
          ...story,
          status: "Needs Revision",
          feedback: [
            ...story.feedback,
            {
              id: `${id}-f${story.feedback.length + 1}`,
              editor: currentUser.name,
              timestamp: new Date().toISOString(),
              message,
            },
          ],
          versions: appendVersion(story, "Revision Requested"),
        }));
      },
      markPublished: (id) => {
        updateStory(id, (story) => ({
          ...story,
          status: "Published",
          versions: appendVersion(story, "Published"),
        }));
      },
      approveStory: (id) => {
        updateStory(id, (story) => ({
          ...story,
          status: "Approved",
          versions: appendVersion(story, "Approved"),
        }));
      },
      addSource: (id, source) => {
        updateStory(id, (story) => ({
          ...story,
          sources: [...story.sources, { ...source, id: `${id}-s${story.sources.length + 1}` }],
        }));
      },
      addMedia: (id, media) => {
        updateStory(id, (story) => ({
          ...story,
          media: [...story.media, { ...media, id: `${id}-m${story.media.length + 1}` }],
        }));
      },
    }),
    [stories]
  );

  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
}

export function useStories() {
  const context = useContext(StoriesContext);
  if (!context) {
    throw new Error("useStories must be used within a StoriesProvider");
  }
  return context;
}
