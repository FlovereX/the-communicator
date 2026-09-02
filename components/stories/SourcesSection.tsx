"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, TextArea, TextInput } from "@/components/shared/FormControls";
import { PlusIcon } from "@/components/icons";
import { useStories } from "@/lib/stories-store";
import type { Story } from "@/lib/types";

export function SourcesSection({ story }: { story: Story }) {
  const { addSource } = useStories();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    addSource(story.id, {
      name: name.trim(),
      role: role.trim(),
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setName("");
    setRole("");
    setUrl("");
    setNotes("");
    setIsAdding(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {story.sources.map((source) => (
          <div key={source.id} className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-foreground">{source.name}</p>
            <p className="text-xs text-foreground/50">{source.role}</p>
            {source.url ? (
              <p className="mt-1 truncate text-xs text-navy">{source.url}</p>
            ) : null}
            {source.notes ? (
              <p className="mt-2 text-sm text-foreground/70">{source.notes}</p>
            ) : null}
          </div>
        ))}
        {story.sources.length === 0 ? (
          <p className="text-sm text-foreground/50">No sources added yet.</p>
        ) : null}
      </div>

      {isAdding ? (
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 rounded-lg border border-border bg-background/60 p-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="source-name">Name</Label>
              <TextInput
                id="source-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="source-role">Organization / Title</Label>
              <TextInput
                id="source-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source-url">URL</Label>
            <TextInput
              id="source-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source-notes">Notes</Label>
            <TextArea
              id="source-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Source
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" onClick={() => setIsAdding(true)} className="self-start">
          <PlusIcon className="h-4 w-4" />
          Add Source
        </Button>
      )}
    </div>
  );
}
