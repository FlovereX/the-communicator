import type { AccountStatus } from "./supabase/types";
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
  dueDate: string;
  status: StoryStatus;
  wordCount?: number;
  body: string;
  assignmentNotes?: string;
  sources: Source[];
  media: MediaItem[];
  feedback: FeedbackEntry[];
  versions: VersionEntry[];
}


export interface Pitch {
  id: string;
  title: string;
  section: NewsroomSection;
  submittedBy: string;
  submittedDate: string;
  status: "Pending" | "Approved" | "Rejected";
  summary: string;
}

export interface Issue {
  id: string;
  name: string;
  publishDate: string;
  status: "Planning" | "In Progress" | "In Review" | "Published";
  storyCount: number;
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
  avatarUrl: string | null;
}
