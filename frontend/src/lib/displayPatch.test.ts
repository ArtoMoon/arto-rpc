import { describe, expect, it } from "vitest";
import { DefaultConfig } from "./testFixtures";
import {
  withAlwaysActive,
  withAlwaysActiveMode,
  withAlwaysActiveChampion,
  withAlwaysActiveGameMode,
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

  it("sets always_active_mode", () => {
    const cfg = DefaultConfig();
    const patch = withAlwaysActiveMode(cfg, "in-game");
    expect(patch.presence).toEqual({ ...cfg.presence, always_active_mode: "in-game" });
  });

  it("sets always_active_champion", () => {
    const cfg = DefaultConfig();
    const patch = withAlwaysActiveChampion(cfg, "Aatrox");
    expect(patch.presence).toEqual({ ...cfg.presence, always_active_champion: "Aatrox" });
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
