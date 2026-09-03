import type { ComponentType, SVGProps } from "react";
import {
  CalendarIcon,
  DashboardIcon,
  PitchesIcon,
  ReviewQueueIcon,
  StoriesIcon,
  UsersIcon,
} from "@/components/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Stories", href: "/stories", icon: StoriesIcon },
  { label: "Pitches", href: "/pitches", icon: PitchesIcon },
  { label: "Calendar", href: "/calendar", icon: CalendarIcon },
];

export const editorNavItems: NavItem[] = [
  { label: "Review Queue", href: "/review", icon: ReviewQueueIcon },
];

export const adminNavItems: NavItem[] = [{ label: "Users", href: "/admin/users", icon: UsersIcon }];

