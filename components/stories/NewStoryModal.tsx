"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Label, Select, TextArea, TextInput } from "@/components/shared/FormControls";
import { Modal } from "@/components/shared/Modal";
import { useStories } from "@/lib/stories-store";

export function NewStoryModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { addStory, writers, editors } = useStories();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [writerId, setWriterId] = useState("");
  const [editorId, setEditorId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValid = title.trim() && section.trim() && writerId && editorId && dueDate;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    setFormError(null);
    const story = await addStory({
      title: title.trim(),
      section: section.trim(),
      writerId,
      editorId,
      dueDate,
      assignmentNotes: assignmentNotes.trim() || undefined,
    });
    setIsSubmitting(false);
    if (!story) {
      setFormError("Couldn't create the story. Please try again.");
      return;
    }
    onClose();
    router.push(`/stories/${story.id}`);
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
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-story-section">Section</Label>
            <TextInput
              id="new-story-section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. Campus"
              required
            />
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
              value={writerId}
              onChange={(e) => setWriterId(e.target.value)}
              required
            >
              <option value="">Select a writer</option>
              {writers.map((writer) => (
                <option key={writer.id} value={writer.id}>
                  {writer.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-story-editor">Editor</Label>
            <Select
              id="new-story-editor"
              value={editorId}
              onChange={(e) => setEditorId(e.target.value)}
              required
            >
              <option value="">Select an editor</option>
              {editors.map((editor) => (
                <option key={editor.id} value={editor.id}>
                  {editor.name}
                </option>
              ))}
            </Select>
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
          <p className="text-sm text-red-700">{formError}</p>
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

