import { PageHeader } from "@/components/shared/PageHeader";
import { IssueCard } from "@/components/issues/IssueCard";
import { issues } from "@/lib/mock-data";

export default function IssuesPage() {
  return (
    <div>
      <PageHeader
        title="Issues"
        description="Upcoming and past publication issues."
      />
      <div className="flex flex-col gap-4">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
