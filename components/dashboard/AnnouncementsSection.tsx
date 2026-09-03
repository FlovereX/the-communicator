import Link from "next/link";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { Card } from "@/components/shared/PageHeader";
import type { Announcement } from "@/lib/types";

const PRIORITY_RANK: Record<Announcement["priority"], number> = {
  urgent: 0,
  important: 1,
  normal: 2,
};

/** Callers must pass only currentAnnouncements — expired rows (visible to staff for management) must never show here. */
export function AnnouncementsSection({ announcements }: { announcements: Announcement[] }) {
  const topAnnouncements = [...announcements]
    .sort((a, b) => {
      const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return rankDiff !== 0 ? rankDiff : b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, 5);

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">Announcements</h2>
        <Link href="/announcements" className="text-xs font-medium text-navy hover:underline">
          View all announcements
        </Link>
      </div>
      <div className="flex flex-col gap-4 p-5">
        {topAnnouncements.length === 0 ? (
          <p className="text-sm text-foreground/50">No announcements right now.</p>
        ) : (
          topAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))
        )}
      </div>
    </Card>
  );
}
