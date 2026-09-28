// The presence contexts internal/presence/template knows about, display order.
export const PRESENCE_CONTEXTS = [
  "in-client",
  "lobby",
  "custom-lobby",
  "queue",
  "champ-select",
  "in-game",
  "tft-in-game",
  "spectating",
  "always-active",
] as const;

export type PresenceContext = (typeof PRESENCE_CONTEXTS)[number];

export const PRESENCE_CONTEXT_LABELS_EN: Record<PresenceContext, string> = {
  "in-client": "In client",
  lobby: "Lobby",
  "custom-lobby": "Custom game / practice tool",
  queue: "Queue",
  "champ-select": "Champ select",
  "in-game": "In game",
  "tft-in-game": "TFT in game",
  spectating: "Spectating",
  "always-active": "Always active / Static",
};

export const PRESENCE_CONTEXT_LABELS_TR: Record<PresenceContext, string> = {
  "in-client": "İstemcide",
  lobby: "Lobi",
  "custom-lobby": "Özel oyun / Antrenman",
  queue: "Sırada",
  "champ-select": "Şampiyon seçimi",
  "in-game": "Oyunda",
  "tft-in-game": "TFT oyunda",
  spectating: "İzleyici",
  "always-active": "Sürekli aktif (Sabit)",
};

export const PRESENCE_CONTEXT_LABELS = PRESENCE_CONTEXT_LABELS_EN;

export function getPresenceContextLabel(ctx: PresenceContext, lang: "en" | "tr" = "en"): string {
  return lang === "tr" ? PRESENCE_CONTEXT_LABELS_TR[ctx] : PRESENCE_CONTEXT_LABELS_EN[ctx];
}

export function isPresenceContext(value: string): value is PresenceContext {
  return (PRESENCE_CONTEXTS as readonly string[]).includes(value);
}
