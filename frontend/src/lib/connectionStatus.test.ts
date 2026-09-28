import { describe, expect, it } from "vitest";
import type { StatusSnapshot } from "../../bindings/github.com/ArtoMoon/arto-rpc/internal/app/models";
import { summarizeConnection } from "./connectionStatus";

function snapshot(over: Partial<StatusSnapshot> = {}): StatusSnapshot {
  return {
    league_process: true,
    lcu_connected: true,
    valorant_process: false,
    valorant_connected: false,
    active_game: "league",
    lcu_stalled: false,
    discord_connected: true,
    paused: false,
    gameflow_phase: "None",
    presence: null,
    presence_cleared: false,
    ...over,
  };
}

describe("summarizeConnection", () => {
  it("reports connected when everything is up", () => {
    expect(summarizeConnection(snapshot())).toEqual({ label: "Connected", tone: "ok" });
  });

  it("shows a placeholder before the first snapshot lands", () => {
    expect(summarizeConnection(null).tone).toBe("idle");
  });

  it("puts pause ahead of every connection state", () => {
    const s = snapshot({ paused: true, league_process: false, discord_connected: false });
    expect(summarizeConnection(s).label).toBe("Paused");
  });

  it("treats a closed League as idle, not a fault", () => {
    expect(summarizeConnection(snapshot({ league_process: false }))).toEqual({
      label: "League closed",
      tone: "idle",
    });
  });

  it("distinguishes a pending LCU from a missing Discord", () => {
    expect(summarizeConnection(snapshot({ lcu_connected: false })).label).toBe("Connecting");
    expect(summarizeConnection(snapshot({ discord_connected: false })).label).toBe("No Discord");
  });

  it("stops saying Connecting once the daemon reports a stall", () => {
    const s = snapshot({ lcu_connected: false, lcu_stalled: true });
    expect(summarizeConnection(s)).toEqual({ label: "Can't reach League", tone: "warn" });
  });

  it("ignores a stale stall flag once the LCU connects", () => {
    expect(summarizeConnection(snapshot({ lcu_stalled: true })).label).toBe("Connected");
  });

  it("handles Valorant connected state", () => {
    const s = snapshot({
      league_process: false,
      active_game: "valorant",
      valorant_process: true,
      valorant_connected: true,
    });
    expect(summarizeConnection(s)).toEqual({ label: "Valorant Connected", tone: "ok" });
  });

  it("handles Valorant connecting state", () => {
    const s = snapshot({
      league_process: false,
      active_game: "valorant",
      valorant_process: true,
      valorant_connected: false,
    });
    expect(summarizeConnection(s)).toEqual({ label: "Connecting Valorant", tone: "warn" });
  });

  it("translates connection summary to Turkish", () => {
    expect(summarizeConnection(snapshot(), "tr")).toEqual({ label: "Bağlandı", tone: "ok" });
    expect(summarizeConnection(snapshot({ paused: true }), "tr")).toEqual({ label: "Duraklatıldı", tone: "warn" });
    expect(summarizeConnection(snapshot({ league_process: false }), "tr")).toEqual({ label: "League kapalı", tone: "idle" });
    expect(summarizeConnection(snapshot({ lcu_connected: false }), "tr")).toEqual({ label: "Bağlanıyor", tone: "warn" });
  });
});
