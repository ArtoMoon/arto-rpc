package valorant

// RawPresence represents a single presence entry returned by Riot Client's /chat/v4/presences.
type RawPresence struct {
	GameName string `json:"game_name"`
	GameTag  string `json:"game_tag"`
	Product  string `json:"product"`
	Private  string `json:"private"`
	State    string `json:"state"`
	PUUID    string `json:"puuid"`
	Time     int64  `json:"time"`
}

// PresencesResponse is the top-level object returned by /chat/v4/presences.
type PresencesResponse struct {
	Presences []RawPresence `json:"presences"`
}

// ValorantPrivateData is the base64-decoded JSON payload in a Valorant presence.
type ValorantPrivateData struct {
	IsValid                      bool   `json:"isValid"`
	IsIdle                       bool   `json:"isIdle"`
	SessionLoopState             string `json:"sessionLoopState"` // MENUS, PREGAME, INGAME
	PartyID                      string `json:"partyId"`
	PartySize                    int    `json:"partySize"`
	MaxPartySize                 int    `json:"maxPartySize"`
	PartyAccessibility           string `json:"partyAccessibility"` // OPEN, CLOSED
	PartyOwner                   bool   `json:"partyOwner"`
	PartyState                   string `json:"partyState"` // DEFAULT, MATCHMAKING, CUSTOM_GAME_SETUP
	QueueID                      string `json:"queueId"`
	ProvisioningFlow             string `json:"provisioningFlow"` // Matchmaking, CustomGame
	MatchMap                     string `json:"matchMap"`
	PartyOwnerMatchScoreAllyTeam int    `json:"partyOwnerMatchScoreAllyTeam"`
	PartyOwnerMatchScoreEnemyTeam int   `json:"partyOwnerMatchScoreEnemyTeam"`
	AccountLevel                 int    `json:"accountLevel"`

	MatchPresenceData struct {
		GameScoreType    string `json:"gameScoreType"`
		MatchMap         string `json:"matchMap"`
		ProvisioningFlow string `json:"provisioningFlow"`
		QueueID          string `json:"queueId"`
		SessionLoopState string `json:"sessionLoopState"`
	} `json:"matchPresenceData"`

	PartyPresenceData struct {
		CustomGameName               string `json:"customGameName"`
		CustomGameTeam               string `json:"customGameTeam"`
		PartyAccessibility           string `json:"partyAccessibility"`
		PartyID                      string `json:"partyId"`
		PartyOwnerMatchMap           string `json:"partyOwnerMatchMap"`
		PartyOwnerMatchScoreAllyTeam int    `json:"partyOwnerMatchScoreAllyTeam"`
		PartyOwnerMatchScoreEnemyTeam int   `json:"partyOwnerMatchScoreEnemyTeam"`
		PartyOwnerProvisioningFlow   string `json:"partyOwnerProvisioningFlow"`
		PartyOwnerSessionLoopState   string `json:"partyOwnerSessionLoopState"`
		PartySize                    int    `json:"partySize"`
		PartyState                   string `json:"partyState"`
	} `json:"partyPresenceData"`

	PlayerPresenceData struct {
		AccountLevel        int    `json:"accountLevel"`
		CompetitiveTier     int    `json:"competitiveTier"`
		LeaderboardPosition int    `json:"leaderboardPosition"`
		PlayerCardID        string `json:"playerCardId"`
		PlayerTitleID       string `json:"playerTitleId"`
	} `json:"playerPresenceData"`
}

// EffectiveSessionLoopState returns the active loop state (MENUS, PREGAME, INGAME).
func (p *ValorantPrivateData) EffectiveSessionLoopState() string {
	if p.MatchPresenceData.SessionLoopState != "" {
		return p.MatchPresenceData.SessionLoopState
	}
	if p.PartyPresenceData.PartyOwnerSessionLoopState != "" {
		return p.PartyPresenceData.PartyOwnerSessionLoopState
	}
	return p.SessionLoopState
}

// EffectiveMatchMap returns the map path.
func (p *ValorantPrivateData) EffectiveMatchMap() string {
	if p.MatchPresenceData.MatchMap != "" {
		return p.MatchPresenceData.MatchMap
	}
	if p.PartyPresenceData.PartyOwnerMatchMap != "" {
		return p.PartyPresenceData.PartyOwnerMatchMap
	}
	return p.MatchMap
}

// EffectiveQueueID returns the queue identifier from either MatchPresenceData or root fields.
func (p *ValorantPrivateData) EffectiveQueueID() string {
	if p.MatchPresenceData.QueueID != "" {
		return p.MatchPresenceData.QueueID
	}
	if p.QueueID != "" {
		return p.QueueID
	}
	flow := p.MatchPresenceData.ProvisioningFlow
	if flow == "" {
		flow = p.ProvisioningFlow
	}
	if flow == "CustomGame" || p.PartyPresenceData.PartyOwnerProvisioningFlow == "CustomGame" {
		return "custom"
	}
	return ""
}

// EffectivePartyState returns the active party state.
func (p *ValorantPrivateData) EffectivePartyState() string {
	if p.PartyPresenceData.PartyState != "" {
		return p.PartyPresenceData.PartyState
	}
	return p.PartyState
}

// EffectivePartySize returns the current party size and max party size.
func (p *ValorantPrivateData) EffectivePartySize() (size int, max int) {
	size = p.PartySize
	if size == 0 {
		size = p.PartyPresenceData.PartySize
	}
	max = p.MaxPartySize
	if max == 0 {
		max = p.PartyPresenceData.PartySize
	}
	return size, max
}

// EffectiveScores returns ally and enemy scores.
func (p *ValorantPrivateData) EffectiveScores() (ally int, enemy int) {
	if p.PartyPresenceData.PartyOwnerMatchScoreAllyTeam > 0 || p.PartyPresenceData.PartyOwnerMatchScoreEnemyTeam > 0 {
		return p.PartyPresenceData.PartyOwnerMatchScoreAllyTeam, p.PartyPresenceData.PartyOwnerMatchScoreEnemyTeam
	}
	return p.PartyOwnerMatchScoreAllyTeam, p.PartyOwnerMatchScoreEnemyTeam
}

// State represents the clean, processed runtime state of Valorant.
type State struct {
	ProcessRunning   bool   `json:"process_running"`
	Connected        bool   `json:"connected"`
	SessionLoopState string `json:"session_loop_state"` // MENUS, PREGAME, INGAME
	QueueID          string `json:"queue_id"`
	QueueName        string `json:"queue_name"`
	PartyID          string `json:"party_id"`
	PartySize        int    `json:"party_size"`
	MaxPartySize     int    `json:"max_party_size"`
	PartyState       string `json:"party_state"`
	MatchMap         string `json:"match_map"`
	MapName          string `json:"map_name"`
	MapAsset         string `json:"map_asset"`
	AllyScore        int    `json:"ally_score"`
	EnemyScore       int    `json:"enemy_score"`
	AccountLevel     int    `json:"account_level"`
	GameStartTime    int64  `json:"game_start_time"`
	CharacterID      string `json:"character_id"`
	AgentName        string `json:"agent_name"`
	AgentAsset       string `json:"agent_asset"`
	AgentIconURL     string `json:"agent_icon_url"`
}

// Equals reports whether two Valorant states are functionally identical.
func (s *State) Equals(o *State) bool {
	if s == nil || o == nil {
		return s == o
	}
	return s.ProcessRunning == o.ProcessRunning &&
		s.Connected == o.Connected &&
		s.SessionLoopState == o.SessionLoopState &&
		s.QueueID == o.QueueID &&
		s.QueueName == o.QueueName &&
		s.PartyID == o.PartyID &&
		s.PartySize == o.PartySize &&
		s.MaxPartySize == o.MaxPartySize &&
		s.PartyState == o.PartyState &&
		s.MatchMap == o.MatchMap &&
		s.MapName == o.MapName &&
		s.MapAsset == o.MapAsset &&
		s.AllyScore == o.AllyScore &&
		s.EnemyScore == o.EnemyScore &&
		s.AccountLevel == o.AccountLevel &&
		s.GameStartTime == o.GameStartTime &&
		s.CharacterID == o.CharacterID &&
		s.AgentName == o.AgentName
}

// Copy creates a deep copy of State.
func (s *State) Copy() *State {
	if s == nil {
		return nil
	}
	cp := *s
	return &cp
}
