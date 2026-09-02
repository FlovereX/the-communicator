import { PageHeader } from "@/components/shared/PageHeader";
import { CalendarList } from "@/components/calendar/CalendarList";
import { stories } from "@/lib/mock-data";

export default function CalendarPage() {
  const scheduledStories = [...stories].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  );

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Story deadlines across the newsroom, by date."
      />
      <CalendarList stories={scheduledStories} />
    </div>
  );
}
