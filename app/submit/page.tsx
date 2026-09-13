"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Label, Select, TextArea, TextInput } from "@/components/shared/FormControls";
import { createClient } from "@/lib/supabase/client";
import { NEWSROOM_SECTIONS, type NewsroomSection } from "@/lib/sections";

/**
 * Public, unauthenticated story-idea dropbox for people outside the newsroom (clubs,
 * organizations, community members). Submits via the submit_external_pitch RPC, which
 * lands the pitch in the same review queue staff already use at /pitches.
 */
export default function SubmitPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [section, setSection] = useState<NewsroomSection | "">("");
  const [summary, setSummary] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [possibleSources, setPossibleSources] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const isValid =
    fullName.trim() && email.trim() && title.trim() && section && summary.trim() && whyItMatters.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !section) return;
    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("submit_external_pitch", {
      p_title: title.trim(),
      p_section: section,
      p_summary: summary.trim(),
      p_why_it_matters: whyItMatters.trim(),
      p_possible_sources: possibleSources.trim() || null,
      p_external_name: fullName.trim(),
      p_external_email: email.trim().toLowerCase(),
      p_external_organization: organization.trim() || null,
    });
    setIsSubmitting(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setIsSent(true);
  }

  if (isSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <BrandLogo priority />
          <p className="mt-4 font-serif text-lg font-semibold text-foreground">
            Thanks for submitting!
          </p>
          <p className="mt-2 text-sm text-foreground/60">
            Your story idea has been sent to our editors for review. We&apos;ll follow up at the
            email you provided if we&apos;d like to move forward.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <BrandLogo priority />
          <p className="mt-2 font-serif text-xl font-bold tracking-tight text-navy">NEWSROOM</p>
          <p className="mt-3 text-sm text-foreground/60">
            Submit a story idea from outside the newsroom — clubs, organizations, or anyone with a
            tip. An editor will review it and follow up if we&apos;d like to run it.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="submit-name">Your name</Label>
              <TextInput
                id="submit-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                maxLength={150}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="submit-email">Email</Label>
              <TextInput
                id="submit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                maxLength={255}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="submit-org">Club / organization (optional)</Label>
            <TextInput
              id="submit-org"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Creative Writing Club"
              maxLength={150}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="submit-title">Story title</Label>
            <TextInput
              id="submit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="submit-section">Section</Label>
            <Select
              id="submit-section"
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
            <Label htmlFor="submit-summary">Summary / what is the story?</Label>
            <TextArea
              id="submit-summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              maxLength={2000}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="submit-why">Why does this matter now?</Label>
            <TextArea
              id="submit-why"
              rows={3}
              value={whyItMatters}
              onChange={(e) => setWhyItMatters(e.target.value)}
              maxLength={2000}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="submit-sources">Possible sources / people to contact</Label>
            <TextArea
              id="submit-sources"
              rows={2}
              value={possibleSources}
              onChange={(e) => setPossibleSources(e.target.value)}
              placeholder="Optional"
              maxLength={1000}
            />
          </div>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isSubmitting}
            className="mt-1 justify-center"
          >
            {isSubmitting ? "Submitting…" : "Submit Story Idea"}
          </Button>
        </form>
      </div>
    </div>
  );
}
