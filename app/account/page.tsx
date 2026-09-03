"use client";

import { AccountInformationSection } from "@/components/account/AccountInformationSection";
import { AppearanceSection } from "@/components/account/AppearanceSection";
import { ProfileSection } from "@/components/account/ProfileSection";
import { SecuritySection } from "@/components/account/SecuritySection";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCurrentUser } from "@/lib/auth-context";

export default function AccountPage() {
  const currentUser = useCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Account Settings"
        description="Manage your profile, security, and appearance."
      />
      <ProfileSection currentUser={currentUser} />
      <SecuritySection />
      <AppearanceSection />
      <AccountInformationSection currentUser={currentUser} />
    </div>
  );
}
