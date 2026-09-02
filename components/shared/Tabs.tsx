"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ tabs }: { tabs: TabItem[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-t-lg px-3.5 py-2 text-sm font-medium transition-colors",
              tab.id === activeTab?.id
                ? "border-b-2 border-navy text-navy"
                : "text-foreground/50 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-5">{activeTab?.content}</div>
    </div>
  );
}
