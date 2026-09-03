"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import { CalendarEventModal } from "@/components/calendar/CalendarEventModal";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DayDetailsPanel } from "@/components/calendar/DayDetailsPanel";
import { UpcomingList } from "@/components/calendar/UpcomingList";
import { useCurrentUser } from "@/lib/auth-context";
import {
  buildMonthGrid,
  buildUpcomingItems,
  deriveDeadlineItems,
  deriveEventItems,
  groupItemsByDate,
  toDateKey,
} from "@/lib/calendar";
import { CalendarEventsProvider, useCalendarEvents } from "@/lib/calendar-events-store";
import { useStories } from "@/lib/stories-store";

function CalendarPageContent() {
  const currentUser = useCurrentUser();
  const isStaff = currentUser.role === "editor" || currentUser.role === "admin";
  const { stories, isLoading: storiesLoading, error: storiesError } = useStories();
  const { events, isLoading: eventsLoading, error: eventsError } = useCalendarEvents();

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const allItems = useMemo(
    () => [...deriveDeadlineItems(stories), ...deriveEventItems(events)],
    [stories, events]
  );
  const itemsByDate = useMemo(() => groupItemsByDate(allItems), [allItems]);
  const days = useMemo(
    () => buildMonthGrid(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth]
  );
  const upcomingItems = useMemo(() => buildUpcomingItems(allItems, 8), [allItems]);
  const selectedDayItems = itemsByDate.get(selectedDateKey) ?? [];
  const editingEvent = editingEventId
    ? (events.find((event) => event.id === editingEventId) ?? undefined)
    : undefined;

  function changeMonth(delta: number) {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function goToToday() {
    const now = new Date();
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(toDateKey(now));
  }

  const isLoading = storiesLoading || eventsLoading;
  const error = storiesError ?? eventsError;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendar"
        description="Story deadlines, coverage, and newsroom events."
        action={
          isStaff ? (
            <Button variant="primary" onClick={() => setIsAddingEvent(true)}>
              + Add Event
            </Button>
          ) : undefined
        }
      />
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Couldn&apos;t load the calendar: {error}
        </div>
      ) : null}
      {isLoading ? (
        <p className="text-sm text-foreground/50">Loading calendar…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <CalendarGrid
              visibleMonth={visibleMonth}
              days={days}
              itemsByDate={itemsByDate}
              selectedDateKey={selectedDateKey}
              onSelectDate={setSelectedDateKey}
              onPrevMonth={() => changeMonth(-1)}
              onNextMonth={() => changeMonth(1)}
              onToday={goToToday}
            />
            <DayDetailsPanel
              dateKey={selectedDateKey}
              items={selectedDayItems}
              isStaff={isStaff}
              onEditEvent={setEditingEventId}
            />
          </div>
          <UpcomingList items={upcomingItems} />
        </div>
      )}
      {isAddingEvent ? (
        <CalendarEventModal defaultDate={selectedDateKey} onClose={() => setIsAddingEvent(false)} />
      ) : null}
      {editingEvent ? (
        <CalendarEventModal event={editingEvent} onClose={() => setEditingEventId(null)} />
      ) : null}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <CalendarEventsProvider>
      <CalendarPageContent />
    </CalendarEventsProvider>
  );
}

