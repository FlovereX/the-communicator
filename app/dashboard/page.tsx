"use client";

import { useMemo } from "react";
import { AssignmentsList } from "@/components/dashboard/AssignmentsList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { useCurrentUser } from "@/lib/auth-context";
import { getGreeting } from "@/lib/format";
import { useStories } from "@/lib/stories-store";
import type { ActivityItem, DashboardStats } from "@/lib/types";

export default function DashboardPage() {
  const currentUser = useCurrentUser();
  const { stories, isLoading, error } = useStories();
  const firstName = currentUser.name.split(" ")[0];
  const isWriter = currentUser.role === "writer";

  const stats = useMemo<DashboardStats>(() => {
    return {
      activeStories: stories.filter((s) => s.status !== "Published").length,
      awaitingReview: stories.filter((s) => s.status === "Submitted" || s.status === "Editing")
        .length,
      needsRevision: stories.filter((s) => s.status === "Needs Revision").length,
      approved: stories.filter((s) => s.status === "Approved").length,
    };
  }, [stories]);

  const assignments = useMemo(
    () =>
      stories.filter((s) => s.writerId === currentUser.id && s.status !== "Published"),
    [stories, currentUser.id]
  );

  const deadlines = useMemo(
    () =>
      [...stories]
        .filter(
          (s): s is (typeof stories)[number] & { dueDate: string } =>
            s.status !== "Published" && s.dueDate !== null
        )
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5),
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1.5 text-sm text-foreground/60">
          Overview of what&apos;s happening in the newsroom.
        </p>
      </div>

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
            title={isWriter ? "My Assignments" : "Awaiting Review"}
            assignments={isWriter ? assignments : stories.filter(
              (s) => s.status === "Submitted" || s.status === "Editing"
            )}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <UpcomingDeadlines deadlines={deadlines} />
            <RecentActivity activity={recentActivity} />
          </div>
        </>
      )}
    </div>
  );
}

