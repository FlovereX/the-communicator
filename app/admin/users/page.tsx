"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Avatar } from "@/components/shared/Avatar";
import { Select } from "@/components/shared/FormControls";
import { useCurrentUser } from "@/lib/auth-context";
import { formatRelativeTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_BUCKET, SIGNED_URL_TTL_SECONDS } from "@/lib/supabase/storage";
import type { AccountStatus, ProfileRole, ProfileRow } from "@/lib/supabase/types";
import { capitalize } from "@/lib/utils";

const ALL_ROLES: ProfileRole[] = ["writer", "editor", "admin"];

export default function AdminUsersPage() {
  const currentUser = useCurrentUser();
  const isAdmin = currentUser.role === "admin";
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (fetchError) {
      return { ok: false as const, error: fetchError.message };
    }
    const profileList = (data ?? []) as ProfileRow[];

    const paths = profileList.map((p) => p.avatar_url).filter((path): path is string => Boolean(path));
    const urls: Record<string, string> = {};
    if (paths.length > 0) {
      const { data: signedUrls } = await supabase.storage
        .from(AVATAR_BUCKET)
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
      const urlByPath = new Map(
        (signedUrls ?? [])
          .filter((entry) => !entry.error && entry.signedUrl)
          .map((entry) => [entry.path, entry.signedUrl])
      );
      for (const profile of profileList) {
        const url = profile.avatar_url ? urlByPath.get(profile.avatar_url) : undefined;
        if (url) urls[profile.id] = url;
      }
    }

    return { ok: true as const, profiles: profileList, avatarUrls: urls };
  }, []);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchProfiles();
    if (!result.ok) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    setProfiles(result.profiles);
    setAvatarUrls(result.avatarUrls);
    setIsLoading(false);
  }, [fetchProfiles]);

  useEffect(() => {
    if (!isAdmin) return;
    let ignore = false;

    fetchProfiles().then((result) => {
      if (ignore) return;
      if (!result.ok) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setProfiles(result.profiles);
      setAvatarUrls(result.avatarUrls);
      setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [isAdmin, fetchProfiles]);

  async function runAction(
    id: string,
    action: () => PromiseLike<{ error: { message: string } | null }>
  ) {
    setPendingId(id);
    setError(null);
    const { error: actionError } = await action();
    setPendingId(null);
    if (actionError) {
      setError(actionError.message);
      return;
    }
    await load();
  }

  function approve(id: string, role: "writer" | "editor") {
    const supabase = createClient();
    return runAction(id, () =>
      supabase.rpc("admin_approve_profile", { p_profile_id: id, p_role: role })
    );
  }

  function setStatus(id: string, status: AccountStatus) {
    const supabase = createClient();
    return runAction(id, () =>
      supabase.rpc("admin_set_profile_status", { p_profile_id: id, p_status: status })
    );
  }

  function setRole(id: string, role: ProfileRole) {
    const supabase = createClient();
    return runAction(id, () =>
      supabase.rpc("admin_set_profile_role", { p_profile_id: id, p_role: role })
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-foreground/50 shadow-sm">
        You don&apos;t have access to this page.
      </div>
    );
  }

  const pending = profiles.filter((p) => p.status === "pending");
  const active = profiles.filter((p) => p.status === "active");
  const rejected = profiles.filter((p) => p.status === "rejected");
  const disabled = profiles.filter((p) => p.status === "disabled");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Users" description="Manage newsroom account access." />
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      ) : null}
      {isLoading ? (
        <p className="text-sm text-foreground/50">Loading users…</p>
      ) : (
        <>
          <UserGroup title="Pending">
            {pending.map((p) => (
              <UserRow
                key={p.id}
                profile={p}
                avatarUrl={avatarUrls[p.id] ?? null}
                extra={`Requested ${formatRelativeTime(p.created_at)}`}
              >
                <Button
                  variant="primary"
                  disabled={pendingId === p.id}
                  onClick={() => approve(p.id, "writer")}
                >
                  Approve as Writer
                </Button>
                <Button
                  variant="secondary"
                  disabled={pendingId === p.id}
                  onClick={() => approve(p.id, "editor")}
                >
                  Approve as Editor
                </Button>
                <Button
                  variant="danger"
                  disabled={pendingId === p.id}
                  onClick={() => setStatus(p.id, "rejected")}
                >
                  Reject
                </Button>
              </UserRow>
            ))}
            {pending.length === 0 ? <EmptyRow /> : null}
          </UserGroup>

          <UserGroup title="Active">
            {active.map((p) => (
              <UserRow key={p.id} profile={p} avatarUrl={avatarUrls[p.id] ?? null} extra={capitalize(p.role)}>
                <Select
                  aria-label={`Change role for ${p.full_name}`}
                  value={p.role}
                  disabled={pendingId === p.id}
                  onChange={(e) => setRole(p.id, e.target.value as ProfileRole)}
                  className="w-32"
                >
                  {ALL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {capitalize(role)}
                    </option>
                  ))}
                </Select>
                <Button
                  variant="danger"
                  disabled={pendingId === p.id}
                  onClick={() => setStatus(p.id, "disabled")}
                >
                  Disable
                </Button>
              </UserRow>
            ))}
            {active.length === 0 ? <EmptyRow /> : null}
          </UserGroup>

          <UserGroup title="Rejected">
            {rejected.map((p) => (
              <UserRow key={p.id} profile={p} avatarUrl={avatarUrls[p.id] ?? null}>
                <Button
                  variant="secondary"
                  disabled={pendingId === p.id}
                  onClick={() => setStatus(p.id, "pending")}
                >
                  Restore to Pending
                </Button>
              </UserRow>
            ))}
            {rejected.length === 0 ? <EmptyRow /> : null}
          </UserGroup>

          <UserGroup title="Disabled">
            {disabled.map((p) => (
              <UserRow key={p.id} profile={p} avatarUrl={avatarUrls[p.id] ?? null} extra={capitalize(p.role)}>
                <Button
                  variant="primary"
                  disabled={pendingId === p.id}
                  onClick={() => setStatus(p.id, "active")}
                >
                  Reactivate
                </Button>
              </UserRow>
            ))}
            {disabled.length === 0 ? <EmptyRow /> : null}
          </UserGroup>
        </>
      )}
    </div>
  );
}

function UserGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-serif text-lg font-semibold text-foreground">{title}</h2>
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="divide-y divide-border">{children}</div>
      </div>
    </div>
  );
}

function UserRow({
  profile,
  avatarUrl,
  extra,
  children,
}: {
  profile: ProfileRow;
  avatarUrl?: string | null;
  extra?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Avatar name={profile.full_name} avatarUrl={avatarUrl ?? null} size={36} />
        <div>
          <p className="text-sm font-medium text-foreground">{profile.full_name}</p>
          <p className="text-xs text-foreground/50">
            {profile.email}
            {extra ? ` · ${extra}` : ""}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function EmptyRow() {
  return <p className="px-5 py-4 text-sm text-foreground/50">No users in this group.</p>;
}
