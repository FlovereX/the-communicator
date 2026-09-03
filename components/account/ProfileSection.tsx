"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/PageHeader";
import { Label, TextInput } from "@/components/shared/FormControls";
import { createClient } from "@/lib/supabase/client";
import {
  AVATAR_BUCKET,
  buildAvatarPath,
  validateAvatarFile,
} from "@/lib/supabase/storage";
import type { CurrentUser } from "@/lib/types";

export function ProfileSection({ currentUser }: { currentUser: CurrentUser }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(currentUser.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarWarning, setAvatarWarning] = useState<string | null>(null);

  const trimmedName = fullName.trim();
  const isValid = trimmedName.length > 0;
  const isDirty = trimmedName !== currentUser.name;
  const hasAvatar = Boolean(currentUser.avatarPath);
  const isBusyWithAvatar = isUploadingAvatar || isRemovingAvatar;

  async function handleSave() {
    if (!isValid || !isDirty || isSaving) return;
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("update_own_profile", {
      p_full_name: trimmedName,
    });
    setIsSaving(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  async function handleAvatarFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isBusyWithAvatar) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError(null);
    setAvatarWarning(null);

    const supabase = createClient();
    const oldPath = currentUser.avatarPath;
    const newPath = buildAvatarPath(currentUser.id, file.name);

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(newPath, file, { contentType: file.type });
    if (uploadError) {
      setIsUploadingAvatar(false);
      setAvatarError(uploadError.message);
      return;
    }

    const { error: rpcError } = await supabase.rpc("update_own_avatar", {
      p_avatar_path: newPath,
    });
    if (rpcError) {
      // Roll back the upload — the profile still points at the old (or no) avatar.
      await supabase.storage.from(AVATAR_BUCKET).remove([newPath]);
      setIsUploadingAvatar(false);
      setAvatarError(rpcError.message);
      return;
    }

    if (oldPath) {
      const { error: removeOldError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .remove([oldPath]);
      if (removeOldError) {
        setAvatarWarning(
          `Your new photo is active, but the previous photo couldn't be removed from storage: ${removeOldError.message}`
        );
      }
    }

    setIsUploadingAvatar(false);
    router.refresh();
  }

  async function handleRemoveAvatar() {
    if (!currentUser.avatarPath || isBusyWithAvatar) return;
    setIsRemovingAvatar(true);
    setAvatarError(null);
    setAvatarWarning(null);

    const supabase = createClient();
    const oldPath = currentUser.avatarPath;

    const { error: rpcError } = await supabase.rpc("remove_own_avatar");
    if (rpcError) {
      setIsRemovingAvatar(false);
      setAvatarError(rpcError.message);
      return;
    }

    const { error: removeError } = await supabase.storage.from(AVATAR_BUCKET).remove([oldPath]);
    if (removeError) {
      setAvatarWarning(
        `Your photo was removed, but the file couldn't be cleaned up from storage: ${removeError.message}`
      );
    }

    setIsRemovingAvatar(false);
    router.refresh();
  }

  return (
    <Card className="p-5">
      <h2 className="font-serif text-lg font-semibold text-foreground">Profile</h2>

      <div className="mt-4 flex items-center gap-4">
        <Avatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} size={64} />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Profile Photo</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusyWithAvatar}
            >
              {isUploadingAvatar ? "Uploading…" : hasAvatar ? "Replace Photo" : "Upload Photo"}
            </Button>
            {hasAvatar ? (
              <Button
                type="button"
                variant="danger"
                onClick={handleRemoveAvatar}
                disabled={isBusyWithAvatar}
              >
                {isRemovingAvatar ? "Removing…" : "Remove Photo"}
              </Button>
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarFileSelected}
          />
          <p className="text-xs text-foreground/50">JPEG, PNG, or WebP. Max 5 MB.</p>
        </div>
      </div>
      {avatarError ? (
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">{avatarError}</p>
      ) : null}
      {avatarWarning ? (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{avatarWarning}</p>
      ) : null}

      <div className="mt-5 flex flex-col gap-4 sm:max-w-sm">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account-full-name">Display Name</Label>
          <TextInput
            id="account-full-name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setSuccess(false);
            }}
            disabled={isSaving}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account-email">Email</Label>
          <TextInput id="account-email" value={currentUser.email} disabled readOnly />
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-700 dark:text-red-400">{error}</p> : null}
      {success ? (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">Profile updated.</p>
      ) : null}

      <div className="mt-4">
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={!isValid || !isDirty || isSaving}
        >
          {isSaving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </Card>
  );
}
