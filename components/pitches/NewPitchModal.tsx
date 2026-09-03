"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, Select, TextArea, TextInput } from "@/components/shared/FormControls";
import { Modal } from "@/components/shared/Modal";
import { usePitches } from "@/lib/pitches-store";
import { NEWSROOM_SECTIONS, type NewsroomSection } from "@/lib/sections";

export function NewPitchModal({ onClose }: { onClose: () => void }) {
  const { submitPitch } = usePitches();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState<NewsroomSection | "">("");
  const [summary, setSummary] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [possibleSources, setPossibleSources] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValid = title.trim() && section && summary.trim() && whyItMatters.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !section) return;
    setIsSubmitting(true);
    setFormError(null);
    const result = await submitPitch({
      title: title.trim(),
      section,
      summary: summary.trim(),
      whyItMatters: whyItMatters.trim(),
      possibleSources: possibleSources.trim() || undefined,
    });
    setIsSubmitting(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    onClose();
  }

  return (
    <Modal title="New Pitch" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-pitch-title">Pitch title</Label>
          <TextInput
            id="new-pitch-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-pitch-section">Section</Label>
          <Select
            id="new-pitch-section"
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
          <Label htmlFor="new-pitch-summary">Summary / what is the story?</Label>
          <TextArea
            id="new-pitch-summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-pitch-why">Why does this matter now?</Label>
          <TextArea
            id="new-pitch-why"
            rows={3}
            value={whyItMatters}
            onChange={(e) => setWhyItMatters(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-pitch-sources">Possible sources / people to contact</Label>
          <TextArea
            id="new-pitch-sources"
            rows={2}
            value={possibleSources}
            onChange={(e) => setPossibleSources(e.target.value)}
            placeholder="Optional"
          />
        </div>
        {formError ? <p className="text-sm text-red-700 dark:text-red-400">{formError}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit Pitch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
