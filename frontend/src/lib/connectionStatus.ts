import type { StatusSnapshot } from "../../bindings/github.com/ArtoMoon/arto-rpc/internal/app/models";

export type ConnectionTone = "ok" | "warn" | "idle";

export interface ConnectionSummary {
  label: string;
  tone: ConnectionTone;
}

// Collapses the status snapshot into one sidebar line. Order is precedence:
// an explicit pause outranks everything, and no game running means nothing else runs.
export function summarizeConnection(status: StatusSnapshot | null): ConnectionSummary {
  if (!status) return { label: "Starting up", tone: "idle" };
  if (status.paused) return { label: "Paused", tone: "warn" };

  // If Valorant is active or running while League is not
  if (status.active_game === "valorant" || (status.valorant_process && !status.league_process)) {
    if (!status.valorant_process) return { label: "Valorant closed", tone: "idle" };
    if (!status.discord_connected) return { label: "No Discord", tone: "warn" };
    if (!status.valorant_connected) return { label: "Connecting Valorant", tone: "warn" };
    return { label: "Valorant Connected", tone: "ok" };
  }

  if (!status.league_process) {
    if (status.valorant_process) {
      if (!status.discord_connected) return { label: "No Discord", tone: "warn" };
      return { label: "Valorant Connected", tone: "ok" };
    }
    return { label: "League closed", tone: "idle" };
  }

  // A stalled LCU looks identical to a slow start-up for the first while,
  // so the label only hardens once the daemon says it has waited long enough.
  if (!status.lcu_connected) {
    if (status.lcu_stalled) return { label: "Can't reach League", tone: "warn" };
    return { label: "Connecting", tone: "warn" };
  }
  if (!status.discord_connected) return { label: "No Discord", tone: "warn" };
  return { label: "Connected", tone: "ok" };
}
