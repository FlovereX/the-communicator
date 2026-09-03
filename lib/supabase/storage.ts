export const STORY_MEDIA_BUCKET = "story-media";

export const ACCEPTED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const MAX_MEDIA_BYTES = 10 * 1024 * 1024; // 10 MB

/** How long a generated preview URL for a private Storage object stays valid. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60;

export function validateMediaFile(file: File): string | null {
  if (!ACCEPTED_MEDIA_TYPES.includes(file.type as (typeof ACCEPTED_MEDIA_TYPES)[number])) {
    return "Unsupported file type. Please upload a JPEG, PNG, or WebP image.";
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return "Image is too large. The maximum upload size is 10 MB.";
  }
  return null;
}

function sanitizeFilename(filename: string) {
  return (
    filename
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/-+/g, "-") || "file"
  );
}

/** Builds a unique, unpredictable path so re-uploaded files never collide. */
export function buildStoragePath(storyId: string, filename: string) {
  return `stories/${storyId}/${crypto.randomUUID()}-${sanitizeFilename(filename)}`;
}
