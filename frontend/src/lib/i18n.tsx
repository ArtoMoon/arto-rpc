import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "tr";

const STORAGE_KEY = "arto_rpc_language";

export const translations = {
  en: {
    nav: {
      home: "Home",
      display: "Display",
      behavior: "Behavior",
      advanced: "Advanced",
      faq: "FAQ",
      help: "Help",
      about: "About",
    },
    titleBar: {
      minimize: "Minimize",
      maximize: "Maximize",
      restore: "Restore",
      close: "Close",
    },
    status: {
      starting: "Starting up",
      paused: "Paused",
      connected: "Connected",
      connecting: "Connecting",
      cantReachLeague: "Can't reach League",
      noDiscord: "No Discord",
      leagueClosed: "League closed",
      valorantClosed: "Valorant closed",
      valorantConnected: "Valorant Connected",
      connectingValorant: "Connecting Valorant",
    },
    home: {
      badge: "Unified Command Center",
      heroTitlePrefix: "League of Legends & Valorant, ",
      heroTitleHighlight: "In One Place",
      heroSubtitle: "Seamless, high-fidelity Discord Rich Presence for your matches and accounts.",
      leagueOfLegends: "League of Legends",
      valorant: "Valorant",
      discordRpc: "Discord RPC",
      activeGame: "Active Game",
      statusActive: "Active",
      statusIdle: "Idle",
      statusConnected: "Connected",
      statusSearching: "Searching...",
      statusAutomatic: "Automatic",
      whyTitle: "Why Arto RPC?",
      whyDesc: "What Discord detects on its own, next to what Arto RPC adds.",
      colFeature: "Feature",
      colNative: "Native",
      colArtoRpc: "Arto RPC",
      presenceTitle: "Discord presence",
      presenceDesc: "Exactly what Arto RPC last sent to Discord, not a re-guess of it.",
      presenceCleared: "Presence is currently cleared.",
    },
    features: {
      champion: "Champion",
      skins: "Skins, chromas & animated skins",
      tft: "TFT companion",
      kda: "KDA & CS",
      timer: "Accurate in-game timer",
      ranked: "Ranked stats & LP",
      customText: "Custom presence text",
      summonerIcons: "Summoner icons",
      spectating: "Spectating",
    },
    display: {
      title: "Display",
      loading: "Loading settings…",
      whatShows: "What your status shows",
      whatShowsDesc: "The extras Arto RPC adds on top of your champion and queue.",
      showRank: "Show rank",
      showRankHint: "Rank emblem and LP",
      showStats: "Show stats",
      showStatsHint: "KDA and creep score",
      showEmojis: "Show status emojis",
      showEmojisHint: "Online/away indicator",
      showInClient: "Show presence while in client",
      showInClientHint: "Keeps your status up between games, not only during one",
      alwaysActive: "Always active presence",
      alwaysActiveHint: "Keeps status active 24/7 with a fixed status, whether in a game or not, even when game is closed",
      platformChoice: "Game Platform",
      modeChoice: "Presence Mode",
      modeInGame: "In Game",
      modeInClient: "In Client / Lobby",
      agent: "Agent",
      map: "Map",
      queue: "Queue / Game Mode",
      champion: "Champion",
      gameMode: "Game Mode",
      gameTimer: "In-game Timer",
      pauseTimer: "Pause Timer",
      resumeTimer: "Resume Timer",
      resetTimer: "Reset to 00:00",
      customButton: "Custom Discord Button",
      customButtonHint: "Add a clickable button to your Discord profile presence",
      buttonLabel: "Button Label",
      buttonUrl: "Button URL",
      templates: "Presence Templates",
      templatesDesc: "Customize line 1 (details) and line 2 (state) shown on Discord for each situation.",
      line1: "Line 1 (details)",
      line2: "Line 2 (state)",
      tokensAvailable: "Tokens you can use:",
    },
    behavior: {
      title: "Behavior",
      appearance: "Appearance",
      appearanceDesc: "System follows whatever Windows is set to. The sidebar has the same switch, for when you just want it dark right now.",
      language: "Language",
      languageDesc: "Choose your interface language. Switch between English and Türkçe instantly.",
      pausePresence: "Pause presence",
      pausePresenceDesc: "Stops updating your Discord status and clears it right away. Turn it back off whenever you like, and a restart unpauses it too.",
      startWithWindows: "Start with Windows",
      startWithWindowsDesc: "Launches minimized to the tray when you sign in, so your status is live before your first game.",
      closeAction: "When the window is closed",
      closeActionDesc: "Choose what happens when you click the close button.",
      closeActionAsk: "Ask me every time",
      closeActionTray: "Hide to tray",
      closeActionQuit: "Quit Arto RPC",
      updateNotifications: "Update notifications",
      updateNotificationsDesc: "Shows a notification when a new version of Arto RPC is available.",
    },
    advanced: {
      title: "Advanced",
      discordApp: "Discord application",
      discordAppDesc: "Which app your presence appears under, including its name and icon on your profile.",
      application: "Application",
      applicationHint: "Pick a preset, or point it at your own Discord app",
      customPreset: "Custom",
      clientInterval: "Client polling interval",
      clientIntervalHint: "How often Arto RPC checks if League is running when no game is active",
      gameInterval: "Game polling interval",
      gameIntervalHint: "How often Arto RPC polls live game data during a match",
      debugLogging: "Debug logging",
      debugLoggingHint: "Writes verbose diagnostic info to the log file to help troubleshoot issues",
    },
    common: {
      recommended: "Recommended",
      resetToDefault: "Reset to default",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      languageName: "English",
    },
  },
  tr: {
    nav: {
      home: "Ana Sayfa",
      display: "Görünüm",
      behavior: "Davranış",
      advanced: "Gelişmiş",
      faq: "SSS",
      help: "Yardım",
      about: "Hakkında",
    },
    titleBar: {
      minimize: "Simge Durumuna Küçült",
      maximize: "Ekranı Kapla",
      restore: "Önceki Boyut",
      close: "Kapat",
    },
    status: {
      starting: "Başlatılıyor",
      paused: "Duraklatıldı",
      connected: "Bağlandı",
      connecting: "Bağlanıyor",
      cantReachLeague: "League'e bağlanılamıyor",
      noDiscord: "Discord bulunamadı",
      leagueClosed: "League kapalı",
      valorantClosed: "Valorant kapalı",
      valorantConnected: "Valorant Bağlandı",
      connectingValorant: "Valorant'a bağlanıyor",
    },
    home: {
      badge: "Tek Komut Merkezi",
      heroTitlePrefix: "League of Legends & Valorant, ",
      heroTitleHighlight: "Tek Merkezde",
      heroSubtitle: "Hesaplarınızın ve maçlarınızın Discord Rich Presence durumunu anlık olarak yüksek kalitede yansıtın.",
      leagueOfLegends: "League of Legends",
      valorant: "Valorant",
      discordRpc: "Discord RPC",
      activeGame: "Aktif Oyun",
      statusActive: "Aktif",
      statusIdle: "Beklemede",
      statusConnected: "Bağlı",
      statusSearching: "Aranıyor...",
      statusAutomatic: "Otomatik",
      whyTitle: "Neden Arto RPC?",
      whyDesc: "Discord'un kendi başına algıladığı ile Arto RPC'nin sunduğu özelliklerin karşılaştırması.",
      colFeature: "Özellik",
      colNative: "Varsayılan",
      colArtoRpc: "Arto RPC",
      presenceTitle: "Discord Durumu",
      presenceDesc: "Discord'a son gönderilen anlık durumun birebir önizlemesi.",
      presenceCleared: "Discord durumu şu anda temizlenmiş veya boş.",
    },
    features: {
      champion: "Şampiyon",
      skins: "Kostümler, renk paketleri ve animasyonlar",
      tft: "TFT minik efsaneleri",
      kda: "KDA & Minyon Skoru (CS)",
      timer: "Doğru oyun içi sayaç",
      ranked: "Dereceli bilgisi ve LP",
      customText: "Özel durum metinleri",
      summonerIcons: "Sihirdar simgeleri",
      spectating: "Maç izleme desteği",
    },
    display: {
      title: "Görünüm",
      loading: "Ayarlar yükleniyor…",
      whatShows: "Durumunuzda ne gösterilsin",
      whatShowsDesc: "Şampiyon ve sıranıza ek olarak Arto RPC'nin eklediği detaylar.",
      showRank: "Dereceyi göster",
      showRankHint: "Derece amblemi ve LP",
      showStats: "İstatistikleri göster",
      showStatsHint: "KDA ve minyon skoru (CS)",
      showEmojis: "Durum emojilerini göster",
      showEmojisHint: "Çevrimiçi / uzakta göstergesi",
      showInClient: "İstemcideyken durumu göster",
      showInClientHint: "Durumunuzu sadece maçta değil, oyun aralarında da açık tutar",
      alwaysActive: "Sürekli aktif durum (Always Active)",
      alwaysActiveHint: "Oyun kapalı olsa dahi 7/24 sabit bir profille Discord durumunu aktif tutar",
      platformChoice: "Oyun Platformu",
      modeChoice: "Durum Modu",
      modeInGame: "Oyunda",
      modeInClient: "İstemcide / Lobide",
      agent: "Ajan",
      map: "Harita",
      queue: "Oyun Modu / Sıra",
      champion: "Şampiyon",
      gameMode: "Oyun Modu",
      gameTimer: "Oyun İçi Sayaç",
      pauseTimer: "Sayacı Durdur",
      resumeTimer: "Sayacı Başlat",
      resetTimer: "00:00'a Sıfırla",
      customButton: "Özel Discord Butonu",
      customButtonHint: "Discord profil durumunuza tıklanabilir bir buton ekleyin",
      buttonLabel: "Buton Başlığı",
      buttonUrl: "Buton Bağlantısı (URL)",
      templates: "Durum Şablonları",
      templatesDesc: "Her oyun durumu için Discord'da görünen 1. satır (ayrıntılar) ve 2. satırı (durum) özelleştirin.",
      line1: "1. Satır (Ayrıntılar)",
      line2: "2. Satır (Durum)",
      tokensAvailable: "Kullanılabilir etiketler:",
    },
    behavior: {
      title: "Davranış",
      appearance: "Görünüm",
      appearanceDesc: "Sistem ayarı Windows temasını takip eder. Sidebar üzerinden de temayı dilediğiniz zaman değiştirebilirsiniz.",
      language: "Dil Seçimi (Language)",
      languageDesc: "Uygulama arayüz dilini seçin. Türkçe ve İngilizce arasında anında geçiş yapın.",
      pausePresence: "Durumu duraklat",
      pausePresenceDesc: "Discord durum güncellemesini anında durdurur ve temizler. İstediğiniz zaman tekrar açabilirsiniz.",
      startWithWindows: "Windows ile başlat",
      startWithWindowsDesc: "Oturum açtığınızda arka planda sistem tepsisinde başlar, böylece ilk oyununuzdan önce hazır olur.",
      closeAction: "Pencere kapatıldığında",
      closeActionDesc: "Kapat butonuna tıkladığınızda uygulamanın ne yapacağını belirleyin.",
      closeActionAsk: "Her seferinde sor",
      closeActionTray: "Sistem tepsisine gizle",
      closeActionQuit: "Arto RPC'den tamamen çık",
      updateNotifications: "Güncelleme bildirimleri",
      updateNotificationsDesc: "Yeni bir Arto RPC sürümü çıktığında bildirim gösterir.",
    },
    advanced: {
      title: "Gelişmiş",
      discordApp: "Discord uygulaması",
      discordAppDesc: "Discord profilinizde durumun hangi uygulama adı ve simgesi altında görüneceğini belirler.",
      application: "Uygulama",
      applicationHint: "Hazır şablonlardan birini seçin veya kendi Discord uygulamanızı girin",
      customPreset: "Özel (Custom)",
      clientInterval: "İstemci kontrol aralığı",
      clientIntervalHint: "Aktif maç yokken Arto RPC'nin League'in açık olup olmadığını kontrol etme sıklığı",
      gameInterval: "Oyun içi kontrol aralığı",
      gameIntervalHint: "Maç esnasında canlı oyun verilerinin ne sıklıkla çekileceği",
      debugLogging: "Hata ayıklama günlükleri (Debug)",
      debugLoggingHint: "Sorun gidermeye yardımcı olmak için ayrıntılı tanılama bilgilerini günlüğe yazar",
    },
    common: {
      recommended: "Önerilen",
      resetToDefault: "Varsayılana döndür",
      loading: "Yükleniyor...",
      save: "Kaydet",
      cancel: "İptal",
      languageName: "Türkçe",
    },
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export type TranslationShape = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationShape;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function detectInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "tr") return saved;
    if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("tr")) {
      return "tr";
    }
  } catch {
    // fallback
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language] as TranslationShape,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: translations.en,
    };
  }
  return ctx;
}
