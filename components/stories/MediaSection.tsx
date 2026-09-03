"use client";

import { PhotoIcon } from "@/components/icons";
import type { Story } from "@/lib/types";

export function MediaSection({ story }: { story: Story }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-foreground/50">
        File uploads are coming soon — new media can&apos;t be added yet.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {story.media.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg border border-border">
            <div
              className="flex h-32 items-center justify-center bg-navy/5 text-navy/40"
              role="img"
              aria-label={item.altText ?? item.caption ?? item.filename}
            >
              <PhotoIcon className="h-8 w-8" />
            </div>
            <div className="p-3">
              <p className="text-sm text-foreground">{item.caption ?? item.filename}</p>
              {item.credit ? (
                <p className="mt-1 text-xs text-foreground/45">Photo: {item.credit}</p>
              ) : null}
            </div>
          </div>
        ))}
        {story.media.length === 0 ? (
          <p className="text-sm text-foreground/50">No media uploaded yet.</p>
        ) : null}
      </div>
    </div>
  );
}
