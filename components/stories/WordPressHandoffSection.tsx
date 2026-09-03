"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, TextInput } from "@/components/shared/FormControls";
import { PhotoIcon } from "@/components/icons";
import { formatRelativeTime } from "@/lib/format";
import { useStories } from "@/lib/stories-store";
import type { Story } from "@/lib/types";

function CopyButton({ label, getText }: { label: string; getText: () => string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied or unavailable in this context — nothing else to do.
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={handleClick}>
      {copied ? "Copied!" : label}
    </Button>
  );
}

export function WordPressHandoffSection({ story }: { story: Story }) {
  const { markPublished, mediaUrls } = useStories();
  const [publishedUrl, setPublishedUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPublished = story.status === "Published";

  async function handleMarkPublished(e: React.FormEvent) {
    e.preventDefault();
    if (!publishedUrl.trim()) return;
    setIsSubmitting(true);
    setError(null);
    const result = await markPublished(story.id, publishedUrl.trim());
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isPublished ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Published
          </p>
          {story.publishedAt ? (
            <p className="mt-1 text-sm text-emerald-800">{formatRelativeTime(story.publishedAt)}</p>
          ) : null}
          {story.publishedUrl ? (
            <>
              <p className="mt-2 truncate text-xs text-emerald-800">{story.publishedUrl}</p>
              <a
                href={story.publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-sm font-medium text-navy-foreground hover:bg-navy/90"
              >
                View on The Communicator
              </a>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="font-serif text-base font-semibold text-foreground">Headline &amp; Article</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton label="Copy Headline" getText={() => story.title} />
          <CopyButton label="Copy Article" getText={() => story.body} />
          <CopyButton label="Copy Byline" getText={() => `By ${story.writer}`} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="font-serif text-base font-semibold text-foreground">Media for WordPress</h3>
        {story.media.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/50">No media attached to this story.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {story.media.map((item) => {
              const previewUrl = mediaUrls[item.id];
              return (
                <div key={item.id} className="overflow-hidden rounded-lg border border-border">
                  <div className="flex h-32 items-center justify-center bg-navy/5 text-navy/40">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- previews come from short-lived signed Storage URLs
                      <img
                        src={previewUrl}
                        alt={item.altText ?? item.caption ?? item.filename}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PhotoIcon className="h-8 w-8" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 p-3">
                    <p className="text-xs text-foreground/45">{item.filename}</p>
                    {item.caption ? <p className="text-sm text-foreground">{item.caption}</p> : null}
                    {item.credit ? (
                      <p className="text-xs text-foreground/50">Photo: {item.credit}</p>
                    ) : null}
                    {item.altText ? (
                      <p className="text-xs text-foreground/50">Alt: {item.altText}</p>
                    ) : null}
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.caption ? (
                        <CopyButton label="Copy Caption" getText={() => item.caption ?? ""} />
                      ) : null}
                      {item.credit ? (
                        <CopyButton label="Copy Credit" getText={() => item.credit ?? ""} />
                      ) : null}
                      {item.altText ? (
                        <CopyButton label="Copy Alt Text" getText={() => item.altText ?? ""} />
                      ) : null}
                      {previewUrl ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}
                        >
                          Open Image
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!isPublished ? (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="font-serif text-base font-semibold text-foreground">Publish</h3>
          <p className="mt-2 text-sm text-foreground/60">
            Publish this article on the-communicator.com, then paste the live article URL below.
          </p>
          <form onSubmit={handleMarkPublished} className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="published-url">Published URL</Label>
              <TextInput
                id="published-url"
                type="url"
                placeholder="https://the-communicator.com/..."
                value={publishedUrl}
                onChange={(e) => setPublishedUrl(e.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={!publishedUrl.trim() || isSubmitting}>
                {isSubmitting ? "Publishing…" : "Mark Published"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
