"use client";

import { useMemo } from "react";
import { AssignmentsList } from "@/components/dashboard/AssignmentsList";
import { PitchesList } from "@/components/dashboard/PitchesList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { UpcomingList } from "@/components/calendar/UpcomingList";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCurrentUser } from "@/lib/auth-context";
import { buildUpcomingItems, deriveEventItems } from "@/lib/calendar";
import { CalendarEventsProvider, useCalendarEvents } from "@/lib/calendar-events-store";
import { getGreeting } from "@/lib/format";
import { PitchesProvider, usePitches } from "@/lib/pitches-store";
import { useStories } from "@/lib/stories-store";
import type { ActivityItem, DashboardStats, Story, StoryStatus } from "@/lib/types";

const REVIEW_STATUSES: StoryStatus[] = ["Submitted", "Editing", "Needs Revision"];

// "My Stories" surfaces the most actionable work first: revisions and in-progress
// drafts before newly assigned or already-submitted stories.
const MY_STORIES_PRIORITY: StoryStatus[] = ["Needs Revision", "Writing", "Assigned", "Submitted"];

function priorityRank(status: StoryStatus) {
  const index = MY_STORIES_PRIORITY.indexOf(status);
  return index === -1 ? MY_STORIES_PRIORITY.length : index;
}

function DashboardContent() {
  const currentUser = useCurrentUser();
  const isStaff = currentUser.role === "editor" || currentUser.role === "admin";
  const firstName = currentUser.name.split(" ")[0];

  const { stories, isLoading: storiesLoading, error: storiesError } = useStories();
  const { events, isLoading: eventsLoading, error: eventsError } = useCalendarEvents();
  const {
    myPitches,
    reviewQueue,
    isLoading: pitchesLoading,
    error: pitchesError,
  } = usePitches();

  const stats = useMemo<DashboardStats>(() => {
    return {
      activeStories: stories.filter((s) => s.status !== "Published").length,
      awaitingReview: stories.filter((s) => s.status === "Submitted" || s.status === "Editing")
        .length,
      needsRevision: stories.filter((s) => s.status === "Needs Revision").length,
      approved: stories.filter((s) => s.status === "Approved").length,
    };
  }, [stories]);

  const myStories = useMemo(
    () =>
      stories
        .filter((s) => s.writerId === currentUser.id && s.status !== "Published")
        .sort((a, b) => priorityRank(a.status) - priorityRank(b.status)),
    [stories, currentUser.id]
  );

  const deadlines = useMemo(
    () =>
      [...stories]
        .filter(
          (s): s is Story & { dueDate: string } => s.status !== "Published" && s.dueDate !== null
        )
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5),
    [stories]
  );

  const upcomingEvents = useMemo(() => buildUpcomingItems(deriveEventItems(events), 5), [events]);

  const reviewPreview = useMemo(
    () => stories.filter((s) => REVIEW_STATUSES.includes(s.status)).slice(0, 5),
    [stories]
  );

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];
    for (const story of stories) {
      for (const version of story.versions) {
        items.push({
          id: version.id,
          message: `${story.title}: Version ${version.version} submitted`,
          timestamp: version.timestamp,
          type: "submission",
        });
      }
      for (const entry of story.feedback) {
        items.push({
          id: entry.id,
          message: `${entry.editor} requested revisions on ${story.title}`,
          timestamp: entry.timestamp,
          type: "revision",
        });
      }
    }
    return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 6);
  }, [stories]);

  const isLoading = storiesLoading || eventsLoading || pitchesLoading;
  const error = storiesError ?? eventsError ?? pitchesError;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${getGreeting()}, ${firstName}`}
        description="Overview of what's happening in the newsroom."
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Couldn&apos;t load newsroom data: {error}
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-foreground/50">Loading dashboard…</p>
      ) : (
        <>
          <StatsGrid stats={stats} />

          <AssignmentsList
            title="My Stories"
            assignments={myStories}
            emptyLabel="No stories assigned to you right now."
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <UpcomingDeadlines deadlines={deadlines} />
            <UpcomingList
              items={upcomingEvents}
              title="Calendar"
              emptyLabel="No upcoming coverage or newsroom events."
            />
          </div>

          <PitchesList
            title="My Pitches"
            pitches={myPitches.slice(0, 5)}
            emptyLabel="You haven't submitted any pitches yet."
          />

          {isStaff ? (
            <>
              <AssignmentsList
                title="Review Queue"
                assignments={reviewPreview}
                emptyLabel="Nothing awaiting review."
              />
              <PitchesList
                title="Pitches to Review"
                pitches={reviewQueue.slice(0, 5)}
                emptyLabel="No pitches awaiting review."
                showSubmitter
              />
            </>
          ) : null}

          <RecentActivity activity={recentActivity} />
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <PitchesProvider>
      <CalendarEventsProvider>
        <DashboardContent />
      </CalendarEventsProvider>
    </PitchesProvider>
  );
}

