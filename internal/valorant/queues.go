package valorant

import (
	"strings"
)

var knownQueues = map[string]string{
	"competitive": "Competitive",
	"unrated":     "Unrated",
	"spikerush":   "Spike Rush",
	"deathmatch":  "Deathmatch",
	"ggteam":      "Swiftplay",
	"hurm":        "Team Deathmatch",
	"onefa":       "Replication",
	"snowball":    "Snowball Fight",
	"escalation":  "Escalation",
	"newmap":      "Premier",
	"custom":      "Custom Game",
}

// ResolveQueue converts a Valorant queue ID into a display name.
func ResolveQueue(queueID string) string {
	if queueID == "" {
		return ""
	}

	norm := strings.ToLower(strings.TrimSpace(queueID))
	if name, ok := knownQueues[norm]; ok {
		return name
	}

	// Simple title-case fallback for unrecognized modes
	if len(norm) > 0 {
		return strings.ToUpper(norm[:1]) + norm[1:]
	}
	return queueID
}
