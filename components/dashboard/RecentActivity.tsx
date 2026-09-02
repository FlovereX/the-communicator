import { Card } from "@/components/shared/PageHeader";
import { formatRelativeTime } from "@/lib/format";
import type { ActivityItem, ActivityType } from "@/lib/types";

const DOT_COLOR: Record<ActivityType, string> = {
  revision: "bg-red-500",
  assignment: "bg-blue-500",
  draft: "bg-amber-500",
  approval: "bg-emerald-500",
  submission: "bg-indigo-500",
};

export function RecentActivity({ activity }: { activity: ActivityItem[] }) {
  return (
    <Card>
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Recent Activity
        </h2>
      </div>
      <ul className="divide-y divide-border">
        {activity.map((item) => (
          <li key={item.id} className="flex items-start gap-3 px-5 py-3.5">
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[item.type]}`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm text-foreground">{item.message}</p>
              <p className="mt-0.5 text-xs text-foreground/45">
                {formatRelativeTime(item.timestamp)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
