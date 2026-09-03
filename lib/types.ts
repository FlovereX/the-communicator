import type { AccountStatus, CalendarEventType, NotificationType } from "./supabase/types";
import type { NewsroomSection } from "./sections";

export const STORY_STATUSES = [
  "Idea",
  "Assigned",
  "Writing",
  "Submitted",
  "Editing",
  "Needs Revision",
  "Approved",
  "Published",
] as const;

export type StoryStatus = (typeof STORY_STATUSES)[number];

export interface Source {
  id: string;
  name: string;
  organization: string | null;
  url?: string;
  notes?: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  storagePath: string;
  caption: string | null;
  credit: string | null;
  altText: string | null;
  mimeType: string | null;
  createdAt: string;
}

export interface FeedbackEntry {
  id: string;
  editor: string;
  timestamp: string;
  message: string;
}

export interface VersionEntry {
  id: string;
  version: number;
  timestamp: string;
}

export interface Story {
  id: string;
  title: string;
  section: string;
  writer: string;
  writerId: string | null;
  editor: string;
  editorId: string | null;
  dueDate: string | null;
  status: StoryStatus;
  wordCount?: number;
  body: string;
  assignmentNotes?: string;
  publishedAt: string | null;
  publishedUrl: string | null;
  sources: Source[];
  media: MediaItem[];
  feedback: FeedbackEntry[];
  versions: VersionEntry[];
}


export type PitchStatus = "Submitted" | "Approved" | "Rejected";

export interface Pitch {
  id: string;
  title: string;
  section: NewsroomSection;
  summary: string;
  whyItMatters: string;
  possibleSources: string | null;
  submittedBy: string;
  submittedById: string;
  status: PitchStatus;
  editorFeedback: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  storyId: string | null;
  createdAt: string;
}

export type ActivityType = "revision" | "assignment" | "draft" | "approval" | "submission";

export interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type: ActivityType;
}

export interface DashboardStats {
  activeStories: number;
  awaitingReview: number;
  needsRevision: number;
  approved: number;
}

export type UserRole = "writer" | "editor" | "admin";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  /** Resolved signed URL for display — never the raw private Storage path. */
  avatarUrl: string | null;
  /** Raw storage path (profiles.avatar_url), needed only for replace/remove operations. */
  avatarPath: string | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  storyId: string | null;
  pitchId: string | null;
  actorId: string | null;
  readAt: string | null;
  createdAt: string;
}

/** Client-only — derived from StoriesProvider data, never persisted. */
export interface DeadlineReminder {
  id: string;
  storyId: string;
  title: string;
  message: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  eventType: CalendarEventType;
  startAt: string;
  endAt: string | null;
  location: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Unified shape rendered by the Calendar's month grid, day panel, and upcoming list. */
export type CalendarItem =
  | {
      kind: "deadline";
      id: string;
      date: string;
      storyId: string;
      title: string;
      section: string;
      status: StoryStatus;
    }
  | {
      kind: "coverage" | "newsroom";
      id: string;
      date: string;
      eventId: string;
      title: string;
      startAt: string;
      endAt: string | null;
      location: string | null;
      description: string | null;
    };
