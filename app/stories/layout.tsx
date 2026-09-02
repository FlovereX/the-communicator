import { StoriesProvider } from "@/lib/stories-store";

export default function StoriesLayout({ children }: LayoutProps<"/stories">) {
  return <StoriesProvider>{children}</StoriesProvider>;
}
