import { Bell, CircleSlash, Languages, Palette, PanelTopClose, Power } from "lucide-react";
import { useEffect, useState } from "react";
import {
  GetStatus,
  SetPaused,
} from "../../../bindings/github.com/ArtoMoon/arto-rpc/cmd/arto-rpc-gui/guiservice";
import { useDefaultConfig } from "../../hooks/useDefaultConfig";
import { useSettings } from "../../hooks/useSettings";
import { useStatus } from "../../hooks/useStatus";
import { useLanguage } from "../../lib/i18n";
import {
  withCloseAction,
  withLaunchAtStartup,
  withNotifyUpdates,
  type CloseAction,
} from "../../lib/behaviorPatch";
import { Select, SettingsCard, ThemePicker, Toggle, type SelectOption } from "../ui";

// The Behavior section: how the app looks and behaves around the game.
// Appearance, pausing, startup and close handling, update notifications, and language.
export function BehaviorScreen() {
  const { cfg, error, applyPatch } = useSettings();
  const defaults = useDefaultConfig();
  const status = useStatus();
  const { language, setLanguage, t } = useLanguage();
  const [paused, setPaused] = useState(false);

  const closeActions: SelectOption[] = [
    { value: "ask", label: t.behavior.closeActionAsk },
    { value: "tray", label: t.behavior.closeActionTray },
    { value: "quit", label: t.behavior.closeActionQuit },
  ];

  // Local override wins until the daemon's own status:changed catches up, so
  // the toggle reflects the click immediately rather than the next broadcast.
  useEffect(() => {
    if (status) setPaused(status.paused);
  }, [status?.paused]);

  async function togglePaused(next: boolean) {
    setPaused(next);
    try {
      await SetPaused(next);
    } catch {
      GetStatus()
        .then((s) => setPaused(s.paused))
        .catch(() => setPaused(!next));
    }
  }

  if (!cfg) {
    return <p className="text-muted text-sm">{t.common.loading}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{t.behavior.title}</h1>
      {error && <p className="text-danger text-sm">{error}</p>}

      <SettingsCard
        icon={Languages}
        title={t.behavior.language}
        description={t.behavior.languageDesc}
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={
                "press rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all " +
                (language === "en"
                  ? "bg-accent text-accent-text font-bold shadow-md shadow-amber-500/20"
                  : "bg-surface text-muted hover:text-text border border-border/60")
              }
            >
              🇬🇧 English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("tr")}
              className={
                "press rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all " +
                (language === "tr"
                  ? "bg-accent text-accent-text font-bold shadow-md shadow-amber-500/20"
                  : "bg-surface text-muted hover:text-text border border-border/60")
              }
            >
              🇹🇷 Türkçe
            </button>
          </div>
        }
      />

      <SettingsCard
        icon={Palette}
        title={t.behavior.appearance}
        description={t.behavior.appearanceDesc}
        onReset={defaults ? () => void applyPatch({ theme: defaults.theme }) : undefined}
        isDefault={!defaults || cfg.theme === defaults.theme}
        action={
          <ThemePicker
            value={cfg.theme}
            onChange={(t) => void applyPatch({ theme: t })}
          />
        }
      />

      <SettingsCard
        icon={CircleSlash}
        title={t.behavior.pausePresence}
        description={t.behavior.pausePresenceDesc}
        action={
          <Toggle
            id="pause-presence"
            checked={paused}
            onCheckedChange={togglePaused}
            label={t.behavior.pausePresence}
          />
        }
      />

      <SettingsCard
        icon={Power}
        title={t.behavior.startWithWindows}
        description={t.behavior.startWithWindowsDesc}
        badge={t.common.recommended}
        highlighted
        onReset={defaults ? () => void applyPatch(withLaunchAtStartup(cfg, defaults.behavior.launch_at_startup)) : undefined}
        isDefault={!defaults || cfg.behavior.launch_at_startup === defaults.behavior.launch_at_startup}
        action={
          <Toggle
            id="launch-at-startup"
            checked={cfg.behavior.launch_at_startup}
            onCheckedChange={(v) => void applyPatch(withLaunchAtStartup(cfg, v))}
            label={t.behavior.startWithWindows}
          />
        }
      />

      <SettingsCard
        icon={PanelTopClose}
        title={t.behavior.closeAction}
        description={t.behavior.closeActionDesc}
        onReset={defaults ? () => void applyPatch(withCloseAction(cfg, defaults.behavior.close_action as CloseAction)) : undefined}
        isDefault={!defaults || cfg.behavior.close_action === defaults.behavior.close_action}
        action={
          <Select
            aria-label={t.behavior.closeAction}
            value={cfg.behavior.close_action}
            onValueChange={(v) => void applyPatch(withCloseAction(cfg, v as CloseAction))}
            options={closeActions}
          />
        }
      />

      <SettingsCard
        icon={Bell}
        title={t.behavior.updateNotifications}
        description={t.behavior.updateNotificationsDesc}
        badge={t.common.recommended}
        highlighted
        onReset={defaults ? () => void applyPatch(withNotifyUpdates(cfg, defaults.behavior.notify_updates)) : undefined}
        isDefault={!defaults || cfg.behavior.notify_updates === defaults.behavior.notify_updates}
        action={
          <Toggle
            id="notify-updates"
            checked={cfg.behavior.notify_updates}
            onCheckedChange={(v) => void applyPatch(withNotifyUpdates(cfg, v))}
            label={t.behavior.updateNotifications}
          />
        }
      />
    </div>
  );
}
