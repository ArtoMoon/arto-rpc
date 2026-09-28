import { Gamepad2, Sparkles } from "lucide-react";
import { useStatus } from "../../hooks/useStatus";
import { FeatureComparison } from "./home/FeatureComparison";
import { PresencePreview } from "./home/PresencePreview";

// The Home dashboard: the last-sent presence preview and a rundown of what
// Arto RPC adds over native detection, styled with the dark gaming visual theme.
export function HomeScreen() {
  const status = useStatus();

  return (
    <div className="flex flex-col gap-6">
      {/* Modern Hero Banner matching the visual theme */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0e1628] via-[#09101f] to-[#070c16] p-6 shadow-xl">
        <div className="absolute top-0 right-10 -mt-10 size-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400/10 border border-amber-500/30 text-amber-400">
            <Sparkles className="size-3" />
            Tek Komut Merkezi
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
          League of Legends & Valorant,{" "}
          <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
            Tek Merkezde
          </span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xl leading-relaxed mb-6">
          Hesaplarınızın ve maçlarınızın Discord Rich Presence durumunu anlık olarak yüksek kalitede yansıtın.
        </p>

        {/* Quick status cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className={`size-2 rounded-full ${status?.league_process ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-slate-500"}`} />
              {status?.league_process ? "Aktif" : "Beklemede"}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">League of Legends</div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className={`size-2 rounded-full ${status?.valorant_process ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-slate-500"}`} />
              {status?.valorant_process ? "Bağlı" : "Beklemede"}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Valorant</div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className={`size-2 rounded-full ${status?.discord_connected ? "bg-indigo-400 shadow-sm shadow-indigo-400/50" : "bg-amber-400"}`} />
              {status?.discord_connected ? "Bağlı" : "Aranıyor"}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Discord RPC</div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <Gamepad2 className="size-4" />
              {status?.active_game === "valorant" ? "Valorant" : status?.active_game === "league" ? "League" : "Otomatik"}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Aktif Oyun</div>
          </div>
        </div>
      </div>

      <PresencePreview status={status} />
      <FeatureComparison />
    </div>
  );
}
