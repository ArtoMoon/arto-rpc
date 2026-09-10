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

export function withAlwaysActiveMode(
  cfg: Config,
  mode: string,
  nowSec: number = Math.floor(Date.now() / 1000)
): Partial<Config> {
  const switchingToInGame = mode === "in-game" && cfg.presence.always_active_mode !== "in-game";
  return {
    presence: {
      ...cfg.presence,
      always_active_mode: mode,
      ...(switchingToInGame
        ? {
            always_active_start_time: nowSec,
            always_active_timer_stopped: false,
            always_active_paused_duration: 0,
          }
        : {}),
    },
  };
}

export function withAlwaysActiveChampion(
  cfg: Config,
  champion: string,
  nowSec: number = Math.floor(Date.now() / 1000)
): Partial<Config> {
  const changed = cfg.presence.always_active_champion !== champion;
  return {
    presence: {
      ...cfg.presence,
      always_active_champion: champion,
      ...(changed
        ? {
            always_active_start_time: nowSec,
            always_active_timer_stopped: false,
            always_active_paused_duration: 0,
          }
        : {}),
    },
  };
}

export function withAlwaysActiveTimerStopped(
  cfg: Config,
  stopped: boolean,
  currentElapsedSec: number = 0,
  nowSec: number = Math.floor(Date.now() / 1000)
): Partial<Config> {
  if (stopped) {
    return {
      presence: {
        ...cfg.presence,
        always_active_timer_stopped: true,
        always_active_paused_duration: Math.max(0, currentElapsedSec),
      },
    };
  }

  // Resuming
  const paused = cfg.presence.always_active_paused_duration || Math.max(0, currentElapsedSec);
  return {
    presence: {
      ...cfg.presence,
      always_active_timer_stopped: false,
      always_active_start_time: nowSec - paused,
      always_active_paused_duration: 0,
    },
  };
}

export function withResetAlwaysActiveTimer(
  cfg: Config,
  nowSec: number = Math.floor(Date.now() / 1000)
): Partial<Config> {
  return {
    presence: {
      ...cfg.presence,
      always_active_start_time: nowSec,
      always_active_timer_stopped: false,
      always_active_paused_duration: 0,
    },
  };
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

