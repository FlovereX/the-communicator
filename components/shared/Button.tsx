import { cn } from "@/lib/utils";

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const VARIANTS = {
  primary: "bg-navy text-navy-foreground hover:bg-navy/90",
  secondary: "border border-border bg-surface text-foreground hover:bg-background",
  danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  ghost: "text-foreground/70 hover:bg-navy/5 hover:text-foreground",
} as const;

export function Button({
  variant = "secondary",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof VARIANTS }) {
  return <button className={cn(BASE, VARIANTS[variant], className)} {...rest} />;
}
