import { PitchesProvider } from "@/lib/pitches-store";

export default function PitchesLayout({ children }: LayoutProps<"/pitches">) {
  return <PitchesProvider>{children}</PitchesProvider>;
}
