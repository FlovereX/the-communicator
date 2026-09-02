import type {
  ActivityItem,
  CurrentUser,
  DashboardStats,
  Issue,
  Pitch,
  Story,
} from "./types";

export const currentUser: CurrentUser = {
  name: "Kieth Flores",
  role: "Editor",
};

export const dashboardStats: DashboardStats = {
  activeStories: 12,
  awaitingReview: 4,
  needsRevision: 2,
  approved: 7,
};

export const stories: Story[] = [
  {
    id: "story-1",
    title: "Psych Club Spotlight",
    section: "Campus Life",
    writer: "Kieth Flores",
    editor: "Jordan Lee",
    dueDate: "2026-09-08",
    status: "Writing",
    wordCount: 420,
    issueId: "issue-1",
    assignmentNotes: "Profile the Psych Club's growth this semester. Talk to the president and at least one new member.",
    body: "The Psychology Club has more than doubled its membership since last spring, growing from a dozen regulars to nearly thirty students who meet weekly in the Humanities building.\n\nClub president Alicia Reyes says the jump has a lot to do with word of mouth. \"People are realizing this isn't just a resume line,\" she said. \"We're doing real discussions about mental health on campus.\"",
    sources: [
      {
        id: "story-1-s1",
        name: "Alicia Reyes",
        role: "President, Psych Club",
        notes: "Best reached after 3pm on weekdays.",
      },
    ],
    media: [],
    feedback: [],
    versions: [],
  },
  {
    id: "story-2",
    title: "Volleyball Season Opener",
    section: "Sports",
    writer: "Kieth Flores",
    editor: "Jordan Lee",
    dueDate: "2026-09-05",
    status: "Needs Revision",
    wordCount: 610,
    issueId: "issue-1",
    assignmentNotes: "Cover the season opener against Cleveland State. Recap the match and preview the season.",
    body: "The Chattanooga State volleyball team opened its season Friday night with a hard-fought four-set win over Cleveland State, setting an energetic tone for a squad that returns six starters from last year's regional semifinal run.\n\nHead coach Renee Ostrander said the team's serve-receive was the difference in the fourth set. \"We settled down and trusted our system,\" she said.\n\nThe Rockets host their home opener next Thursday at 6 p.m. in the Fitness Center gym.",
    sources: [
      {
        id: "story-2-s1",
        name: "Renee Ostrander",
        role: "Head Coach, Volleyball",
        notes: "Prefers questions submitted by email first.",
      },
    ],
    media: [
      {
        id: "story-2-m1",
        caption: "The Rockets celebrate a point in the third set.",
        credit: "Athletics Dept.",
        alt: "Volleyball players celebrating on court after scoring a point.",
      },
    ],
    feedback: [
      {
        id: "story-2-f1",
        editor: "Jordan Lee",
        timestamp: "2026-09-07T15:42:00",
        message:
          "The opening is strong, but can we include a quote from the club president? Also double-check the meeting time.",
      },
    ],
    versions: [
      { id: "story-2-v1", version: 1, label: "Submitted", timestamp: "2026-09-07T11:17:00" },
      { id: "story-2-v2", version: 2, label: "Revision Requested", timestamp: "2026-09-07T15:42:00" },
      { id: "story-2-v3", version: 3, label: "Resubmitted", timestamp: "2026-09-08T14:18:00" },
    ],
  },
  {
    id: "story-3",
    title: "Club Fest 2026",
    section: "Campus",
    writer: "Kieth Flores",
    editor: "Jordan Lee",
    dueDate: "2026-09-10",
    status: "Assigned",
    issueId: "issue-1",
    assignmentNotes: "Preview Club Fest — get a full list of participating clubs and a quote from Student Life.",
    body: "",
    sources: [],
    media: [],
    feedback: [],
    versions: [],
  },
  {
    id: "story-4",
    title: "New Financial Aid Office Hours",
    section: "News",
    writer: "Maria Chen",
    editor: "Kieth Flores",
    dueDate: "2026-09-04",
    status: "Submitted",
    wordCount: 380,
    issueId: "issue-1",
    body: "The Financial Aid office is extending its walk-in hours through the end of September to help students navigate FAFSA verification requests, a spokesperson confirmed this week.\n\nStarting Monday, the office will be open until 6 p.m. on Tuesdays and Thursdays, up from its usual 4:30 p.m. close.",
    sources: [
      {
        id: "story-4-s1",
        name: "Terrence Boyd",
        role: "Director, Financial Aid",
        url: "https://www.chattanoogastate.edu/financial-aid",
      },
    ],
    media: [],
    feedback: [],
    versions: [{ id: "story-4-v1", version: 1, label: "Submitted", timestamp: "2026-09-01T09:00:00" }],
  },
  {
    id: "story-5",
    title: "Faculty Q&A: Nursing Program Expansion",
    section: "Academics",
    writer: "Devon Marsh",
    editor: "Kieth Flores",
    dueDate: "2026-09-06",
    status: "Editing",
    wordCount: 720,
    issueId: "issue-1",
    body: "The nursing program will add 40 seats to its fall cohort next year, part of a broader push to address a regional shortage of registered nurses, according to program director Dr. Susan Waller.\n\n\"We've never had this level of demand,\" Waller said in an interview. \"The waitlist told us everything we needed to know.\"\n\nThe expansion will require two additional clinical instructors and a renovated simulation lab, both expected to be in place by next August.",
    sources: [
      {
        id: "story-5-s1",
        name: "Dr. Susan Waller",
        role: "Director, Nursing Program",
      },
    ],
    media: [
      {
        id: "story-5-m1",
        caption: "Dr. Waller in the nursing simulation lab.",
        credit: "Communications Office",
        alt: "Nursing program director standing beside simulation equipment.",
      },
    ],
    feedback: [],
    versions: [
      { id: "story-5-v1", version: 1, label: "Submitted", timestamp: "2026-08-30T10:00:00" },
      { id: "story-5-v2", version: 2, label: "Editing Started", timestamp: "2026-08-31T09:00:00" },
    ],
  },
  {
    id: "story-6",
    title: "Student Art Show Opens Downtown",
    section: "Arts & Culture",
    writer: "Priya Anand",
    editor: "Kieth Flores",
    dueDate: "2026-09-12",
    status: "Idea",
    assignmentNotes: "Pitch from Priya — gallery show featuring five students, runs through October.",
    body: "",
    sources: [],
    media: [],
    feedback: [],
    versions: [],
  },
  {
    id: "story-7",
    title: "Campus Parking Changes for Fall",
    section: "News",
    writer: "Maria Chen",
    editor: "Kieth Flores",
    dueDate: "2026-08-29",
    status: "Approved",
    wordCount: 540,
    issueId: "issue-1",
    body: "Campus Police have redrawn several visitor parking zones ahead of the fall semester, shifting roughly 60 spaces near the library to student permit-only status.\n\nThe change follows complaints last spring that visitors were displacing students during peak class hours.",
    sources: [
      {
        id: "story-7-s1",
        name: "Sgt. Dana Whitfield",
        role: "Campus Police",
      },
    ],
    media: [],
    feedback: [],
    versions: [
      { id: "story-7-v1", version: 1, label: "Submitted", timestamp: "2026-08-26T09:00:00" },
      { id: "story-7-v2", version: 2, label: "Approved", timestamp: "2026-08-27T13:00:00" },
    ],
  },
  {
    id: "story-8",
    title: "Men's Soccer Preview",
    section: "Sports",
    writer: "Devon Marsh",
    editor: "Kieth Flores",
    dueDate: "2026-08-25",
    status: "Published",
    wordCount: 490,
    issueId: "issue-0",
    body: "The men's soccer team enters the season with a rebuilt midfield and a new set of expectations after last year's near-miss conference finish.\n\nCoach Alan Petrie says depth is the team's biggest strength this fall, with eight returning upperclassmen anchoring the rotation.",
    sources: [
      {
        id: "story-8-s1",
        name: "Alan Petrie",
        role: "Head Coach, Men's Soccer",
      },
    ],
    media: [
      {
        id: "story-8-m1",
        caption: "Midfielders run a passing drill during preseason practice.",
        credit: "Athletics Dept.",
        alt: "Soccer players running a passing drill on the practice field.",
      },
    ],
    feedback: [],
    versions: [
      { id: "story-8-v1", version: 1, label: "Submitted", timestamp: "2026-08-19T09:00:00" },
      { id: "story-8-v2", version: 2, label: "Approved", timestamp: "2026-08-20T09:00:00" },
      { id: "story-8-v3", version: 3, label: "Published", timestamp: "2026-08-25T07:00:00" },
    ],
  },
  {
    id: "story-9",
    title: "Welcome Week Recap",
    section: "Campus Life",
    writer: "Priya Anand",
    editor: "Kieth Flores",
    dueDate: "2026-08-22",
    status: "Published",
    wordCount: 610,
    issueId: "issue-0",
    body: "More than 900 students turned out across Welcome Week's five days of events, from the Tuesday night carnival to Friday's involvement fair in the quad.\n\nStudent Life coordinator Beth Ann Foster called it the best-attended Welcome Week since before the pandemic.",
    sources: [
      {
        id: "story-9-s1",
        name: "Beth Ann Foster",
        role: "Coordinator, Student Life",
      },
    ],
    media: [
      {
        id: "story-9-m1",
        caption: "Students line up for the Tuesday night carnival.",
        credit: "Communications Office",
        alt: "Students waiting in line at an outdoor evening carnival.",
      },
    ],
    feedback: [],
    versions: [
      { id: "story-9-v1", version: 1, label: "Submitted", timestamp: "2026-08-18T09:00:00" },
      { id: "story-9-v2", version: 2, label: "Approved", timestamp: "2026-08-19T09:00:00" },
      { id: "story-9-v3", version: 3, label: "Published", timestamp: "2026-08-22T07:00:00" },
    ],
  },
];

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

export const recentActivity: ActivityItem[] = [
  {
    id: "activity-1",
    message: "Editor requested revisions on Volleyball Season Opener",
    timestamp: "2026-09-02T09:15:00",
    type: "revision",
  },
  {
    id: "activity-2",
    message: "Club Fest 2026 was assigned",
    timestamp: "2026-09-01T16:40:00",
    type: "assignment",
  },
  {
    id: "activity-3",
    message: "Psych Club Spotlight draft was saved",
    timestamp: "2026-09-01T11:05:00",
    type: "draft",
  },
  {
    id: "activity-4",
    message: "Campus Parking Changes for Fall was approved",
    timestamp: "2026-08-31T14:20:00",
    type: "approval",
  },
  {
    id: "activity-5",
    message: "New Financial Aid Office Hours submitted for review",
    timestamp: "2026-08-30T10:00:00",
    type: "submission",
  },
];

/** Assignments belonging to the current user, shown on the dashboard. */
export const myAssignments: Story[] = stories.filter(
  (story) => story.writer === currentUser.name && story.status !== "Published"
);

export const upcomingDeadlines: Story[] = [...stories]
  .filter((story) => story.status !== "Published")
  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  .slice(0, 5);
