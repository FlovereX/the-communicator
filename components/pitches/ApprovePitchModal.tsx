"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Label, Select, TextArea, TextInput } from "@/components/shared/FormControls";
import { Modal } from "@/components/shared/Modal";
import { usePitches } from "@/lib/pitches-store";
import { useStories } from "@/lib/stories-store";
import { capitalize } from "@/lib/utils";
import type { Pitch } from "@/lib/types";

export function ApprovePitchModal({ pitch, onClose }: { pitch: Pitch; onClose: () => void }) {
  const router = useRouter();
  const { approvePitch } = usePitches();
  const { editors, refresh: refreshStories } = useStories();
  const [editorId, setEditorId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValid = editorId && deadline;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    setFormError(null);
    const result = await approvePitch({
      pitchId: pitch.id,
      editorId,
      deadline,
      assignmentNotes: assignmentNotes.trim() || undefined,
    });
    setIsSubmitting(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    // The pitch approval created a story in the shared stories table — refresh that
    // context too so it shows up immediately elsewhere in the app.
    await refreshStories();
    onClose();
    router.push(`/stories/${result.storyId}`);
  }

  return (
    <Modal title={`Approve "${pitch.title}"`} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="approve-pitch-editor">Assigned editor</Label>
          <Select
            id="approve-pitch-editor"
            value={editorId}
            onChange={(e) => setEditorId(e.target.value)}
            disabled={editors.length === 0}
            required
          >
            <option value="">Select an editor</option>
            {editors.map((editor) => (
              <option key={editor.id} value={editor.id}>
                {editor.name} ({capitalize(editor.role)})
              </option>
            ))}
          </Select>
          {editors.length === 0 ? (
            <p className="text-xs text-red-700 dark:text-red-400">No editor or admin profiles are available yet.</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="approve-pitch-deadline">Deadline</Label>
          <TextInput
            id="approve-pitch-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="approve-pitch-notes">Assignment notes</Label>
          <TextArea
            id="approve-pitch-notes"
            rows={3}
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>
        {formError ? <p className="text-sm text-red-700 dark:text-red-400">{formError}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Approving…" : "Approve & Create Story"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
