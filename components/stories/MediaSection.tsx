"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, TextInput } from "@/components/shared/FormControls";
import { PhotoIcon, PlusIcon } from "@/components/icons";
import { useStories } from "@/lib/stories-store";
import type { Story } from "@/lib/types";

export function MediaSection({ story }: { story: Story }) {
  const { addMedia } = useStories();
  const [isAdding, setIsAdding] = useState(false);
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const [alt, setAlt] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!caption.trim()) return;
    addMedia(story.id, {
      caption: caption.trim(),
      credit: credit.trim() || "Unknown",
      alt: alt.trim() || caption.trim(),
    });
    setCaption("");
    setCredit("");
    setAlt("");
    setIsAdding(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {story.media.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg border border-border">
            <div
              className="flex h-32 items-center justify-center bg-navy/5 text-navy/40"
              role="img"
              aria-label={item.alt}
            >
              <PhotoIcon className="h-8 w-8" />
            </div>
            <div className="p-3">
              <p className="text-sm text-foreground">{item.caption}</p>
              <p className="mt-1 text-xs text-foreground/45">Photo: {item.credit}</p>
            </div>
          </div>
        ))}
        {story.media.length === 0 ? (
          <p className="text-sm text-foreground/50">No media uploaded yet.</p>
        ) : null}
      </div>

      {isAdding ? (
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 rounded-lg border border-border bg-background/60 p-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="media-caption">Caption</Label>
            <TextInput
              id="media-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="media-credit">Photo credit</Label>
              <TextInput
                id="media-credit"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="media-alt">Alt text</Label>
              <TextInput id="media-alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Media
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" onClick={() => setIsAdding(true)} className="self-start">
          <PlusIcon className="h-4 w-4" />
          Upload Media
        </Button>
      )}
    </div>
  );
}
