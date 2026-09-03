import type { Issue, Pitch } from "./types";

/** Pitches and Issues remain placeholder features for now. */
export const pitches: Pitch[] = [
  {
    id: "pitch-1",
    title: "Student Art Show Opens Downtown",
    section: "Arts & Culture",
    submittedBy: "Priya Anand",
    submittedDate: "2026-08-30",
    status: "Pending",
    summary:
      "Local gallery is featuring work from five Chattanooga State students through October.",
  },
  {
    id: "pitch-2",
    title: "Dining Hall Menu Changes",
    section: "Campus Life",
    submittedBy: "Maria Chen",
    submittedDate: "2026-08-28",
    status: "Pending",
    summary: "New vendor contract brings expanded vegetarian and halal options this fall.",
  },
  {
    id: "pitch-3",
    title: "Esports Team Heads to Regionals",
    section: "Sports",
    submittedBy: "Devon Marsh",
    submittedDate: "2026-08-26",
    status: "Approved",
    summary: "The Rocket Esports team qualified for the regional tournament in Knoxville.",
  },
  {
    id: "pitch-4",
    title: "Parking Deck Construction Delays",
    section: "News",
    submittedBy: "Maria Chen",
    submittedDate: "2026-08-20",
    status: "Rejected",
    summary: "Follow-up on construction timeline; editor asked to fold into existing story.",
  },
];

export const issues: Issue[] = [
  {
    id: "issue-0",
    name: "Welcome Back Issue",
    publishDate: "2026-08-24",
    status: "Published",
    storyCount: 6,
  },
  {
    id: "issue-1",
    name: "September Issue No. 1",
    publishDate: "2026-09-14",
    status: "In Progress",
    storyCount: 7,
  },
  {
    id: "issue-2",
    name: "September Issue No. 2",
    publishDate: "2026-09-28",
    status: "Planning",
    storyCount: 2,
  },
];
