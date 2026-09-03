"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Label, Select, TextArea, TextInput } from "@/components/shared/FormControls";
import { Modal } from "@/components/shared/Modal";
import { NEWSROOM_SECTIONS, type NewsroomSection } from "@/lib/sections";
import { useStories } from "@/lib/stories-store";
import { capitalize, disambiguateNames } from "@/lib/utils";

export function NewStoryModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { addStory, writers, editors } = useStories();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState<NewsroomSection | "">("");
  const [writerId, setWriterId] = useState("");
  const [editorId, setEditorId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Falls back to unselected if the chosen profile is no longer an active option
  // (e.g. it was disabled while this modal was open) instead of trusting stale state.
  const selectedWriterId = writers.some((w) => w.id === writerId) ? writerId : "";
  const selectedEditorId = editors.some((e) => e.id === editorId) ? editorId : "";
  const writerLabels = disambiguateNames(writers);
  const editorLabels = disambiguateNames(editors);

  const isValid = title.trim() && section && selectedWriterId && selectedEditorId && dueDate;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    if (!section) return;
    setIsSubmitting(true);
    setFormError(null);
    const result = await addStory({
      title: title.trim(),
      section,
      writerId: selectedWriterId,
      editorId: selectedEditorId,
      dueDate,
      assignmentNotes: assignmentNotes.trim() || undefined,
    });
    setIsSubmitting(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    onClose();
    router.push(`/stories/${result.storyId}`);
  }

  return (
    <Modal title="New Story" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-story-title">Headline</Label>
          <TextInput
            id="new-story-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Club Fest 2026"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-story-section">Section</Label>
            <Select
              id="new-story-section"
              value={section}
              onChange={(e) => setSection(e.target.value as NewsroomSection)}
              required
            >
              <option value="">Select a section</option>
              {NEWSROOM_SECTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-story-due">Deadline</Label>
            <TextInput
              id="new-story-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-story-writer">Writer</Label>
            <Select
              id="new-story-writer"
              value={selectedWriterId}
              onChange={(e) => setWriterId(e.target.value)}
              disabled={writers.length === 0}
              required
            >
              <option value="">Select a writer</option>
              {writers.map((writer) => (
                <option key={writer.id} value={writer.id}>
                  {writerLabels.get(writer.id)} ({capitalize(writer.role)})
                </option>
              ))}
            </Select>
            {writers.length === 0 ? (
              <p className="text-xs text-red-700 dark:text-red-400">
                No staff profiles are available yet. Add a profile in Supabase before creating a story.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-story-editor">Editor</Label>
            <Select
              id="new-story-editor"
              value={selectedEditorId}
              onChange={(e) => setEditorId(e.target.value)}
              disabled={editors.length === 0}
              required
            >
              <option value="">Select an editor</option>
              {editors.map((editor) => (
                <option key={editor.id} value={editor.id}>
                  {editorLabels.get(editor.id)} ({capitalize(editor.role)})
                </option>
              ))}
            </Select>
            {editors.length === 0 ? (
              <p className="text-xs text-red-700 dark:text-red-400">
                No editor or admin profiles are available yet.
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-story-notes">Initial assignment notes</Label>
          <TextArea
            id="new-story-notes"
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            placeholder="What should the writer focus on?"
            rows={3}
          />
        </div>
        {formError ? (
          <p className="text-sm text-red-700 dark:text-red-400">{formError}</p>
        ) : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Creating…" : "Create Story"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

