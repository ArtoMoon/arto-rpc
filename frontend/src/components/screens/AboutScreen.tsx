import { Gamepad2, Info, Lightbulb, ShieldCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { GetVersion } from "../../../bindings/github.com/ArtoMoon/arto-rpc/cmd/arto-rpc-gui/guiservice";
import { useCheckForUpdates } from "../../hooks/useCheckForUpdates";
import {
  DISCORD_COMMUNITY_URL,
  openExternal,
} from "../../lib/links";
import { DiscordIcon } from "../icons";
import { Button, SettingsCard } from "../ui";
import UpdateBanner from "../UpdateBanner";

// The About section: what the app is, who wrote it, and the running version.
export function AboutScreen() {
  const [version, setVersion] = useState("");
  const { checking, result: checkResult, check: handleCheck } = useCheckForUpdates();

  useEffect(() => {
    GetVersion().then(setVersion).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">About</h1>

      <SettingsCard
        icon={Info}
        title="Arto RPC"
        description={version ? `You're running v${version}.` : "Loading version…"}
        action={
          <>
            {checkResult && <span className="text-muted text-sm">{checkResult}</span>}
            <Button variant="secondary" onClick={handleCheck} disabled={checking}>
              {checking ? "Checking…" : "Check for updates"}
            </Button>
          </>
        }
      />

      <UpdateBanner />

      <div className="grid gap-8 lg:grid-cols-2">
        <SettingsCard
          icon={Gamepad2}
          title="What it does"
          description="Turns what you're doing in League into your Discord status."
        >
          <p className="pt-1 text-sm leading-relaxed">
            Your queue, champion and skin, rank, and live KDA go out as you play, and follow along
            as the session moves from lobby to champ select to the match itself.
          </p>
        </SettingsCard>

        <SettingsCard
          icon={Lightbulb}
          title="Why it exists"
          description="Discord knows you're playing League. It doesn't know much else."
        >
          <p className="pt-1 text-sm leading-relaxed">
            Built-in detection gives you the game's name and little more: no skin, no rank, no
            score, no way to word it yourself. Arto RPC fills in the rest.
          </p>
        </SettingsCard>

        <SettingsCard
          icon={ShieldCheck}
          title="Vanguard safe"
          description="No game files are touched, and nothing here helps you win."
        >
          <p className="pt-1 text-sm leading-relaxed">
            Arto RPC reads the same local client API that Porofessor and Blitz.gg read, and turns
            what it finds into a Discord status. Nothing is injected, no files are modified, and
            everything it knows is already on your own screen.
          </p>
        </SettingsCard>

        <SettingsCard
          icon={UserRound}
          title="Made by ArtoMoon"
          description="Built and maintained with love."
        >
          <AboutLink href={DISCORD_COMMUNITY_URL} icon={<DiscordIcon className="size-4" />}>
            Join the Discord community
          </AboutLink>
        </SettingsCard>
      </div>
    </div>
  );
}

// Same icon + label row the Help section uses for its external links.
function AboutLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        openExternal(href);
      }}
      className="text-muted hover:bg-surface-raised hover:text-text -mx-3 flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors"
    >
      {icon}
      {children}
    </a>
  );
}
