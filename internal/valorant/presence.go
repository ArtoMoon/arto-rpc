package valorant

import (
	"fmt"

	"github.com/ArtoMoon/arto-rpc/internal/config"
	"github.com/ArtoMoon/arto-rpc/internal/discord"
)

// BuildPresence maps a Valorant State to a Discord RPCData payload.
func BuildPresence(st *State, cfg *config.Config) *discord.RPCData {
	if st == nil {
		return &discord.RPCData{}
	}

	rpc := &discord.RPCData{
		LargeImage: "valorant",
		LargeText:  "VALORANT",
		SmallImage: "valorant",
		SmallText:  cfg.GetCreditText(),
	}

	if cfg != nil && cfg.Presence.ButtonLabel != "" && cfg.Presence.ButtonURL != "" {
		rpc.Buttons = []discord.Button{
			{
				Label: cfg.Presence.ButtonLabel,
				URL:   cfg.Presence.ButtonURL,
			},
		}
	}

	queueName := st.QueueName
	if queueName == "" && st.QueueID != "" {
		queueName = ResolveQueue(st.QueueID)
	}

	mapName := st.MapName
	mapAsset := st.MapAsset
	if mapName == "" && st.MatchMap != "" {
		mapName, mapAsset = ResolveMap(st.MatchMap)
	}
	if mapAsset == "" {
		mapAsset = "valorant"
	}

	partyInfo := ""
	if st.MaxPartySize > 0 {
		if st.PartySize > 0 {
			partyInfo = fmt.Sprintf("Party: %d/%d", st.PartySize, st.MaxPartySize)
		}
	}

	switch st.SessionLoopState {
	case "PREGAME":
		// Agent select
		if queueName != "" {
			rpc.Details = fmt.Sprintf("Agent Select - %s", queueName)
		} else {
			rpc.Details = "Agent Select"
		}

		if st.AgentName != "" {
			rpc.State = fmt.Sprintf("Locking In: %s", st.AgentName)
			if st.AgentIconURL != "" {
				rpc.LargeImage = st.AgentIconURL
				rpc.LargeText = st.AgentName
			}
			if mapName != "" {
				rpc.SmallImage = "valorant"
				rpc.SmallText = mapName
			}
		} else {
			if mapName != "" {
				rpc.State = fmt.Sprintf("Map: %s", mapName)
				rpc.LargeImage = mapAsset
				rpc.LargeText = mapName
			} else {
				rpc.State = "Locking In"
			}
			rpc.SmallImage = "valorant"
			rpc.SmallText = "Agent Select"
		}

	case "INGAME":
		// Active match
		if queueName != "" && mapName != "" {
			rpc.Details = fmt.Sprintf("%s - %s", queueName, mapName)
		} else if queueName != "" {
			rpc.Details = queueName
		} else if mapName != "" {
			rpc.Details = mapName
		} else {
			rpc.Details = "In Match"
		}

		if st.AgentName != "" {
			if st.AllyScore > 0 || st.EnemyScore > 0 {
				rpc.State = fmt.Sprintf("%s (%d - %d)", st.AgentName, st.AllyScore, st.EnemyScore)
			} else if partyInfo != "" {
				rpc.State = fmt.Sprintf("Playing %s (%s)", st.AgentName, partyInfo)
			} else {
				rpc.State = fmt.Sprintf("Playing %s", st.AgentName)
			}

			if st.AgentIconURL != "" {
				rpc.LargeImage = st.AgentIconURL
				rpc.LargeText = st.AgentName
			} else {
				rpc.LargeImage = mapAsset
				rpc.LargeText = mapName
			}

			if mapName != "" {
				rpc.SmallImage = "valorant"
				rpc.SmallText = mapName
			} else {
				rpc.SmallImage = "valorant"
				rpc.SmallText = cfg.GetCreditText()
			}
		} else {
			if st.AllyScore > 0 || st.EnemyScore > 0 {
				rpc.State = fmt.Sprintf("Score: %d - %d", st.AllyScore, st.EnemyScore)
			} else if partyInfo != "" {
				rpc.State = fmt.Sprintf("In Game (%s)", partyInfo)
			} else {
				rpc.State = "In Game"
			}

			if mapAsset != "" {
				rpc.LargeImage = mapAsset
			}
			if mapName != "" {
				rpc.LargeText = mapName
			}

			rpc.SmallImage = "valorant"
			rpc.SmallText = cfg.GetCreditText()
		}

		if st.GameStartTime > 0 {
			rpc.Start = st.GameStartTime
		}

	case "MENUS":
		fallthrough
	default:
		// Menus / Lobby
		if st.PartyState == "MATCHMAKING" {
			if queueName != "" {
				rpc.Details = fmt.Sprintf("In Queue - %s", queueName)
			} else {
				rpc.Details = "In Queue"
			}
			if partyInfo != "" {
				rpc.State = partyInfo
			} else {
				rpc.State = "Finding Match"
			}
		} else {
			if queueName != "" {
				rpc.Details = fmt.Sprintf("In Lobby - %s", queueName)
			} else {
				rpc.Details = "In Lobby"
			}
			if partyInfo != "" {
				rpc.State = partyInfo
			} else {
				rpc.State = "In Menus"
			}
		}
		rpc.LargeImage = "valorant"
		rpc.LargeText = "VALORANT"
		rpc.SmallImage = ""
		rpc.SmallText = ""
	}

	return rpc
}

// BuildAlwaysActivePresence builds fake / static presence for Valorant.
func BuildAlwaysActivePresence(cfg *config.Config) *discord.RPCData {
	if cfg == nil {
		return &discord.RPCData{}
	}

	agent := cfg.Presence.AlwaysActiveValorantAgent
	if agent == "" {
		agent = "Sage"
	}

	mapName := cfg.Presence.AlwaysActiveValorantMap
	if mapName == "" {
		mapName = "Ascent"
	}

	queue := cfg.Presence.AlwaysActiveValorantQueue
	if queue == "" {
		queue = "Competitive"
	}

	agentName, _, iconURL := ResolveAgentByName(agent)
	if iconURL == "" {
		iconURL = "valorant"
	}

	var start int64
	if !cfg.Presence.AlwaysActiveTimerStopped {
		if cfg.Presence.AlwaysActiveStartTime > 0 {
			start = cfg.Presence.AlwaysActiveStartTime
		}
	}

	rpc := &discord.RPCData{
		LargeImage: iconURL,
		LargeText:  agentName,
		SmallImage: "valorant",
		SmallText:  mapName,
		Details:    fmt.Sprintf("%s - %s", queue, mapName),
		State:      fmt.Sprintf("Playing %s", agentName),
		Start:      start,
	}

	if cfg.Presence.ButtonLabel != "" && cfg.Presence.ButtonURL != "" {
		rpc.Buttons = []discord.Button{
			{
				Label: cfg.Presence.ButtonLabel,
				URL:   cfg.Presence.ButtonURL,
			},
		}
	}

	return rpc
}
