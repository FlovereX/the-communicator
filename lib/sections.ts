export const NEWSROOM_SECTIONS = [
  "Campus Life",
  "News",
  "Sports",
  "Academics",
  "Arts & Culture",
  "Opinion",
  "Student Voice",
  "Features",
] as const;

export type NewsroomSection = (typeof NEWSROOM_SECTIONS)[number];
