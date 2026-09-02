"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, TextArea, TextInput } from "@/components/shared/FormControls";
import { Modal } from "@/components/shared/Modal";
import { useStories } from "@/lib/stories-store";

export function NewStoryModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { addStory } = useStories();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [writer, setWriter] = useState("");
  const [editor, setEditor] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");

  const isValid = title.trim() && section.trim() && writer.trim() && editor.trim() && dueDate;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const story = addStory({
      title: title.trim(),
      section: section.trim(),
      writer: writer.trim(),
      editor: editor.trim(),
      dueDate,
      assignmentNotes: assignmentNotes.trim() || undefined,
    });
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
            <TextInput
              id="new-story-writer"
              value={writer}
              onChange={(e) => setWriter(e.target.value)}
              placeholder="e.g. Maria Chen"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-story-editor">Editor</Label>
            <TextInput
              id="new-story-editor"
              value={editor}
              onChange={(e) => setEditor(e.target.value)}
              placeholder="e.g. Kieth Flores"
              required
            />
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
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid}>
            Create Story
          </Button>
        </div>
      </form>
    </Modal>
  );
}
