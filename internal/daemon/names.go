package daemon

import "github.com/ArtoMoon/arto-rpc/pkg/constants"

// discordProcessNames are the process names checked to decide whether
// Discord is running, before attempting an IPC connect.
var discordProcessNames = []string{
	constants.DiscordProcessName,
}

// leagueProcessNames are the process names checked to decide whether League
// is running.
var leagueProcessNames = []string{
	constants.LeagueClientProcessName,
	constants.LeagueClientUxProcessName,
}

// valorantProcessNames are the process names checked to decide whether Valorant
// is running.
var valorantProcessNames = []string{
	constants.ValorantProcessName,
	constants.ValorantShippingProcessName,
}

