import { Check, ListChecks, X } from "lucide-react";
import { SettingsCard } from "../../ui";
import { useLanguage, type translations } from "../../../lib/i18n";

type FeatureKey = keyof typeof translations.en.features;

interface FeatureRow {
  key: FeatureKey;
  native: boolean;
  leagueRpc: boolean;
}

const FEATURES: FeatureRow[] = [
  { key: "champion", native: true, leagueRpc: true },
  { key: "skins", native: false, leagueRpc: true },
  { key: "tft", native: false, leagueRpc: true },
  { key: "kda", native: false, leagueRpc: true },
  { key: "timer", native: false, leagueRpc: true },
  { key: "ranked", native: false, leagueRpc: true },
  { key: "customText", native: false, leagueRpc: true },
  { key: "summonerIcons", native: false, leagueRpc: true },
  { key: "spectating", native: false, leagueRpc: true },
];

function Mark({ on }: { on: boolean }) {
  return on ? (
    <Check className="text-ok size-4" aria-label="Yes" />
  ) : (
    <X className="text-muted size-4" aria-label="No" />
  );
}

export function FeatureComparison() {
  const { t } = useLanguage();

  return (
    <SettingsCard
      icon={ListChecks}
      title={t.home.whyTitle}
      description={t.home.whyDesc}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted border-border border-b text-xs">
            <th className="py-1.5 text-left font-medium">{t.home.colFeature}</th>
            <th className="w-20 py-1.5 text-center font-medium">{t.home.colNative}</th>
            <th className="w-24 py-1.5 text-center font-medium">{t.home.colArtoRpc}</th>
          </tr>
        </thead>
        <tbody>
          {FEATURES.map((row) => (
            <tr key={row.key} className="border-border-subtle border-b last:border-0">
              <td className="py-2 pr-4">{t.features[row.key]}</td>
              <td className="py-2 text-center">
                <div className="flex justify-center">
                  <Mark on={row.native} />
                </div>
              </td>
              <td className="py-2 text-center">
                <div className="flex justify-center">
                  <Mark on={row.leagueRpc} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SettingsCard>
  );
}
