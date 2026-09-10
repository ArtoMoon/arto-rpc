import type { Config } from "../../bindings/github.com/ArtoMoon/arto-rpc/internal/config/models";

// A representative Config tree for pure-logic tests; not the source of truth
// for defaults (internal/config.DefaultConfig() is), just a fixture shape.
export function DefaultConfig(): Config {
  return {
    schema_version: 1,
    discord_app_id: "1194034071588851783",
    theme: "system",
    onboarding_complete: false,
    display: {
      default: { show_rank: true, show_stats: true },
    },
    presence: {
      show_emojis: true,
      show_in_client: true,
      always_active: false,
      always_active_mode: "in-client",
      always_active_champion: "Yasuo",
      always_active_game_mode: "Ranked Solo/Duo",
      always_active_start_time: 0,
      always_active_timer_stopped: false,
      always_active_paused_duration: 0,
      credit_text: "",
      button_label: "",
      button_url: "",
      templates: {
        "in-client": { details: "{emoji}  {availability}", state: "In Client" },
        lobby: { details: "{queue}", state: "In Lobby ({players}/{max_players})" },
        "custom-lobby": { details: "{queue}", state: "In Lobby" },
        queue: { details: "{queue}", state: "In Queue" },
        "champ-select": { details: "{queue}", state: "In Champ Select" },
        "in-game": { details: "{queue}", state: "In Game · {stats}" },
        "tft-in-game": { details: "{queue}", state: "In Game · lvl: {level}" },
        spectating: { details: "{mode}", state: "Spectating" },
        "always-active": { details: "{emoji}  {availability}", state: "In Client" },
      },
    },
    behavior: {
      launch_at_startup: false,
      close_action: "ask",
      notify_updates: true,
    },
    advanced: {
      update_interval: 1500,
      stats_polling_interval: 3000,
      debug_mode: false,
    },
  };
}
