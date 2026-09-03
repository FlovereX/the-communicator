import { AnnouncementsProvider } from "@/lib/announcements-store";

export default function AnnouncementsLayout({ children }: LayoutProps<"/announcements">) {
  return <AnnouncementsProvider>{children}</AnnouncementsProvider>;
}
