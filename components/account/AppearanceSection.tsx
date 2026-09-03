"use client";

import { Card } from "@/components/shared/PageHeader";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemePreference; label: string; description: string }[] = [
  { value: "light", label: "Light", description: "Always use the light newsroom appearance." },
  { value: "dark", label: "Dark", description: "Always use the dark newsroom appearance." },
  { value: "system", label: "System", description: "Match this device's appearance setting." },
];

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="p-5">
      <h2 className="font-serif text-lg font-semibold text-foreground">Appearance</h2>
      <div role="radiogroup" aria-label="Appearance" className="mt-4 flex flex-wrap gap-2">
        {OPTIONS.map((option) => {
          const isSelected = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex min-w-36 flex-1 flex-col items-start gap-1 rounded-lg border px-3.5 py-2.5 text-left transition-colors",
                isSelected
                  ? "border-navy bg-navy/5 text-foreground"
                  : "border-border bg-surface text-foreground/70 hover:bg-background/60"
              )}
            >
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-xs text-foreground/50">{option.description}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
