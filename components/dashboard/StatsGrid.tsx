import { Card } from "@/components/shared/PageHeader";
import type { DashboardStats } from "@/lib/types";

const STAT_CONFIG: Array<{
  key: keyof DashboardStats;
  label: string;
  accent: string;
}> = [
  { key: "activeStories", label: "Active Stories", accent: "text-navy" },
  { key: "awaitingReview", label: "Awaiting Review", accent: "text-indigo-700 dark:text-indigo-400" },
  { key: "needsRevision", label: "Needs Revision", accent: "text-red-700 dark:text-red-400" },
  { key: "approved", label: "Approved", accent: "text-emerald-700 dark:text-emerald-400" },
];

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STAT_CONFIG.map(({ key, label, accent }) => (
        <Card key={key} className="px-5 py-4">
          <p className="text-sm text-foreground/55">{label}</p>
          <p className={`mt-2 font-serif text-3xl font-semibold ${accent}`}>
            {stats[key]}
          </p>
        </Card>
      ))}
    </div>
  );
}
