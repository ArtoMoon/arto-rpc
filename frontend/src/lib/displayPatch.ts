import type { Config } from "../../bindings/github.com/ArtoMoon/arto-rpc/internal/config/models";

// Pure patch builders for the global display defaults, shared by the Display
// screen and the onboarding walkthrough's "display" step.

export function withShowRank(cfg: Config, enabled: boolean): Partial<Config> {
  return { display: { ...cfg.display, default: { ...cfg.display.default, show_rank: enabled } } };
}

export function withShowStats(cfg: Config, enabled: boolean): Partial<Config> {
  return { display: { ...cfg.display, default: { ...cfg.display.default, show_stats: enabled } } };
}

export function withShowEmojis(cfg: Config, enabled: boolean): Partial<Config> {
  return { presence: { ...cfg.presence, show_emojis: enabled } };
}

export function withShowInClient(cfg: Config, enabled: boolean): Partial<Config> {
  return { presence: { ...cfg.presence, show_in_client: enabled } };
}

export function withAlwaysActive(cfg: Config, enabled: boolean): Partial<Config> {
  return { presence: { ...cfg.presence, always_active: enabled } };
}

export function withAlwaysActiveMode(cfg: Config, mode: string): Partial<Config> {
  return { presence: { ...cfg.presence, always_active_mode: mode } };
}

export function withAlwaysActiveChampion(cfg: Config, champion: string): Partial<Config> {
  return { presence: { ...cfg.presence, always_active_champion: champion } };
}

export function withAlwaysActiveGameMode(cfg: Config, gameMode: string): Partial<Config> {
  return { presence: { ...cfg.presence, always_active_game_mode: gameMode } };
}

export function withCreditText(cfg: Config, text: string): Partial<Config> {
  return { presence: { ...cfg.presence, credit_text: text } };
}

export function withButton(cfg: Config, label: string, url: string): Partial<Config> {
  return { presence: { ...cfg.presence, button_label: label, button_url: url } };
}
