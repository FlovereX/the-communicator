import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Sidebar } from "@/components/navigation/Sidebar";
import { CurrentUserProvider } from "@/lib/auth-context";
import { NotificationsProvider } from "@/lib/notifications-store";
import { StoriesProvider } from "@/lib/stories-store";
import { createClient } from "@/lib/supabase/server";
import { mapProfileToCurrentUser } from "@/lib/supabase/mappers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Communicator Newsroom",
  description: "Newsroom management dashboard for The Communicator.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUser = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profile && profile.status === "active") {
      currentUser = mapProfileToCurrentUser(profile);
    }
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background">
        {currentUser ? (
          <CurrentUserProvider user={currentUser}>
            <StoriesProvider>
              <NotificationsProvider>
                <Sidebar />
                <div className="flex min-h-full flex-col md:pl-64">
                  <div className="sticky top-0 z-20 hidden items-center justify-end border-b border-border bg-surface px-6 py-2.5 md:flex">
                    <NotificationBell />
                  </div>
                  <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10">
                    {children}
                  </main>
                </div>
              </NotificationsProvider>
            </StoriesProvider>
          </CurrentUserProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}

