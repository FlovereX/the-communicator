import { PageHeader } from "@/components/shared/PageHeader";
import { PitchCard } from "@/components/pitches/PitchCard";
import { pitches } from "@/lib/mock-data";

export default function PitchesPage() {
  return (
    <div>
      <PageHeader
        title="Pitches"
        description="Story ideas submitted by the newsroom, awaiting a decision."
      />
      <div className="flex flex-col gap-4">
        {pitches.map((pitch) => (
          <PitchCard key={pitch.id} pitch={pitch} />
        ))}
      </div>
    </div>
  );
}
