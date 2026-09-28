import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Window } from "@wailsio/runtime";
import { GetVersion } from "../../../bindings/github.com/ArtoMoon/arto-rpc/cmd/arto-rpc-gui/guiservice";
import { useStatus } from "../../hooks/useStatus";
import { summarizeConnection } from "../../lib/connectionStatus";

// Sleek title bar with the dark gaming palette and window controls
export function TitleBar() {
  const [version, setVersion] = useState("");
  const [maximised, setMaximised] = useState(false);
  const connection = summarizeConnection(useStatus());

  useEffect(() => {
    GetVersion().then(setVersion).catch(() => {});
  }, []);

  useEffect(() => {
    Window.IsMaximised()
      .then(setMaximised)
      .catch(() => {});
  }, []);

  async function toggleMaximise() {
    await Window.ToggleMaximise();
    setMaximised(await Window.IsMaximised().catch(() => !maximised));
  }

  return (
    <div
      className="border-slate-800/80 bg-[#060b14] flex h-10 shrink-0 items-center justify-between border-b px-3 select-none text-slate-200"
      style={{ "--wails-draggable": "drag" } as CSSProperties}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center size-5 rounded bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-[11px] shadow-sm shadow-amber-500/30">
          A
        </div>
        <span className="text-xs font-bold tracking-wider uppercase text-white">Arto RPC</span>
        {version && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 text-amber-400 border border-amber-500/20">
            v{version}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3" style={{ "--wails-draggable": "no-drag" } as CSSProperties}>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span
            className={
              "size-2 rounded-full " +
              (connection.tone === "ok"
                ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                : connection.tone === "warn"
                ? "bg-amber-400"
                : "bg-slate-500")
            }
          />
          <span className="text-[11px] font-medium">{connection.label}</span>
        </div>

        <div className="flex h-8 items-stretch">
          <TitleBarButton label="Minimize" onClick={() => void Window.Minimise()}>
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden>
              <rect x="0" y="4.5" width="10" height="1" fill="currentColor" />
            </svg>
          </TitleBarButton>
          <TitleBarButton label={maximised ? "Restore" : "Maximize"} onClick={() => void toggleMaximise()}>
            {maximised ? (
              <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden>
                <path d="M2 0h8v8h-2M0 2h8v8H0z" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden>
                <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            )}
          </TitleBarButton>
          <TitleBarButton label="Close" danger onClick={() => void Window.Close()}>
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden>
              <path d="M0 0l10 10M10 0L0 10" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </TitleBarButton>
        </div>
      </div>
    </div>
  );
}

function TitleBarButton({
  label,
  danger,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        "text-slate-400 flex w-9 items-center justify-center transition-colors " +
        (danger ? "hover:bg-rose-600 hover:text-white" : "hover:bg-slate-800 hover:text-white")
      }
    >
      {children}
    </button>
  );
}
