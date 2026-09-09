import { useStatus } from "../../hooks/useStatus";
import { FeatureComparison } from "./home/FeatureComparison";
import { PresencePreview } from "./home/PresencePreview";

// The Home dashboard: the last-sent presence preview and a rundown of what
// Arto RPC adds over native detection.
export function HomeScreen() {
  const status = useStatus();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Home</h1>
      <PresencePreview status={status} />
      <FeatureComparison />
    </div>
  );
}
