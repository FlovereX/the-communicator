"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { useCurrentUser } from "@/lib/auth-context";
import { adminNavItems, editorNavItems, mainNavItems, type NavItem } from "@/lib/navigation";
import { signOut } from "@/lib/supabase/actions";
import { cn } from "@/lib/utils";

function Brand() {
  return (
    <div className="shrink-0 px-6 pt-7 pb-5">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-navy/70">
        THE COMMUNICATOR
      </p>
      <p className="mt-0.5 font-serif text-xl font-bold tracking-tight text-navy">
        NEWSROOM
      </p>
    </div>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-navy text-navy-foreground"
          : "text-foreground/70 hover:bg-navy/5 hover:text-foreground"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {item.label}
    </Link>
  );
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const currentUser = useCurrentUser();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const showEditorSection = currentUser.role !== "writer";
  const showAdminSection = currentUser.role === "admin";

  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4">
      <div className="flex flex-col gap-1">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      {showEditorSection ? (
        <div className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold tracking-[0.15em] text-foreground/40">
            EDITOR
          </p>
          {editorNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
      {showAdminSection ? (
        <div className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold tracking-[0.15em] text-foreground/40">
            ADMIN
          </p>
          {adminNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </nav>
  );
}

function SidebarFooter() {
  const currentUser = useCurrentUser();
  return (
    <div className="shrink-0 border-t border-border px-6 py-4">
      <p className="text-sm font-semibold text-foreground">{currentUser.name}</p>
      <p className="text-xs capitalize text-foreground/50">{currentUser.role}</p>
      <form action={signOut} className="mt-3">
        <button
          type="submit"
          className="text-xs font-medium text-foreground/60 hover:text-foreground hover:underline"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [renderedPathname, setRenderedPathname] = useState(pathname);

  // Close the mobile drawer whenever the route changes.
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname);
    setIsOpen(false);
  }

  return (
    <>
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:h-screen md:w-64 md:flex-col md:border-r md:border-border md:bg-surface">
        <Brand />
        <SidebarNav pathname={pathname} />
        <SidebarFooter />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-navy/70">
            THE COMMUNICATOR
          </p>
          <p className="font-serif text-base font-bold tracking-tight text-navy">
            NEWSROOM
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground/70"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex h-full w-72 max-w-[80%] flex-col bg-surface shadow-xl">
            <div className="flex shrink-0 items-center justify-between pr-3">
              <Brand />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/60"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav pathname={pathname} onNavigate={() => setIsOpen(false)} />
            <SidebarFooter />
          </div>
        </div>
      ) : null}
    </>
  );
}
