"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, TextArea, TextInput } from "@/components/shared/FormControls";
import { PhotoIcon } from "@/components/icons";
import { useCurrentUser } from "@/lib/auth-context";
import { formatRelativeTime } from "@/lib/format";
import { useStories, type MediaActionResult } from "@/lib/stories-store";
import { ACCEPTED_MEDIA_TYPES, MAX_MEDIA_BYTES, validateMediaFile } from "@/lib/supabase/storage";
import type { MediaItem, Story } from "@/lib/types";

const WRITER_EDITABLE_STATUSES: Story["status"][] = ["Writing", "Needs Revision"];
const ACCEPT_ATTR = ACCEPTED_MEDIA_TYPES.join(",");
const MAX_MEDIA_MB = Math.round(MAX_MEDIA_BYTES / (1024 * 1024));

function canManageMedia(story: Story, role: string, userId: string) {
  if (story.status === "Published") return false;
  if (role === "writer") {
    return story.writerId === userId && WRITER_EDITABLE_STATUSES.includes(story.status);
  }
  return true;
}

function UploadForm({ story }: { story: Story }) {
  const { uploadMedia } = useStories();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const [altText, setAltText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Revoke the object URL whenever the previewed file changes or the form unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setError(null);
    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    const validationError = validateMediaFile(selected);
    if (validationError) {
      setError(validationError);
      setFile(null);
      setPreviewUrl(null);
      e.target.value = "";
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose an image to upload.");
      return;
    }
    setIsUploading(true);
    setError(null);
    const result = await uploadMedia(story.id, file, {
      caption: caption.trim() || null,
      credit: credit.trim() || null,
      altText: altText.trim() || null,
    });
    setIsUploading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFile(null);
    setPreviewUrl(null);
    setCaption("");
    setCredit("");
    setAltText("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <form
      onSubmit={handleUpload}
      className="flex flex-col gap-3 rounded-lg border border-border bg-background/60 p-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="media-file">Image</Label>
        <input
          ref={inputRef}
          id="media-file"
          type="file"
          accept={ACCEPT_ATTR}
          onChange={handleFileChange}
          className="text-sm text-foreground/70 file:mr-3 file:rounded-lg file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
        />
        <p className="text-xs text-foreground/40">
          JPEG, PNG, or WebP. Up to {MAX_MEDIA_MB} MB.
        </p>
      </div>
      {previewUrl ? (
        <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-navy/5">
          {/* eslint-disable-next-line @next/next/no-img-element -- preview of a locally-selected file, not an optimizable remote asset */}
          <img src={previewUrl} alt="Selected upload preview" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="media-caption">Caption</Label>
        <TextInput id="media-caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="media-credit">Photo credit</Label>
          <TextInput id="media-credit" value={credit} onChange={(e) => setCredit(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="media-alt">Alt text</Label>
          <TextInput id="media-alt" value={altText} onChange={(e) => setAltText(e.target.value)} />
        </div>
      </div>
      {error ? <p className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={isUploading || !file}>
          {isUploading ? "Uploading…" : "Upload Media"}
        </Button>
      </div>
    </form>
  );
}

function MediaItemCard({
  item,
  story,
  previewUrl,
  canManage,
}: {
  item: MediaItem;
  story: Story;
  previewUrl: string | undefined;
  canManage: boolean;
}) {
  const { updateMediaMetadata, replaceMediaFile, deleteMedia } = useStories();
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState(item.caption ?? "");
  const [credit, setCredit] = useState(item.credit ?? "");
  const [altText, setAltText] = useState(item.altText ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function reportResult(result: MediaActionResult) {
    setActionError(result.ok ? null : result.error);
  }

  async function handleSave() {
    setIsSaving(true);
    setActionError(null);
    const result = await updateMediaMetadata(item.id, {
      caption: caption.trim() || null,
      credit: credit.trim() || null,
      altText: altText.trim() || null,
    });
    setIsSaving(false);
    reportResult(result);
  }

  async function handleReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsReplacing(true);
    setActionError(null);
    const result = await replaceMediaFile(item, story.id, file);
    setIsReplacing(false);
    reportResult(result);
    e.target.value = "";
  }

  async function handleDelete() {
    setIsDeleting(true);
    setActionError(null);
    const result = await deleteMedia(item);
    setIsDeleting(false);
    reportResult(result);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex h-40 items-center justify-center bg-navy/5 text-navy/40">
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
        <p className="text-xs text-foreground/45">
          {item.filename} · Uploaded {formatRelativeTime(item.createdAt)}
        </p>
        {canManage ? (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`media-caption-${item.id}`}>Caption</Label>
              <TextArea
                id={`media-caption-${item.id}`}
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`media-credit-${item.id}`}>Photo credit</Label>
                <TextInput
                  id={`media-credit-${item.id}`}
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`media-alt-${item.id}`}>Alt text</Label>
                <TextInput
                  id={`media-alt-${item.id}`}
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>
            </div>
            {actionError ? <p className="text-sm text-red-700 dark:text-red-400">{actionError}</p> : null}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button variant="secondary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isReplacing}
                onClick={() => replaceInputRef.current?.click()}
              >
                {isReplacing ? "Replacing…" : "Replace Image"}
              </Button>
              <input
                ref={replaceInputRef}
                type="file"
                accept={ACCEPT_ATTR}
                className="hidden"
                onChange={handleReplace}
              />
              <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </>
        ) : (
          <>
            {item.caption ? <p className="text-sm text-foreground">{item.caption}</p> : null}
            {item.credit ? (
              <p className="text-xs text-foreground/45">Photo: {item.credit}</p>
            ) : null}
            {item.altText ? (
              <p className="text-xs text-foreground/45">Alt text: {item.altText}</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export function MediaSection({ story }: { story: Story }) {
  const currentUser = useCurrentUser();
  const { mediaUrls } = useStories();
  const canManage = canManageMedia(story, currentUser.role, currentUser.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {story.media.map((item) => (
          <MediaItemCard
            key={item.id}
            item={item}
            story={story}
            previewUrl={mediaUrls[item.id]}
            canManage={canManage}
          />
        ))}
        {story.media.length === 0 ? (
          <p className="text-sm text-foreground/50">No media uploaded yet.</p>
        ) : null}
      </div>
      {canManage ? (
        <UploadForm story={story} />
      ) : (
        <p className="text-xs text-foreground/40">
          {story.status === "Published"
            ? "Published stories are read-only."
            : "You don't have permission to manage media on this story."}
        </p>
      )}
    </div>
  );
}
