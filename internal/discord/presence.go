package discord

import (
	"strconv"
	"strings"
	"time"

	"github.com/ArtoMoon/arto-rpc/internal/config"
	"github.com/ArtoMoon/arto-rpc/internal/presence/template"
	"github.com/ArtoMoon/arto-rpc/internal/state"
	"github.com/ArtoMoon/arto-rpc/pkg/constants"
	"github.com/ArtoMoon/arto-rpc/pkg/types"
)

// normalizeChampionID converts a display name or input to Data Dragon ID
func normalizeChampionID(name string) string {
	cleaned := strings.ReplaceAll(name, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "'", "")
	cleaned = strings.ReplaceAll(cleaned, ".", "")
	cleaned = strings.ReplaceAll(cleaned, "&", "")
	switch strings.ToLower(cleaned) {
	case "wukong":
		return "MonkeyKing"
	case "renataglasc", "renata":
		return "Renata"
	case "nunuwillump", "nunu":
		return "Nunu"
	case "belveth":
		return "Belveth"
	case "chogath":
		return "Chogath"
	case "kaisa":
		return "Kaisa"
	case "khazix":
		return "Khazix"
	case "leblanc":
		return "Leblanc"
	case "velkoz":
		return "Velkoz"
	default:
		if len(cleaned) > 0 {
			return strings.ToUpper(cleaned[:1]) + cleaned[1:]
		}
		return name
	}
}

// queueDisplayName resolves the queue name shown as details, falling all
// the way back to "League of Legends" so Discord never gets an empty string.
func queueDisplayName(st *state.State) string {
	if name := st.GetQueueName(); name != "" {
		return name
	}
	if name := FormatGameModeName(st.GameMode); name != "" {
		return name
	}
	return "League of Legends"
}

// getCreditText returns the configured credit text, falling back to constants.SmallText.
func getCreditText(cfg *config.Config) string {
	if cfg != nil {
		return cfg.GetCreditText()
	}
	return constants.SmallText
}

// getButtons returns configured buttons if any.
func getButtons(cfg *config.Config) []Button {
	if cfg != nil && cfg.Presence.ButtonLabel != "" && cfg.Presence.ButtonURL != "" {
		return []Button{{Label: cfg.Presence.ButtonLabel, URL: cfg.Presence.ButtonURL}}
	}
	return nil
}

// BuildAlwaysActivePresence builds RPC data for the always-on / static presence mode.
func BuildAlwaysActivePresence(st *state.State, cfg *config.Config) *RPCData {
	if cfg != nil && cfg.Presence.AlwaysActiveMode == "in-game" && cfg.Presence.AlwaysActiveChampion != "" {
		champ := cfg.Presence.AlwaysActiveChampion
		champID := normalizeChampionID(champ)
		modeName := cfg.Presence.AlwaysActiveGameMode
		if modeName == "" {
			modeName = "Ranked Solo/Duo"
		}

		largeImage := GetChampionSkinURL(champID, 0)
		largeText := champ

		credit := getCreditText(cfg)
		smallImage := GetLeagueLogoURL()
		smallText := credit

		if cfg.Display.Default.ShowRank && st != nil {
			rankEmblemURL, rankText := getRankForQueue(st, st.QueueID)
			if rankEmblemURL != "" {
				smallImage = rankEmblemURL
				smallText = rankText
			}
		}

		var start int64
		if st != nil && st.ApplicationStartTime > 0 {
			start = st.ApplicationStartTime
		}

		return &RPCData{
			LargeImage: largeImage,
			LargeText:  largeText,
			SmallImage: smallImage,
			SmallText:  smallText,
			Details:    modeName,
			State:      "In Game",
			Start:      start,
			Buttons:    getButtons(cfg),
		}
	}

	emoji := ""
	availability := "Online"
	if st != nil && st.Availability != "" {
		availability = string(st.Availability)
	}

	if cfg.Presence.ShowEmojis {
		emoji = "\U0001F7E2" // green circle
		if st != nil && st.Availability == types.AvailabilityAway {
			emoji = "\U0001F534" // red circle
		}
	}

	details, stateText := renderPresenceText(cfg, template.ContextAlwaysActive, map[string]string{
		"emoji":        emoji,
		"availability": availability,
	})

	largeImage := GetLeagueLogoLargeURL()
	largeText := "League of Legends"
	if st != nil && st.SummonerIcon > 0 {
		largeImage = GetProfileIconURL(st.SummonerIcon)
	}

	credit := getCreditText(cfg)
	smallImage := GetLeagueLogoURL()
	smallText := credit

	if cfg.Display.Default.ShowRank && st != nil {
		rankEmblemURL, rankText := getRankForQueue(st, st.QueueID)
		if rankEmblemURL != "" {
			largeText = credit
			smallImage = rankEmblemURL
			smallText = rankText
		}
	}

	var start int64
	if st != nil && st.ApplicationStartTime > 0 {
		start = st.ApplicationStartTime
	}

	return &RPCData{
		LargeImage: largeImage,
		LargeText:  largeText,
		SmallImage: smallImage,
		SmallText:  smallText,
		Details:    details,
		State:      stateText,
		Start:      start,
		Buttons:    getButtons(cfg),
	}
}

// BuildInClientPresence builds RPC data for when the player is idle in the client
func BuildInClientPresence(st *state.State, cfg *config.Config) *RPCData {
	emoji := ""
	if cfg.Presence.ShowEmojis {
		emoji = "\U0001F7E2" // green circle
		if st.Availability == types.AvailabilityAway {
			emoji = "\U0001F534" // red circle
		}
	}

	details, stateText := renderPresenceText(cfg, template.ContextInClient, map[string]string{
		"emoji":        emoji,
		"availability": string(st.Availability),
	})

	return &RPCData{
		LargeImage: GetProfileIconURL(st.SummonerIcon),
		LargeText:  "In Client",
		SmallImage: GetLeagueLogoURL(),
		SmallText:  getCreditText(cfg),
		Details:    details,
		State:      stateText,
		Start:      st.ApplicationStartTime,
		Buttons:    getButtons(cfg),
	}
}

// BuildInLobbyPresence builds RPC data for when the player is in a lobby
func BuildInLobbyPresence(st *state.State, cfg *config.Config) *RPCData {
	largeImage := GetProfileIconURL(st.SummonerIcon)
	largeText := FormatGameModeName(st.GameMode)
	smallImage := GetMapIconURL(st.MapID)
	smallText := getCreditText(cfg)

	// Handle TFT - use companion instead of profile icon
	if st.GameMode == types.GameModeTFT && st.TFTCompanionIcon != "" {
		largeImage = st.TFTCompanionIcon
		largeText = st.TFTCompanionName
	}

	// Rank known: swap the tooltip for the credit line, small image/text for
	// the rank emblem/tier.
	if cfg.Display.Default.ShowRank {
		rankEmblemURL, rankText := getRankForQueue(st, st.QueueID)
		if rankEmblemURL != "" {
			largeText = getCreditText(cfg)
			smallImage = rankEmblemURL
			smallText = rankText
		}
	}

	// BRAWL/League Classic force the classic icon regardless of rank.
	if isForcedClassicIconMode(st.GameMode) {
		smallImage = GetLeagueLogoURL()
	}

	details, lobbyState := renderPresenceText(cfg, template.ContextLobby, map[string]string{
		"queue":       queueDisplayName(st),
		"players":     strconv.Itoa(st.Players),
		"max_players": strconv.Itoa(st.MaxPlayers),
	})

	return &RPCData{
		LargeImage: largeImage,
		LargeText:  largeText,
		SmallImage: smallImage,
		SmallText:  smallText,
		Details:    details,
		State:      lobbyState,
		Start:      st.ApplicationStartTime,
		Buttons:    getButtons(cfg),
	}
}

// BuildInCustomLobbyPresence builds RPC data for custom games and the practice tool.
func BuildInCustomLobbyPresence(st *state.State, cfg *config.Config) *RPCData {
	largeImage := GetProfileIconURL(st.SummonerIcon)
	largeText := FormatGameModeName(st.GameMode)
	smallImage := GetMapIconURL(st.MapID)
	smallText := getCreditText(cfg)

	details, lobbyState := renderPresenceText(cfg, template.ContextCustomLobby, map[string]string{
		"queue":       queueDisplayName(st),
		"players":     strconv.Itoa(st.Players),
		"max_players": strconv.Itoa(st.MaxPlayers),
	})

	return &RPCData{
		LargeImage: largeImage,
		LargeText:  largeText,
		SmallImage: smallImage,
		SmallText:  smallText,
		Details:    details,
		State:      lobbyState,
		Start:      st.ApplicationStartTime,
		Buttons:    getButtons(cfg),
	}
}

// BuildInQueuePresence builds RPC data for when the player is in matchmaking queue
func BuildInQueuePresence(st *state.State, cfg *config.Config) *RPCData {
	largeImage := GetProfileIconURL(st.SummonerIcon)
	largeText := FormatGameModeName(st.GameMode)
	smallImage := GetMapIconURL(st.MapID)
	smallText := getCreditText(cfg)

	// Rank known: swap the tooltip for the credit line, small image/text for
	// the rank emblem/tier.
	if cfg.Display.Default.ShowRank {
		rankEmblemURL, rankText := getRankForQueue(st, st.QueueID)
		if rankEmblemURL != "" {
			largeText = getCreditText(cfg)
			smallImage = rankEmblemURL
			smallText = rankText
		}
	}

	// BRAWL/League Classic force the classic icon regardless of rank.
	if isForcedClassicIconMode(st.GameMode) {
		smallImage = GetLeagueLogoURL()
	}

	details, queueState := renderPresenceText(cfg, template.ContextQueue, map[string]string{
		"queue": queueDisplayName(st),
	})

	return &RPCData{
		LargeImage: largeImage,
		LargeText:  largeText,
		SmallImage: smallImage,
		SmallText:  smallText,
		Details:    details,
		State:      queueState,
		Start:      time.Now().Unix(), // Start timer from now for queue time
		Buttons:    getButtons(cfg),
	}
}

// BuildInChampSelectPresence builds RPC data for champion selection phase
func BuildInChampSelectPresence(st *state.State, cfg *config.Config) *RPCData {
	largeImage := GetProfileIconURL(st.SummonerIcon)
	largeText := FormatGameModeName(st.GameMode)
	smallImage := GetMapIconURL(st.MapID)
	smallText := getCreditText(cfg)

	// Rank known: swap the tooltip for the credit line, small image/text for
	// the rank emblem/tier.
	if cfg.Display.Default.ShowRank {
		rankEmblemURL, rankText := getRankForQueue(st, st.QueueID)
		if rankEmblemURL != "" {
			largeText = getCreditText(cfg)
			smallImage = rankEmblemURL
			smallText = rankText
		}
	}

	// BRAWL/League Classic force the classic icon regardless of rank.
	if isForcedClassicIconMode(st.GameMode) {
		smallImage = GetLeagueLogoURL()
	}

	details, stateText := renderPresenceText(cfg, template.ContextChampSelect, map[string]string{
		"queue": queueDisplayName(st),
		"mode":  FormatGameModeName(st.GameMode),
	})

	return &RPCData{
		LargeImage: largeImage,
		LargeText:  largeText,
		SmallImage: smallImage,
		SmallText:  smallText,
		Details:    details,
		State:      stateText,
		Start:      time.Now().Unix(), // Start timer from now
		Buttons:    getButtons(cfg),
	}
}

// BuildInGamePresence builds RPC data for when the player is in an active game
func BuildInGamePresence(st *state.State, cfg *config.Config) *RPCData {
	// Large image: Champion skin
	largeImage := GetChampionSkinURL(st.ChampionID, st.SkinID)
	largeText := FormatSkinName(st.ChampionName, st.SkinName, st.ChromaName)

	// Small image: Rank emblem or League logo
	smallImage := GetLeagueLogoURL()
	smallText := getCreditText(cfg)

	// Show rank emblem if enabled. Unlike Lobby/Queue/ChampSelect, largeText
	// stays the skin name here rather than swapping to the credit line.
	if cfg.Display.Default.ShowRank {
		rankEmblemURL, rankText := getRankForQueue(st, st.QueueID)
		if rankEmblemURL != "" {
			smallImage = rankEmblemURL
			smallText = rankText
		}
	}

	if isForcedClassicIconMode(st.GameMode) {
		smallImage = GetLeagueLogoURL()
	}

	// Mode-specific stat line, empty when stats are hidden. Arena and Swarm
	// show level and gold; everything else shows KDA and CS.
	stats := ""
	if cfg.Display.Default.ShowStats {
		switch st.GameMode {
		case types.GameModeArena:
			stats = FormatArenaStats(st.Kills, st.Deaths, st.Assists, st.Level, st.Gold)
		case types.GameModeSwarm:
			stats = FormatSwarmStats(st.CreepScore, st.Level, st.Gold)
		default:
			stats = FormatKDA(st.Kills, st.Deaths, st.Assists, st.CreepScore)
		}
	}

	details, gameState := renderPresenceText(cfg, template.ContextInGame, map[string]string{
		"queue":    queueDisplayName(st),
		"mode":     FormatGameModeName(st.GameMode),
		"stats":    stats,
		"champion": st.ChampionName,
		"skin":     FormatSkinName(st.ChampionName, st.SkinName, st.ChromaName),
	})

	// Loading screen: GameStartTime isn't resolved yet, so fall back to now.
	start := st.GameStartTime
	if start == 0 {
		start = time.Now().Unix()
	}

	return &RPCData{
		LargeImage: largeImage,
		LargeText:  largeText,
		SmallImage: smallImage,
		SmallText:  smallText,
		Details:    details,
		State:      gameState,
		Start:      start,
		Buttons:    getButtons(cfg),
	}
}

// BuildTFTInGamePresence builds RPC data for TFT games
func BuildTFTInGamePresence(st *state.State, cfg *config.Config) *RPCData {
	largeImage := st.TFTCompanionIcon
	largeText := st.TFTCompanionName
	smallImage := GetLeagueLogoURL()
	smallText := getCreditText(cfg)

	// Use TFT rank if available
	if cfg.Display.Default.ShowRank && !st.TFTRank.IsEmpty() {
		smallImage = GetRankEmblemURL(st.TFTRank.Tier)
		smallText = st.TFTRank.String()
	}

	details, gameState := renderPresenceText(cfg, template.ContextTFTInGame, map[string]string{
		"queue": queueDisplayName(st),
		"level": strconv.Itoa(st.Level),
	})

	// Loading screen: GameStartTime isn't resolved yet, so fall back to now.
	start := st.GameStartTime
	if start == 0 {
		start = time.Now().Unix()
	}

	return &RPCData{
		LargeImage: largeImage,
		LargeText:  largeText,
		SmallImage: smallImage,
		SmallText:  smallText,
		Details:    details,
		State:      gameState,
		Start:      start,
		Buttons:    getButtons(cfg),
	}
}

// BuildSpectatingPresence builds RPC data for when the player is spectating
func BuildSpectatingPresence(st *state.State, cfg *config.Config) *RPCData {
	largeImage := GetLeagueLogoLargeURL()
	switch {
	case st.ChampionID != "":
		largeImage = GetChampionSkinURL(st.ChampionID, st.SkinID)
	case st.MapID != 0:
		largeImage = GetMapIconURL(st.MapID)
	}

	// Loading screen: GameStartTime isn't resolved yet, so fall back to now.
	start := st.GameStartTime
	if start == 0 {
		start = time.Now().Unix()
	}

	details, stateText := renderPresenceText(cfg, template.ContextSpectating, map[string]string{
		"mode":  FormatGameModeName(st.GameMode),
		"queue": queueDisplayName(st),
	})
	// Discord rejects an empty details string; before the first spectate poll
	// resolves the mode there may be nothing to show.
	if details == "" {
		details = "League of Legends"
	}

	return &RPCData{
		LargeImage: largeImage,
		LargeText:  "Spectating",
		SmallImage: GetLeagueLogoURL(),
		SmallText:  getCreditText(cfg),
		Details:    details,
		State:      stateText,
		Start:      start,
		Buttons:    getButtons(cfg),
	}
}

// BuildLaunchingPresence builds the "launching" placeholder, with a
// randomly picked animated skin as its large image on every call.
func BuildLaunchingPresence(start int64) *RPCData {
	return &RPCData{
		LargeImage: GetLaunchingPlaceholderImageURL(),
		LargeText:  "LeagueRPC",
		SmallImage: GetLeagueLogoURL(),
		SmallText:  constants.SmallText,
		Details:    "Launching League...",
		State:      "LeagueRPC",
		Start:      start,
	}
}

// isForcedClassicIconMode reports whether gameMode forces the classic icon
// as the small image regardless of rank.
func isForcedClassicIconMode(gameMode types.GameMode) bool {
	switch gameMode {
	case types.GameModeBrawl, "JADE", "KIWI_JADE":
		return true
	default:
		return false
	}
}

// getRankForQueue returns the appropriate rank emblem and text for the current queue
func getRankForQueue(st *state.State, queueID types.QueueID) (string, string) {
	switch queueID {
	case types.QueueSoloQ:
		if !st.SummonerRank.IsEmpty() {
			return GetRankEmblemURL(st.SummonerRank.Tier), st.SummonerRank.String()
		}

	case types.QueueFlex:
		if !st.SummonerRankFlex.IsEmpty() {
			return GetRankEmblemURL(st.SummonerRankFlex.Tier), st.SummonerRankFlex.String()
		}

	case types.QueueTFT:
		if !st.TFTRank.IsEmpty() {
			return GetRankEmblemURL(st.TFTRank.Tier), st.TFTRank.String()
		}

	case types.QueueArena:
		if !st.ArenaRank.IsEmpty() {
			return GetArenaEmblemURL(st.ArenaRank.Tier), st.ArenaRank.String()
		}
	}

	// No rank for this queue or unranked
	return "", ""
}
