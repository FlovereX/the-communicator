import { Card } from "@/components/shared/PageHeader";
import type { CurrentUser } from "@/lib/types";

const ROLE_LABELS: Record<CurrentUser["role"], string> = {
  writer: "Writer",
  editor: "Editor",
  admin: "Admin",
};

const STATUS_LABELS: Record<CurrentUser["status"], string> = {
  pending: "Pending",
  active: "Active",
  rejected: "Rejected",
  disabled: "Disabled",
};

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function AccountInformationSection({ currentUser }: { currentUser: CurrentUser }) {
  return (
    <Card className="p-5">
      <h2 className="font-serif text-lg font-semibold text-foreground">Account Information</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoItem label="Email" value={currentUser.email} />
        <InfoItem label="Role" value={ROLE_LABELS[currentUser.role]} />
        <InfoItem label="Account Status" value={STATUS_LABELS[currentUser.status]} />
      </div>
    </Card>
  );
}
