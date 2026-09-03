import type {
  DbStoryStatus,
  ProfileRow,
  StoryFeedbackRow,
  StoryMediaRow,
  StoryRow,
  StorySourceRow,
  StoryVersionRow,
} from "./types";
import type {
  CurrentUser,
  FeedbackEntry,
  MediaItem,
  Source,
  Story,
  StoryStatus,
  VersionEntry,
} from "@/lib/types";

export const STATUS_TO_DB: Record<StoryStatus, DbStoryStatus> = {
  Idea: "idea",
  Assigned: "assigned",
  Writing: "writing",
  Submitted: "submitted",
  Editing: "editing",
  "Needs Revision": "needs_revision",
  Approved: "approved",
  Published: "published",
};

export const STATUS_FROM_DB: Record<DbStoryStatus, StoryStatus> = {
  idea: "Idea",
  assigned: "Assigned",
  writing: "Writing",
  submitted: "Submitted",
  editing: "Editing",
  needs_revision: "Needs Revision",
  approved: "Approved",
  published: "Published",
};

function countWords(body: string | null) {
  if (!body) return undefined;
  const count = body.trim().split(/\s+/).filter(Boolean).length;
  return count || undefined;
}

export function mapProfileToCurrentUser(profile: ProfileRow): CurrentUser {
  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    avatarUrl: profile.avatar_url,
  };
}

export interface StoryRelations {
  sources: StorySourceRow[];
  feedback: StoryFeedbackRow[];
  versions: StoryVersionRow[];
  media: StoryMediaRow[];
}

/** Joins flat table rows into the UI-facing `Story` shape, resolving profile ids to display names. */
export function mapStoryRow(
  row: StoryRow,
  profilesById: Map<string, ProfileRow>,
  relations: StoryRelations
): Story {
  const writer = row.writer_id ? profilesById.get(row.writer_id) : undefined;
  const editor = row.editor_id ? profilesById.get(row.editor_id) : undefined;

  const sources: Source[] = relations.sources
    .filter((s) => s.story_id === row.id)
    .map((s) => ({
      id: s.id,
      name: s.name,
      organization: s.organization,
      url: s.url ?? undefined,
      notes: s.notes ?? undefined,
    }));

  const feedback: FeedbackEntry[] = relations.feedback
    .filter((f) => f.story_id === row.id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((f) => ({
      id: f.id,
      editor: profilesById.get(f.created_by)?.full_name ?? "Editor",
      timestamp: f.created_at,
      message: f.message,
    }));

  const versions: VersionEntry[] = relations.versions
    .filter((v) => v.story_id === row.id)
    .sort((a, b) => a.version_number - b.version_number)
    .map((v) => ({
      id: v.id,
      version: v.version_number,
      timestamp: v.created_at,
    }));

  const media: MediaItem[] = relations.media
    .filter((m) => m.story_id === row.id)
    .map((m) => ({
      id: m.id,
      filename: m.filename,
      storagePath: m.storage_path,
      caption: m.caption,
      credit: m.credit,
      altText: m.alt_text,
      mimeType: m.mime_type,
      createdAt: m.created_at,
    }));

  return {
    id: row.id,
    title: row.headline,
    section: row.section,
    writer: writer?.full_name ?? "Unassigned",
    writerId: row.writer_id,
    editor: editor?.full_name ?? "Unassigned",
    editorId: row.editor_id,
    dueDate: row.deadline,
    status: STATUS_FROM_DB[row.status],
    wordCount: countWords(row.body),
    body: row.body ?? "",
    assignmentNotes: row.assignment_notes ?? undefined,
    sources,
    media,
    feedback,
    versions,
  };
}
