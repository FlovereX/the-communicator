"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCurrentUser } from "./auth-context";
import { createClient } from "./supabase/client";
import { mapStoryRow, STATUS_TO_DB } from "./supabase/mappers";
import type { ProfileRow, StoryFeedbackRow, StoryMediaRow, StoryRow, StorySourceRow, StoryVersionRow } from "./supabase/types";
import type { Source, Story } from "./types";

export interface NewStoryInput {
  title: string;
  section: string;
  writerId: string;
  editorId: string;
  dueDate: string;
  assignmentNotes?: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  role: ProfileRow["role"];
}

interface StoriesContextValue {
  stories: Story[];
  writers: StaffProfile[];
  editors: StaffProfile[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  getStory: (id: string) => Story | undefined;
  addStory: (input: NewStoryInput) => Promise<Story | null>;
  updateArticle: (id: string, updates: { title?: string; body?: string }) => Promise<void>;
  startWriting: (id: string) => Promise<void>;
  submitForReview: (id: string) => Promise<void>;
  resubmit: (id: string) => Promise<void>;
  startEditing: (id: string) => Promise<void>;
  requestRevision: (id: string, message: string) => Promise<void>;
  approveStory: (id: string) => Promise<void>;
  markPublished: (id: string) => Promise<void>;
  addSource: (id: string, source: Omit<Source, "id">) => Promise<void>;
}

const StoriesContext = createContext<StoriesContextValue | null>(null);

export function StoriesProvider({ children }: { children: ReactNode }) {
  const currentUser = useCurrentUser();
  const [stories, setStories] = useState<Story[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStoriesData = useCallback(async () => {
    const supabase = createClient();

    const [
      { data: storyRows, error: storiesError },
      { data: profileRows, error: profilesError },
      { data: sourceRows, error: sourcesError },
      { data: feedbackRows, error: feedbackError },
      { data: versionRows, error: versionsError },
      { data: mediaRows, error: mediaError },
    ] = await Promise.all([
      supabase
        .from("stories")
        .select("*")
        .order("deadline", { ascending: true })
        .overrideTypes<StoryRow[]>(),
      supabase.from("profiles").select("*").overrideTypes<ProfileRow[]>(),
      supabase.from("story_sources").select("*").overrideTypes<StorySourceRow[]>(),
      supabase.from("story_feedback").select("*").overrideTypes<StoryFeedbackRow[]>(),
      supabase.from("story_versions").select("*").overrideTypes<StoryVersionRow[]>(),
      supabase.from("story_media").select("*").overrideTypes<StoryMediaRow[]>(),
    ]);

    const firstError =
      storiesError || profilesError || sourcesError || feedbackError || versionsError || mediaError;
    if (firstError) {
      return { ok: false as const, error: firstError.message };
    }

    const profileList = profileRows ?? [];
    const profilesById = new Map(profileList.map((p) => [p.id, p]));
    const relations = {
      sources: sourceRows ?? [],
      feedback: feedbackRows ?? [],
      versions: versionRows ?? [],
      media: mediaRows ?? [],
    };

    return {
      ok: true as const,
      profiles: profileList,
      stories: (storyRows ?? []).map((row) => mapStoryRow(row, profilesById, relations)),
    };
  }, []);

  const loadAll = useCallback(async () => {
    setError(null);
    const result = await fetchStoriesData();
    if (!result.ok) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    setProfiles(result.profiles);
    setStories(result.stories);
    setIsLoading(false);
  }, [fetchStoriesData]);

  useEffect(() => {
    let ignore = false;

    fetchStoriesData().then((result) => {
      if (ignore) return;
      if (!result.ok) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setProfiles(result.profiles);
      setStories(result.stories);
      setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [fetchStoriesData]);

  const writers = useMemo(
    () =>
      profiles
        .filter((p) => p.role === "writer")
        .map((p) => ({ id: p.id, name: p.full_name, role: p.role })),
    [profiles]
  );
  const editors = useMemo(
    () =>
      profiles
        .filter((p) => p.role === "editor" || p.role === "admin")
        .map((p) => ({ id: p.id, name: p.full_name, role: p.role })),
    [profiles]
  );

  async function insertVersion(storyId: string, headline: string, body: string) {
    const supabase = createClient();
    const current = stories.find((s) => s.id === storyId);
    const nextVersionNumber = (current?.versions.length ?? 0) + 1;
    const { error: versionError } = await supabase.from("story_versions").insert({
      story_id: storyId,
      version_number: nextVersionNumber,
      headline,
      body,
      created_by: currentUser.id,
    });
    if (versionError) {
      setError(versionError.message);
      return false;
    }
    return true;
  }

  async function updateStory(id: string, fields: Record<string, unknown>) {
    const supabase = createClient();
    setError(null);
    const { error: updateError } = await supabase.from("stories").update(fields).eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await loadAll();
  }

  /** Submitting/resubmitting captures a headline+body snapshot as a new story_versions row. */
  async function submit(id: string) {
    const story = stories.find((s) => s.id === id);
    if (!story) return;
    const supabase = createClient();
    setError(null);
    const { error: updateError } = await supabase
      .from("stories")
      .update({ status: STATUS_TO_DB.Submitted, submitted_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    const ok = await insertVersion(id, story.title, story.body);
    if (!ok) return;
    await loadAll();
  }


  const value = useMemo<StoriesContextValue>(
    () => ({
      stories,
      writers,
      editors,
      isLoading,
      error,
      clearError: () => setError(null),
      refresh: loadAll,
      getStory: (id) => stories.find((story) => story.id === id),
      addStory: async (input) => {
        const supabase = createClient();
        setError(null);
        const { data, error: insertError } = await supabase
          .from("stories")
          .insert({
            headline: input.title,
            section: input.section,
            writer_id: input.writerId,
            editor_id: input.editorId,
            deadline: input.dueDate,
            assignment_notes: input.assignmentNotes ?? null,
            created_by: currentUser.id,
            status: STATUS_TO_DB.Assigned,
            body: "",
          })
          .select("*")
          .single();
        if (insertError || !data) {
          setError(insertError?.message ?? "Could not create the story.");
          return null;
        }
        await loadAll();
        const profilesById = new Map(profiles.map((p) => [p.id, p]));
        return mapStoryRow(data, profilesById, {
          sources: [],
          feedback: [],
          versions: [],
          media: [],
        });
      },
      updateArticle: async (id, updates) => {
        const story = stories.find((s) => s.id === id);
        const fields: Record<string, unknown> = {};
        if (updates.title !== undefined) fields.headline = updates.title;
        if (updates.body !== undefined) fields.body = updates.body;
        if (story && (story.status === "Idea" || story.status === "Assigned")) {
          fields.status = STATUS_TO_DB.Writing;
        }
        await updateStory(id, fields);
      },
      startWriting: (id) => updateStory(id, { status: STATUS_TO_DB.Writing }),
      submitForReview: (id) => submit(id),
      resubmit: (id) => submit(id),
      startEditing: (id) => updateStory(id, { status: STATUS_TO_DB.Editing }),
      requestRevision: async (id, message) => {
        const supabase = createClient();
        setError(null);
        const { error: feedbackError } = await supabase
          .from("story_feedback")
          .insert({ story_id: id, created_by: currentUser.id, message });
        if (feedbackError) {
          setError(feedbackError.message);
          return;
        }
        await updateStory(id, { status: STATUS_TO_DB["Needs Revision"] });
      },
      approveStory: (id) =>
        updateStory(id, { status: STATUS_TO_DB.Approved, approved_at: new Date().toISOString() }),
      markPublished: (id) =>
        updateStory(id, {
          status: STATUS_TO_DB.Published,
          published_at: new Date().toISOString(),
        }),
      addSource: async (id, source) => {
        const supabase = createClient();
        setError(null);
        const { error: sourceError } = await supabase.from("story_sources").insert({
          story_id: id,
          name: source.name,
          organization: source.organization,
          url: source.url ?? null,
          notes: source.notes ?? null,
          created_by: currentUser.id,
        });
        if (sourceError) {
          setError(sourceError.message);
          return;
        }
        await loadAll();
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stories, writers, editors, isLoading, error, profiles, loadAll, currentUser.id]
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

