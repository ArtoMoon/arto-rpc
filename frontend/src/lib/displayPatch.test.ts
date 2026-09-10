import { describe, expect, it } from "vitest";
import { DefaultConfig } from "./testFixtures";
import {
  withAlwaysActive,
  withAlwaysActiveMode,
  withAlwaysActiveChampion,
  withAlwaysActiveGameMode,
  withAlwaysActiveTimerStopped,
  withResetAlwaysActiveTimer,
  withButton,
  withCreditText,
  withShowEmojis,
  withShowInClient,
  withShowRank,
  withShowStats,
} from "./displayPatch";

describe("withShowRank", () => {
  it("sets show_rank and keeps sibling display fields", () => {
    const cfg = DefaultConfig();
    const patch = withShowRank(cfg, false);
    expect(patch.display).toEqual({
      ...cfg.display,
      default: { ...cfg.display.default, show_rank: false },
    });
  });
});

describe("withShowStats", () => {
  it("sets show_stats and keeps sibling display fields", () => {
    const cfg = DefaultConfig();
    const patch = withShowStats(cfg, false);
    expect(patch.display).toEqual({
      ...cfg.display,
      default: { ...cfg.display.default, show_stats: false },
    });
  });
});

describe("withShowEmojis", () => {
  it("sets show_emojis and keeps sibling presence fields", () => {
    const cfg = DefaultConfig();
    const patch = withShowEmojis(cfg, false);
    expect(patch.presence).toEqual({ ...cfg.presence, show_emojis: false });
  });
});

describe("withShowInClient", () => {
  it("sets show_in_client and keeps sibling presence fields", () => {
    const cfg = DefaultConfig();
    const patch = withShowInClient(cfg, false);
    expect(patch.presence).toEqual({ ...cfg.presence, show_in_client: false });
  });
});

describe("withAlwaysActive", () => {
  it("sets always_active and keeps sibling presence fields", () => {
    const cfg = DefaultConfig();
    const patch = withAlwaysActive(cfg, true);
    expect(patch.presence).toEqual({ ...cfg.presence, always_active: true });
  });

  it("sets always_active_mode and initializes start time when switching to in-game", () => {
    const cfg = DefaultConfig();
    const patch = withAlwaysActiveMode(cfg, "in-game", 1700000000);
    expect(patch.presence).toEqual({
      ...cfg.presence,
      always_active_mode: "in-game",
      always_active_start_time: 1700000000,
      always_active_timer_stopped: false,
      always_active_paused_duration: 0,
    });
  });

  it("sets always_active_champion and resets timer on champion change", () => {
    const cfg = DefaultConfig();
    cfg.presence.always_active_champion = "Yasuo";
    cfg.presence.always_active_start_time = 1000;
    cfg.presence.always_active_timer_stopped = true;
    cfg.presence.always_active_paused_duration = 50;

    const patch = withAlwaysActiveChampion(cfg, "Aatrox", 1700000000);
    expect(patch.presence).toEqual({
      ...cfg.presence,
      always_active_champion: "Aatrox",
      always_active_start_time: 1700000000,
      always_active_timer_stopped: false,
      always_active_paused_duration: 0,
    });
  });

  it("keeps start_time if champion is unchanged", () => {
    const cfg = DefaultConfig();
    cfg.presence.always_active_champion = "Yasuo";
    cfg.presence.always_active_start_time = 5000;

    const patch = withAlwaysActiveChampion(cfg, "Yasuo", 1700000000);
    expect(patch.presence?.always_active_start_time).toBe(5000);
  });

  it("stops and resumes timer with withAlwaysActiveTimerStopped", () => {
    const cfg = DefaultConfig();
    cfg.presence.always_active_start_time = 1000;

    // Stop timer at 60s elapsed
    const stoppedPatch = withAlwaysActiveTimerStopped(cfg, true, 60);
    expect(stoppedPatch.presence?.always_active_timer_stopped).toBe(true);
    expect(stoppedPatch.presence?.always_active_paused_duration).toBe(60);

    // Resume timer with elapsed offset
    const resumedPatch = withAlwaysActiveTimerStopped(
      { ...cfg, presence: { ...cfg.presence, ...stoppedPatch.presence } },
      false,
      60,
      2000
    );
    expect(resumedPatch.presence?.always_active_timer_stopped).toBe(false);
    expect(resumedPatch.presence?.always_active_start_time).toBe(1940);
    expect(resumedPatch.presence?.always_active_paused_duration).toBe(0);
  });

  it("resets timer with withResetAlwaysActiveTimer", () => {
    const cfg = DefaultConfig();
    cfg.presence.always_active_start_time = 1000;
    cfg.presence.always_active_timer_stopped = true;
    cfg.presence.always_active_paused_duration = 100;

    const patch = withResetAlwaysActiveTimer(cfg, 1700000000);
    expect(patch.presence?.always_active_start_time).toBe(1700000000);
    expect(patch.presence?.always_active_timer_stopped).toBe(false);
    expect(patch.presence?.always_active_paused_duration).toBe(0);
  });

  it("sets always_active_game_mode", () => {
    const cfg = DefaultConfig();
    const patch = withAlwaysActiveGameMode(cfg, "ARAM");
    expect(patch.presence).toEqual({ ...cfg.presence, always_active_game_mode: "ARAM" });
  });
});

describe("withCreditText", () => {
  it("sets credit_text and keeps sibling presence fields", () => {
    const cfg = DefaultConfig();
    const patch = withCreditText(cfg, "custom status");
    expect(patch.presence).toEqual({ ...cfg.presence, credit_text: "custom status" });
  });
});

describe("withButton", () => {
  it("sets button_label and button_url and keeps sibling presence fields", () => {
    const cfg = DefaultConfig();
    const patch = withButton(cfg, "My Button", "https://example.com");
    expect(patch.presence).toEqual({
      ...cfg.presence,
      button_label: "My Button",
      button_url: "https://example.com",
    });
  });
});
