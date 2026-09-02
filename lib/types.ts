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
  role: string;
  url?: string;
  notes?: string;
}

export interface MediaItem {
  id: string;
  caption: string;
  credit: string;
  alt: string;
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
  label: string;
  timestamp: string;
}

export interface Story {
  id: string;
  title: string;
  section: string;
  writer: string;
  editor: string;
  dueDate: string;
  status: StoryStatus;
  wordCount?: number;
  issueId?: string;
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
  section: string;
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

export interface CurrentUser {
  name: string;
  role: string;
}
