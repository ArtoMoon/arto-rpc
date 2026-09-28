import type { StatusSnapshot } from "../../bindings/github.com/ArtoMoon/arto-rpc/internal/app/models";

export type ConnectionTone = "ok" | "warn" | "idle";

export interface ConnectionSummary {
  label: string;
  tone: ConnectionTone;
}

// Collapses the status snapshot into one sidebar line. Order is precedence:
// an explicit pause outranks everything, and no game running means nothing else runs.
export function summarizeConnection(
  status: StatusSnapshot | null,
  lang: "en" | "tr" = "en"
): ConnectionSummary {
  const isTr = lang === "tr";

  if (!status) return { label: isTr ? "Başlatılıyor" : "Starting up", tone: "idle" };
  if (status.paused) return { label: isTr ? "Duraklatıldı" : "Paused", tone: "warn" };

  // If Valorant is active or running while League is not
  if (status.active_game === "valorant" || (status.valorant_process && !status.league_process)) {
    if (!status.valorant_process) return { label: isTr ? "Valorant kapalı" : "Valorant closed", tone: "idle" };
    if (!status.discord_connected) return { label: isTr ? "Discord bulunamadı" : "No Discord", tone: "warn" };
    if (!status.valorant_connected) return { label: isTr ? "Valorant'a bağlanıyor" : "Connecting Valorant", tone: "warn" };
    return { label: isTr ? "Valorant Bağlandı" : "Valorant Connected", tone: "ok" };
  }

  if (!status.league_process) {
    if (status.valorant_process) {
      if (!status.discord_connected) return { label: isTr ? "Discord bulunamadı" : "No Discord", tone: "warn" };
      return { label: isTr ? "Valorant Bağlandı" : "Valorant Connected", tone: "ok" };
    }
    return { label: isTr ? "League kapalı" : "League closed", tone: "idle" };
  }

  // A stalled LCU looks identical to a slow start-up for the first while,
  // so the label only hardens once the daemon says it has waited long enough.
  if (!status.lcu_connected) {
    if (status.lcu_stalled) return { label: isTr ? "League'e bağlanılamıyor" : "Can't reach League", tone: "warn" };
    return { label: isTr ? "Bağlanıyor" : "Connecting", tone: "warn" };
  }
  if (!status.discord_connected) return { label: isTr ? "Discord bulunamadı" : "No Discord", tone: "warn" };
  return { label: isTr ? "Bağlandı" : "Connected", tone: "ok" };
}
