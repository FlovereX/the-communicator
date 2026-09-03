import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function Avatar({
  name,
  avatarUrl,
  size = 40,
  className,
}: {
  name: string;
  avatarUrl: string | null;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar source domain isn't known/configurable ahead of time
      <img
        src={avatarUrl}
        alt=""
        style={style}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-navy font-semibold leading-none text-navy-foreground",
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}
