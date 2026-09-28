package daemon

import (
	"github.com/ArtoMoon/arto-rpc/internal/championdata"
	"github.com/ArtoMoon/arto-rpc/internal/config"
	"github.com/ArtoMoon/arto-rpc/internal/discord"
	"github.com/ArtoMoon/arto-rpc/internal/lcu"
	"github.com/ArtoMoon/arto-rpc/internal/livegame"
	"github.com/ArtoMoon/arto-rpc/internal/process"
	"github.com/ArtoMoon/arto-rpc/internal/state"
	"github.com/ArtoMoon/arto-rpc/internal/valorant"
	"github.com/ArtoMoon/arto-rpc/pkg/constants"
	"github.com/rs/zerolog"
)

// Wire builds a fully connected Daemon from a config Store and logger. The
// GUI app and the headless launcher both call this so they run the same graph.
func Wire(store *config.Store, logger zerolog.Logger) *Daemon {
	stateMgr := state.NewManager(logger)
	discordClient := discord.NewClient(store, logger)
	liveGameClient := livegame.NewClient(livegame.NewProductionHTTPDoer())
	lcuClient := lcu.NewClient(stateMgr, store, logger, liveGameClient)
	updater := discord.NewUpdater(discordClient, store, logger)
	checker := process.NewChecker()

	valClient := valorant.NewClient(logger)
	valSup := valorant.NewSupervisor(checker, valClient, logger)

	lcuSup := NewLeagueSupervisor(lcuClient, checker)
	alwaysActive := func() bool {
		return store.Load().Presence.AlwaysActive
	}
	gameRunning := func() bool {
		return lcuSup.LeagueProcessDetected() || valSup.ProcessRunning()
	}
	discordSup := NewDiscordSupervisorWithGameGate(discordClient, checker, lcuSup, gameRunning, alwaysActive)

	var d *Daemon
	discordClient.SetAppIDProvider(func() string {
		cfg := store.Load()
		if cfg != nil && cfg.Presence.AlwaysActive && cfg.Presence.AlwaysActiveGame == "valorant" {
			return constants.DiscordAppIDValorant
		}
		if d != nil && d.ActiveGame() == "valorant" {
			return constants.DiscordAppIDValorant
		}
		return store.Load().DiscordAppID
	})

	championResolver := championdata.NewResolver(championdata.NewProductionHTTPDoer())
	liveGamePoller := livegame.NewPoller(liveGameClient, championResolver, stateMgr, store, logger)

	d = New(discordSup, lcuSup, updater, stateMgr, liveGamePoller, logger,
		DefaultPresencePollInterval, DefaultPlaceholderInterval,
		WithValorantRunner(valSup))
	return d
}
