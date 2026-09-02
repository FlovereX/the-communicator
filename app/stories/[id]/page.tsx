"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Tabs } from "@/components/shared/Tabs";
import { ArticleSection } from "@/components/stories/ArticleSection";
import { EditorFeedbackSection } from "@/components/stories/EditorFeedbackSection";
import { MediaSection } from "@/components/stories/MediaSection";
import { SourcesSection } from "@/components/stories/SourcesSection";
import { StoryActions } from "@/components/stories/StoryActions";
import { StoryHeader } from "@/components/stories/StoryHeader";
import { VersionHistorySection } from "@/components/stories/VersionHistorySection";
import { formatRelativeTime } from "@/lib/format";
import { useStories } from "@/lib/stories-store";

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getStory, updateArticle } = useStories();
  const story = getStory(id);

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(story?.title ?? "");
  const [draftBody, setDraftBody] = useState(story?.body ?? "");
  const [loadedStoryId, setLoadedStoryId] = useState(story?.id);

  // Reset the draft whenever a different story loads.
  if (story && story.id !== loadedStoryId) {
    setLoadedStoryId(story.id);
    setDraftTitle(story.title);
    setDraftBody(story.body);
  }

  if (!story) {
    return (
      <div className="py-16 text-center text-sm text-foreground/50">Story not found.</div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <StoryHeader story={story} />
      {story.status === "Needs Revision" && story.feedback.length > 0 ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm shadow-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
            Revision requested
          </p>
          {(() => {
            const latest = story.feedback[story.feedback.length - 1];
            return (
              <div className="mt-2">
                <p className="text-foreground/80">{latest.message}</p>
                <p className="mt-1 text-xs text-foreground/50">
                  {latest.editor} · {formatRelativeTime(latest.timestamp)}
                </p>
              </div>
            );
          })()}
        </div>
      ) : null}
      <StoryActions
        story={story}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing((value) => !value)}
        onSaveDraft={() => updateArticle(story.id, { title: draftTitle, body: draftBody })}
      />
      <Tabs
        tabs={[
          {
            id: "article",
            label: "Article",
            content: (
              <ArticleSection
                isEditing={isEditing}
                title={isEditing ? draftTitle : story.title}
                body={isEditing ? draftBody : story.body}
                wordCount={story.wordCount}
                onTitleChange={setDraftTitle}
                onBodyChange={setDraftBody}
              />
            ),
          },
          {
            id: "sources",
            label: `Sources (${story.sources.length})`,
            content: <SourcesSection story={story} />,
          },
          {
            id: "media",
            label: `Media (${story.media.length})`,
            content: <MediaSection story={story} />,
          },
          {
            id: "feedback",
            label: `Editor Feedback (${story.feedback.length})`,
            content: <EditorFeedbackSection story={story} />,
          },
          {
            id: "history",
            label: "Version History",
            content: <VersionHistorySection story={story} />,
          },
        ]}
      />
    </div>
  );
}
