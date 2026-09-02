import { AssignmentsList } from "@/components/dashboard/AssignmentsList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { getGreeting } from "@/lib/format";
import {
  currentUser,
  dashboardStats,
  myAssignments,
  recentActivity,
  upcomingDeadlines,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const firstName = currentUser.name.split(" ")[0];

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

      <StatsGrid stats={dashboardStats} />

      <AssignmentsList assignments={myAssignments} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingDeadlines deadlines={upcomingDeadlines} />
        <RecentActivity activity={recentActivity} />
      </div>
    </div>
  );
}
