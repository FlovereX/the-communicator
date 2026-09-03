/**
 * Hand-written types mirroring the production Supabase schema.
 * Every other file consumes these through lib/supabase/mappers.ts.
 */

export type ProfileRole = "writer" | "editor" | "admin";

export type DbStoryStatus =
  | "idea"
  | "assigned"
  | "writing"
  | "submitted"
  | "editing"
  | "needs_revision"
  | "approved"
  | "published";

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: ProfileRole;
  avatar_url: string | null;
  created_at: string;
}

export interface StoryRow {
  id: string;
  headline: string;
  body: string | null;
  section: string;
  status: DbStoryStatus;
  writer_id: string | null;
  editor_id: string | null;
  deadline: string;
  assignment_notes: string | null;
  created_by: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StorySourceRow {
  id: string;
  story_id: string;
  name: string;
  organization: string | null;
  url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface StoryFeedbackRow {
  id: string;
  story_id: string;
  message: string;
  created_by: string;
  created_at: string;
}

export interface StoryVersionRow {
  id: string;
  story_id: string;
  version_number: number;
  headline: string;
  body: string;
  created_by: string | null;
  created_at: string;
}

export interface StoryMediaRow {
  id: string;
  story_id: string;
  storage_path: string;
  filename: string;
  caption: string | null;
  credit: string | null;
  alt_text: string | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}


