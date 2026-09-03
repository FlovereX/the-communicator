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
import type { NewsroomSection } from "./sections";
import { createClient } from "./supabase/client";
import { mapStoryRow } from "./supabase/mappers";
import { buildStoragePath, SIGNED_URL_TTL_SECONDS, STORY_MEDIA_BUCKET, validateMediaFile } from "./supabase/storage";
import type { ProfileRow, StoryFeedbackRow, StoryMediaRow, StoryRow, StorySourceRow, StoryVersionRow } from "./supabase/types";
import type { MediaItem, Source, Story } from "./types";

export interface NewStoryInput {
  title: string;
  section: NewsroomSection;
  writerId: string;
  editorId: string;
  dueDate: string;
  assignmentNotes?: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  role: ProfileRow["role"];
  status: ProfileRow["status"];
}

export interface MediaMetadataInput {
  caption?: string | null;
  credit?: string | null;
  altText?: string | null;
}

export type MediaActionResult = { ok: true } | { ok: false; error: string };
export type CreateStoryResult = { ok: true; storyId: string } | { ok: false; error: string };
export type AdminDeleteStoryResult =
  | { ok: true; storageCleanupWarnings?: string[] }
  | { ok: false; error: string };

interface StoriesContextValue {
  stories: Story[];
  writers: StaffProfile[];
  editors: StaffProfile[];
  /** Signed preview URLs for story_media rows, keyed by media id. */
  mediaUrls: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  getStory: (id: string) => Story | undefined;
  addStory: (input: NewStoryInput) => Promise<CreateStoryResult>;
  updateArticle: (id: string, updates: { title?: string; body?: string }) => Promise<void>;
  startWriting: (id: string) => Promise<void>;
  submitForReview: (id: string) => Promise<void>;
  resubmit: (id: string) => Promise<void>;
  startEditing: (id: string) => Promise<void>;
  requestRevision: (id: string, message: string) => Promise<void>;
  approveStory: (id: string) => Promise<void>;
  markPublished: (id: string, publishedUrl: string) => Promise<MediaActionResult>;
  addSource: (id: string, source: Omit<Source, "id">) => Promise<void>;
  uploadMedia: (
    storyId: string,
    file: File,
    metadata: MediaMetadataInput
  ) => Promise<MediaActionResult>;
  updateMediaMetadata: (mediaId: string, updates: MediaMetadataInput) => Promise<MediaActionResult>;
  replaceMediaFile: (media: MediaItem, storyId: string, file: File) => Promise<MediaActionResult>;
  deleteMedia: (media: MediaItem) => Promise<MediaActionResult>;
  adminDeleteStory: (id: string) => Promise<AdminDeleteStoryResult>;
}

const StoriesContext = createContext<StoriesContextValue | null>(null);

export function StoriesProvider({ children }: { children: ReactNode }) {
  const currentUser = useCurrentUser();
  const [stories, setStories] = useState<Story[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
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

    const mediaList = mediaRows ?? [];
    const urlsById: Record<string, string> = {};
    if (mediaList.length > 0) {
      const { data: signedUrls } = await supabase.storage
        .from(STORY_MEDIA_BUCKET)
        .createSignedUrls(
          mediaList.map((m) => m.storage_path),
          SIGNED_URL_TTL_SECONDS
        );
      const urlByPath = new Map(
        (signedUrls ?? [])
          .filter((entry) => !entry.error && entry.signedUrl)
          .map((entry) => [entry.path, entry.signedUrl])
      );
      for (const m of mediaList) {
        const url = urlByPath.get(m.storage_path);
        if (url) urlsById[m.id] = url;
      }
    }

    return {
      ok: true as const,
      profiles: profileList,
      mediaUrls: urlsById,
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
    setMediaUrls(result.mediaUrls);
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
      setMediaUrls(result.mediaUrls);
      setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [fetchStoriesData]);


  // Any ACTIVE staff member (writer, editor, or admin) may be assigned as a story's writer.
  // Inactive (pending/rejected/disabled) profiles must never be offered for new assignments.
  const writers = useMemo(
    () =>
      profiles
        .filter((p) => p.status === "active")
        .map((p) => ({ id: p.id, name: p.full_name, email: p.email, role: p.role, status: p.status })),
    [profiles]
  );
  const editors = useMemo(
    () =>
      profiles
        .filter((p) => p.status === "active" && (p.role === "editor" || p.role === "admin"))
        .map((p) => ({ id: p.id, name: p.full_name, email: p.email, role: p.role, status: p.status })),
    [profiles]
  );

  /** Calls a workflow RPC and refreshes on success; surfaces the RPC's own error.message on failure. */
  async function callWorkflowRpc(fn: string, params: Record<string, unknown>) {
    const supabase = createClient();
    setError(null);
    const { error: rpcError } = await supabase.rpc(fn, params);
    if (rpcError) {
      setError(rpcError.message);
      return false;
    }
    await loadAll();
    return true;
  }


  const value = useMemo<StoriesContextValue>(
    () => ({
      stories,
      writers,
      editors,
      mediaUrls,
      isLoading,
      error,
      clearError: () => setError(null),
      refresh: loadAll,
      getStory: (id) => stories.find((story) => story.id === id),
      addStory: async (input) => {
        const supabase = createClient();
        const { data, error: rpcError } = await supabase.rpc("create_story", {
          p_headline: input.title,
          p_section: input.section,
          p_writer_id: input.writerId,
          p_editor_id: input.editorId,
          p_deadline: input.dueDate,
          p_assignment_notes: input.assignmentNotes ?? null,
        });
        if (rpcError || !data) {
          return { ok: false, error: rpcError?.message ?? "Could not create the story." };
        }
        // The id used for navigation comes straight from the RPC response, never from
        // this (or any prior) list state.
        const storyId: string = Array.isArray(data) ? data[0].id : data.id;
        await loadAll();
        return { ok: true, storyId };
      },
      updateArticle: async (id, updates) => {
        const story = stories.find((s) => s.id === id);
        const headline = updates.title ?? story?.title ?? "";
        const body = updates.body ?? story?.body ?? "";
        await callWorkflowRpc("save_story_draft", {
          p_story_id: id,
          p_headline: headline,
          p_body: body,
        });
      },
      startWriting: async (id) => {
        await callWorkflowRpc("start_writing", { p_story_id: id });
      },
      submitForReview: async (id) => {
        const story = stories.find((s) => s.id === id);
        if (!story) return;
        await callWorkflowRpc("submit_story", {
          p_story_id: id,
          p_headline: story.title,
          p_body: story.body,
        });
      },
      resubmit: async (id) => {
        const story = stories.find((s) => s.id === id);
        if (!story) return;
        await callWorkflowRpc("submit_story", {
          p_story_id: id,
          p_headline: story.title,
          p_body: story.body,
        });
      },
      startEditing: async (id) => {
        await callWorkflowRpc("start_editing", { p_story_id: id });
      },
      requestRevision: async (id, message) => {
        await callWorkflowRpc("request_revision", {
          p_story_id: id,
          p_feedback_message: message,
        });
      },
      approveStory: async (id) => {
        await callWorkflowRpc("approve_story", { p_story_id: id });
      },
      markPublished: async (id, publishedUrl) => {
        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc("mark_published", {
          p_story_id: id,
          p_published_url: publishedUrl,
        });
        if (rpcError) {
          return { ok: false, error: rpcError.message };
        }
        await loadAll();
        return { ok: true };
      },
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
      uploadMedia: async (storyId, file, metadata) => {
        const validationError = validateMediaFile(file);
        if (validationError) {
          return { ok: false, error: validationError };
        }
        const supabase = createClient();
        const storagePath = buildStoragePath(storyId, file.name);
        const { error: uploadError } = await supabase.storage
          .from(STORY_MEDIA_BUCKET)
          .upload(storagePath, file, { contentType: file.type });
        if (uploadError) {
          return { ok: false, error: uploadError.message };
        }
        const { error: insertError } = await supabase.from("story_media").insert({
          story_id: storyId,
          storage_path: storagePath,
          filename: file.name,
          caption: metadata.caption ?? null,
          credit: metadata.credit ?? null,
          alt_text: metadata.altText ?? null,
          mime_type: file.type,
          uploaded_by: currentUser.id,
        });
        if (insertError) {
          // Don't leave an orphaned object behind if the row couldn't be created.
          await supabase.storage.from(STORY_MEDIA_BUCKET).remove([storagePath]);
          return { ok: false, error: insertError.message };
        }
        await loadAll();
        return { ok: true };
      },
      updateMediaMetadata: async (mediaId, updates) => {
        const supabase = createClient();
        const fields: Record<string, unknown> = {};
        if (updates.caption !== undefined) fields.caption = updates.caption;
        if (updates.credit !== undefined) fields.credit = updates.credit;
        if (updates.altText !== undefined) fields.alt_text = updates.altText;
        const { error: updateError } = await supabase
          .from("story_media")
          .update(fields)
          .eq("id", mediaId);
        if (updateError) {
          return { ok: false, error: updateError.message };
        }
        await loadAll();
        return { ok: true };
      },
      replaceMediaFile: async (media, storyId, file) => {
        const validationError = validateMediaFile(file);
        if (validationError) {
          return { ok: false, error: validationError };
        }
        const supabase = createClient();
        const newPath = buildStoragePath(storyId, file.name);
        const { error: uploadError } = await supabase.storage
          .from(STORY_MEDIA_BUCKET)
          .upload(newPath, file, { contentType: file.type });
        if (uploadError) {
          return { ok: false, error: uploadError.message };
        }
        const { error: updateError } = await supabase
          .from("story_media")
          .update({ storage_path: newPath, filename: file.name, mime_type: file.type })
          .eq("id", media.id);
        if (updateError) {
          await supabase.storage.from(STORY_MEDIA_BUCKET).remove([newPath]);
          return { ok: false, error: updateError.message };
        }
        const { error: removeOldError } = await supabase.storage
          .from(STORY_MEDIA_BUCKET)
          .remove([media.storagePath]);
        await loadAll();
        if (removeOldError) {
          return {
            ok: false,
            error: `Image replaced, but the previous file couldn't be cleaned up: ${removeOldError.message}`,
          };
        }
        return { ok: true };
      },
      deleteMedia: async (media) => {
        const supabase = createClient();
        const { error: removeError } = await supabase.storage
          .from(STORY_MEDIA_BUCKET)
          .remove([media.storagePath]);
        if (removeError) {
          return { ok: false, error: removeError.message };
        }
        const { error: deleteError } = await supabase
          .from("story_media")
          .delete()
          .eq("id", media.id);
        if (deleteError) {
          await loadAll();
          return {
            ok: false,
            error: `The file was removed from storage, but the database record couldn't be deleted: ${deleteError.message}`,
          };
        }
        await loadAll();
        return { ok: true };
      },
      adminDeleteStory: async (id) => {
        const story = stories.find((s) => s.id === id);
        const mediaPaths = story?.media.map((m) => m.storagePath) ?? [];

        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc("admin_delete_story", {
          p_story_id: id,
        });
        if (rpcError) {
          return { ok: false, error: rpcError.message };
        }

        let storageCleanupWarnings: string[] | undefined;
        if (mediaPaths.length > 0) {
          const { error: removeError } = await supabase.storage
            .from(STORY_MEDIA_BUCKET)
            .remove(mediaPaths);
          if (removeError) {
            storageCleanupWarnings = [removeError.message];
          }
        }

        await loadAll();
        return { ok: true, storageCleanupWarnings };
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stories, writers, editors, mediaUrls, isLoading, error, profiles, loadAll, currentUser.id]
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

