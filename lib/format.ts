const DUE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

/** Parses a "YYYY-MM-DD" date without shifting to the local timezone. */
function parseDateOnly(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDueDate(date: string) {
  return DUE_DATE_FORMATTER.format(parseDateOnly(date));
}

export function formatShortDate(date: string) {
  return SHORT_DATE_FORMATTER.format(parseDateOnly(date));
}

export function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp);
  return `${SHORT_DATE_FORMATTER.format(date)} at ${TIME_FORMATTER.format(date)}`;
}

/** "Just now" / "5m ago" / "2h ago" / "Yesterday" / short date, without a date library. */
export function formatNotificationTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86400000);
  if (diffDays === 1) return "Yesterday";

  return SHORT_DATE_FORMATTER.format(date);
}

export function getGreeting(hour: number = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
