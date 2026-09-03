"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCurrentUser } from "./auth-context";
import type { NewsroomSection } from "./sections";
import { createClient } from "./supabase/client";
import { mapPitchRow } from "./supabase/mappers";
import type { PitchRow, ProfileRow } from "./supabase/types";
import type { Pitch } from "./types";

export interface NewPitchInput {
  title: string;
  section: NewsroomSection;
  summary: string;
  whyItMatters: string;
  possibleSources?: string;
}

export interface ApprovePitchInput {
  pitchId: string;
  editorId: string;
  deadline: string;
  assignmentNotes?: string;
}

export type PitchActionResult = { ok: true } | { ok: false; error: string };
export type SubmitPitchResult = { ok: true; pitchId: string } | { ok: false; error: string };
export type ApprovePitchResult = { ok: true; storyId: string } | { ok: false; error: string };

interface PitchesContextValue {
  pitches: Pitch[];
  myPitches: Pitch[];
  reviewQueue: Pitch[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  submitPitch: (input: NewPitchInput) => Promise<SubmitPitchResult>;
  approvePitch: (input: ApprovePitchInput) => Promise<ApprovePitchResult>;
  rejectPitch: (pitchId: string, feedback: string) => Promise<PitchActionResult>;
}

const PitchesContext = createContext<PitchesContextValue | null>(null);

export function PitchesProvider({ children }: { children: ReactNode }) {
  const currentUser = useCurrentUser();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPitchesData = useCallback(async () => {
    const supabase = createClient();

    const [
      { data: pitchRows, error: pitchesError },
      { data: profileRows, error: profilesError },
    ] = await Promise.all([
      supabase
        .from("pitches")
        .select("*")
        .order("created_at", { ascending: false })
        .overrideTypes<PitchRow[]>(),
      supabase.from("profiles").select("*").overrideTypes<ProfileRow[]>(),
    ]);

    const firstError = pitchesError || profilesError;
    if (firstError) {
      return { ok: false as const, error: firstError.message };
    }

    const profilesById = new Map((profileRows ?? []).map((p) => [p.id, p]));
    return {
      ok: true as const,
      pitches: (pitchRows ?? []).map((row) => mapPitchRow(row, profilesById)),
    };
  }, []);

  const loadAll = useCallback(async () => {
    setError(null);
    const result = await fetchPitchesData();
    if (!result.ok) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    setPitches(result.pitches);
    setIsLoading(false);
  }, [fetchPitchesData]);

  useEffect(() => {
    let ignore = false;

    fetchPitchesData().then((result) => {
      if (ignore) return;
      if (!result.ok) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setPitches(result.pitches);
      setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [fetchPitchesData]);

  const myPitches = useMemo(
    () => pitches.filter((p) => p.submittedById === currentUser.id),
    [pitches, currentUser.id]
  );
  const reviewQueue = useMemo(() => pitches.filter((p) => p.status === "Submitted"), [pitches]);

  const value = useMemo<PitchesContextValue>(
    () => ({
      pitches,
      myPitches,
      reviewQueue,
      isLoading,
      error,
      clearError: () => setError(null),
      refresh: loadAll,
      submitPitch: async (input) => {
        const supabase = createClient();
        const { data, error: rpcError } = await supabase.rpc("submit_pitch", {
          p_title: input.title,
          p_section: input.section,
          p_summary: input.summary,
          p_why_it_matters: input.whyItMatters,
          p_possible_sources: input.possibleSources ?? null,
        });
        if (rpcError || !data) {
          return { ok: false, error: rpcError?.message ?? "Could not submit the pitch." };
        }
        await loadAll();
        return { ok: true, pitchId: data as string };
      },
      approvePitch: async (input) => {
        const supabase = createClient();
        const { data, error: rpcError } = await supabase.rpc("approve_pitch", {
          p_pitch_id: input.pitchId,
          p_editor_id: input.editorId,
          p_deadline: input.deadline,
          p_assignment_notes: input.assignmentNotes ?? null,
        });
        if (rpcError || !data) {
          return { ok: false, error: rpcError?.message ?? "Could not approve the pitch." };
        }
        await loadAll();
        return { ok: true, storyId: data as string };
      },
      rejectPitch: async (pitchId, feedback) => {
        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc("reject_pitch", {
          p_pitch_id: pitchId,
          p_feedback: feedback,
        });
        if (rpcError) {
          return { ok: false, error: rpcError.message };
        }
        await loadAll();
        return { ok: true };
      },
    }),
    [pitches, myPitches, reviewQueue, isLoading, error, loadAll]
  );

  return <PitchesContext.Provider value={value}>{children}</PitchesContext.Provider>;
}

export function usePitches() {
  const context = useContext(PitchesContext);
  if (!context) {
    throw new Error("usePitches must be used within a PitchesProvider");
  }
  return context;
}
