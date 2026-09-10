import { useEffect, useRef, useState } from "react";
import { Eye, MessageSquareText, Pause, Play, RotateCcw } from "lucide-react";
import type { TemplatePair } from "../../../bindings/github.com/ArtoMoon/arto-rpc/internal/config/models";
import { useDefaultConfig } from "../../hooks/useDefaultConfig";
import { useSettings } from "../../hooks/useSettings";
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
} from "../../lib/displayPatch";
import { POPULAR_CHAMPIONS, GAME_MODES } from "../../lib/champions";
import { PRESENCE_CONTEXT_LABELS, PRESENCE_CONTEXTS } from "../../lib/presenceContexts";
import { Field, SettingsCard, Tabs, Toggle } from "../ui";
import { TemplateEditor } from "./display/TemplateEditor";

function formatElapsed(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

// The Display section: global toggles, and one tab per presence context so
// the four text editors don't all show at once.
export function DisplayScreen() {
  const { cfg, error, applyPatch } = useSettings();
  const defaults = useDefaultConfig();
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  // Local champion input state — avoids the controlled-input flicker where every
  // keystroke round-trips through the backend and resets the cursor position.
  const [localChampion, setLocalChampion] = useState<string | null>(null);
  const championInputRef = useRef<HTMLInputElement>(null);

  const isFakeInGame = Boolean(
    cfg?.presence.always_active && cfg?.presence.always_active_mode === "in-game"
  );
  const isStopped = Boolean(cfg?.presence.always_active_timer_stopped);
  const startTime = cfg?.presence.always_active_start_time || now;
  const pausedDuration = cfg?.presence.always_active_paused_duration || 0;

  const currentElapsed = isStopped
    ? pausedDuration
    : Math.max(0, now - startTime);

  useEffect(() => {
    if (!isFakeInGame || isStopped) return;

    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [isFakeInGame, isStopped]);

  if (!cfg) {
    return <p className="text-muted text-sm">Loading settings…</p>;
  }

  function handleToggleTimer() {
    if (!cfg) return;
    void applyPatch(withAlwaysActiveTimerStopped(cfg, !isStopped, currentElapsed));
  }

  function handleResetTimer() {
    if (!cfg) return;
    void applyPatch(withResetAlwaysActiveTimer(cfg));
  }

  function setTemplate(ctx: string, next: TemplatePair) {
    void applyPatch({
      presence: { ...cfg!.presence, templates: { ...cfg!.presence.templates, [ctx]: next } },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Display</h1>
      {error && <p className="text-danger text-sm">{error}</p>}

      <SettingsCard
        icon={Eye}
        title="What your status shows"
        description="The extras Arto RPC adds on top of your champion and queue."
      >
        <Field
          id="show-rank"
          label="Show rank"
          hint="Rank emblem and LP"
          onReset={defaults ? () => void applyPatch(withShowRank(cfg, defaults.display.default.show_rank)) : undefined}
          isDefault={!defaults || cfg.display.default.show_rank === defaults.display.default.show_rank}
        >
          <Toggle
            id="show-rank"
            checked={cfg.display.default.show_rank}
            onCheckedChange={(v) => void applyPatch(withShowRank(cfg, v))}
            label="Show rank"
          />
        </Field>
        <Field
          id="show-stats"
          label="Show stats"
          hint="KDA and creep score"
          onReset={defaults ? () => void applyPatch(withShowStats(cfg, defaults.display.default.show_stats)) : undefined}
          isDefault={!defaults || cfg.display.default.show_stats === defaults.display.default.show_stats}
        >
          <Toggle
            id="show-stats"
            checked={cfg.display.default.show_stats}
            onCheckedChange={(v) => void applyPatch(withShowStats(cfg, v))}
            label="Show stats"
          />
        </Field>
        <Field
          id="show-emojis"
          label="Show status emojis"
          hint="Online/away indicator"
          onReset={defaults ? () => void applyPatch(withShowEmojis(cfg, defaults.presence.show_emojis)) : undefined}
          isDefault={!defaults || cfg.presence.show_emojis === defaults.presence.show_emojis}
        >
          <Toggle
            id="show-emojis"
            checked={cfg.presence.show_emojis}
            onCheckedChange={(v) => void applyPatch(withShowEmojis(cfg, v))}
            label="Show status emojis"
          />
        </Field>
        <Field
          id="show-in-client"
          label="Show presence while in client"
          hint="Keeps your status up between games, not only during one"
          onReset={defaults ? () => void applyPatch(withShowInClient(cfg, defaults.presence.show_in_client)) : undefined}
          isDefault={!defaults || cfg.presence.show_in_client === defaults.presence.show_in_client}
        >
          <Toggle
            id="show-in-client"
            checked={cfg.presence.show_in_client}
            onCheckedChange={(v) => void applyPatch(withShowInClient(cfg, v))}
            label="Show presence while in client"
          />
        </Field>
        <Field
          id="always-active"
          label="Always active presence"
          hint="Keeps status active 24/7 with a fixed status, whether in a game or not, even when League is closed"
          onReset={defaults ? () => void applyPatch(withAlwaysActive(cfg, defaults.presence.always_active)) : undefined}
          isDefault={!defaults || cfg.presence.always_active === defaults.presence.always_active}
        >
          <Toggle
            id="always-active"
            checked={cfg.presence.always_active}
            onCheckedChange={(v) => void applyPatch(withAlwaysActive(cfg, v))}
            label="Always active presence"
          />
        </Field>
        {cfg.presence.always_active && (
          <div className="bg-surface-raised border-border flex flex-col gap-3 rounded-md border p-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-text text-xs font-medium">Always Active Görünümü (Presence Type)</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void applyPatch(withAlwaysActiveMode(cfg, "in-client"))}
                  className={
                    "press rounded-sm px-3 py-1.5 text-xs font-medium transition-colors " +
                    (cfg.presence.always_active_mode !== "in-game"
                      ? "bg-accent text-accent-text font-semibold shadow-xs"
                      : "bg-surface text-muted hover:text-text")
                  }
                >
                  🟢 İstemcide (In Client)
                </button>
                <button
                  type="button"
                  onClick={() => void applyPatch(withAlwaysActiveMode(cfg, "in-game"))}
                  className={
                    "press rounded-sm px-3 py-1.5 text-xs font-medium transition-colors " +
                    (cfg.presence.always_active_mode === "in-game"
                      ? "bg-accent text-accent-text font-semibold shadow-xs"
                      : "bg-surface text-muted hover:text-text")
                  }
                >
                  🎮 Oyunda (Fake In-Game)
                </button>
              </div>
            </div>

            {cfg.presence.always_active_mode === "in-game" && (
              <div className="flex flex-col gap-3 pt-1">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="always-champion" className="text-text text-xs font-medium">
                      Şampiyon (Champion)
                    </label>
                    <input
                      ref={championInputRef}
                      id="always-champion"
                      list="champions-list"
                      type="text"
                      value={localChampion ?? cfg.presence.always_active_champion ?? ""}
                      placeholder="Yasuo"
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocalChampion(val);
                        // When the user picks from the datalist the browser fires a
                        // change event whose value exactly matches one of the options.
                        if (POPULAR_CHAMPIONS.includes(val)) {
                          void applyPatch(withAlwaysActiveChampion(cfg, val));
                          setLocalChampion(null);
                        }
                      }}
                      onBlur={() => {
                        if (localChampion !== null) {
                          void applyPatch(withAlwaysActiveChampion(cfg, localChampion));
                          setLocalChampion(null);
                        }
                      }}
                      className="border-border bg-surface text-text w-full rounded-sm border px-3 py-1.5 text-sm"
                    />
                    <datalist id="champions-list">
                      {POPULAR_CHAMPIONS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="always-gamemode" className="text-text text-xs font-medium">
                      Oyun Modu (Game Mode)
                    </label>
                    <select
                      id="always-gamemode"
                      value={cfg.presence.always_active_game_mode || "Ranked Solo/Duo"}
                      onChange={(e) => void applyPatch(withAlwaysActiveGameMode(cfg, e.target.value))}
                      className="border-border bg-surface text-text w-full rounded-sm border px-3 py-1.5 text-sm"
                    >
                      {GAME_MODES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Oyun Süresi / Timer Kontrolleri */}
                <div className="border-border bg-surface flex flex-wrap items-center justify-between gap-2.5 rounded-sm border p-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-muted text-xs font-medium">Oyun Süresi:</span>
                    <span className="font-mono text-sm font-semibold tracking-wider text-text">
                      {formatElapsed(currentElapsed)}
                    </span>
                    {isStopped ? (
                      <span className="bg-surface-raised border border-border text-warn rounded px-1.5 py-0.5 text-[10px] font-medium">
                        Durduruldu
                      </span>
                    ) : (
                      <span className="bg-surface-raised border border-border text-ok rounded px-1.5 py-0.5 text-[10px] font-medium">
                        Çalışıyor
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="fake-timer-toggle-btn"
                      onClick={handleToggleTimer}
                      className={
                        "press flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors " +
                        (isStopped
                          ? "bg-accent text-accent-text font-semibold shadow-xs"
                          : "border-border bg-surface-raised text-text hover:bg-surface border")
                      }
                    >
                      {isStopped ? (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Başlat</span>
                        </>
                      ) : (
                        <>
                          <Pause className="h-3.5 w-3.5 fill-current" />
                          <span>Durdur</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      id="fake-timer-reset-btn"
                      onClick={handleResetTimer}
                      title="Süreyi Sıfırla"
                      className="press border-border bg-surface-raised text-muted hover:text-text hover:bg-surface flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Sıfırla</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <Field
          id="credit-text"
          label="Status hover text"
          hint="Tooltip text shown on hover over the status icon in Discord"
          stacked
          onReset={defaults ? () => void applyPatch(withCreditText(cfg, defaults.presence.credit_text)) : undefined}
          isDefault={!defaults || cfg.presence.credit_text === defaults.presence.credit_text}
        >
          <input
            id="credit-text"
            type="text"
            value={cfg.presence.credit_text}
            onChange={(e) => void applyPatch(withCreditText(cfg, e.target.value))}
            placeholder="ArtoMoon/arto-rpc @Github.com"
            className="border-border bg-surface-raised text-text w-full rounded-sm border px-3 py-1.5 text-sm"
          />
        </Field>
        <Field
          id="button-url"
          label="Discord profile button (optional)"
          hint="Adds a clickable button with a link to your Discord profile presence"
          stacked
          onReset={defaults ? () => void applyPatch(withButton(cfg, defaults.presence.button_label, defaults.presence.button_url)) : undefined}
          isDefault={!defaults || (cfg.presence.button_label === defaults.presence.button_label && cfg.presence.button_url === defaults.presence.button_url)}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              id="button-label"
              type="text"
              value={cfg.presence.button_label}
              onChange={(e) => void applyPatch(withButton(cfg, e.target.value, cfg.presence.button_url))}
              placeholder="Button text (e.g. GitHub)"
              className="border-border bg-surface-raised text-text w-full rounded-sm border px-3 py-1.5 text-sm"
            />
            <input
              id="button-url"
              type="text"
              value={cfg.presence.button_url}
              onChange={(e) => void applyPatch(withButton(cfg, cfg.presence.button_label, e.target.value))}
              placeholder="https://..."
              className="border-border bg-surface-raised text-text w-full rounded-sm border px-3 py-1.5 text-sm"
            />
          </div>
        </Field>
      </SettingsCard>

      <SettingsCard
        icon={MessageSquareText}
        title="Presence text"
        description="Write your own wording for each situation, or keep the defaults."
      >
        <Tabs
          defaultValue={PRESENCE_CONTEXTS[0]}
          items={PRESENCE_CONTEXTS.map((ctx) => {
            const pair = cfg.presence.templates?.[ctx] ?? { details: "", state: "" };
            return {
              value: ctx,
              label: PRESENCE_CONTEXT_LABELS[ctx],
              content: (
                <TemplateEditor
                  ctx={ctx}
                  value={pair}
                  onChange={(next) => setTemplate(ctx, next)}
                  showRank={cfg.display.default.show_rank}
                  showStats={cfg.display.default.show_stats}
                  showEmojis={cfg.presence.show_emojis}
                  defaultValue={defaults?.presence.templates?.[ctx]}
                />
              ),
            };
          })}
        />
      </SettingsCard>
    </div>
  );
}
