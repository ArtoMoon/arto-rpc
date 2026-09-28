package valorant

import (
	"testing"

	"github.com/ArtoMoon/arto-rpc/internal/config"
)

func TestBuildPresence_Menus(t *testing.T) {
	cfg := config.DefaultConfig()

	// In queue
	stQueue := &State{
		SessionLoopState: "MENUS",
		PartyState:       "MATCHMAKING",
		QueueID:          "competitive",
		QueueName:        "Competitive",
		PartySize:        2,
		MaxPartySize:     5,
	}
	rpc := BuildPresence(stQueue, cfg)
	if rpc.Details != "In Queue - Competitive" {
		t.Errorf("expected details 'In Queue - Competitive', got %q", rpc.Details)
	}
	if rpc.State != "Party: 2/5" {
		t.Errorf("expected state 'Party: 2/5', got %q", rpc.State)
	}

	// In Lobby
	stLobby := &State{
		SessionLoopState: "MENUS",
		PartyState:       "DEFAULT",
		QueueID:          "unrated",
		QueueName:        "Unrated",
		PartySize:        1,
		MaxPartySize:     5,
	}
	rpcLobby := BuildPresence(stLobby, cfg)
	if rpcLobby.Details != "In Lobby - Unrated" {
		t.Errorf("expected details 'In Lobby - Unrated', got %q", rpcLobby.Details)
	}
}

func TestBuildPresence_Pregame(t *testing.T) {
	cfg := config.DefaultConfig()
	st := &State{
		SessionLoopState: "PREGAME",
		QueueName:        "Competitive",
		MapName:          "Ascent",
		MapAsset:         "ascent",
	}
	rpc := BuildPresence(st, cfg)
	if rpc.Details != "Agent Select - Competitive" {
		t.Errorf("got %q, want 'Agent Select - Competitive'", rpc.Details)
	}
	if rpc.State != "Map: Ascent" {
		t.Errorf("got %q, want 'Map: Ascent'", rpc.State)
	}
	if rpc.LargeImage != "ascent" {
		t.Errorf("got %q, want 'ascent'", rpc.LargeImage)
	}
}

func TestBuildPresence_InGame(t *testing.T) {
	cfg := config.DefaultConfig()
	st := &State{
		SessionLoopState: "INGAME",
		QueueName:        "Competitive",
		MapName:          "Bind",
		MapAsset:         "bind",
		AllyScore:        9,
		EnemyScore:       6,
		GameStartTime:    1234567,
	}
	rpc := BuildPresence(st, cfg)
	if rpc.Details != "Competitive - Bind" {
		t.Errorf("got %q, want 'Competitive - Bind'", rpc.Details)
	}
	if rpc.State != "Score: 9 - 6" {
		t.Errorf("got %q, want 'Score: 9 - 6'", rpc.State)
	}
	if rpc.LargeImage != "bind" {
		t.Errorf("got %q, want 'bind'", rpc.LargeImage)
	}
	if rpc.Start != 1234567 {
		t.Errorf("expected timestamp 1234567, got %d", rpc.Start)
	}
}

func TestBuildPresence_InGame_WithAgent(t *testing.T) {
	cfg := config.DefaultConfig()
	st := &State{
		SessionLoopState: "INGAME",
		QueueName:        "Custom Game",
		MapName:          "Ascent",
		MapAsset:         "ascent",
		PartySize:        1,
		MaxPartySize:     12,
		AgentName:        "Sage",
		AgentAsset:       "sage",
		AgentIconURL:     "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png",
		GameStartTime:    1790582295,
	}
	rpc := BuildPresence(st, cfg)
	if rpc.Details != "Custom Game - Ascent" {
		t.Errorf("got %q, want 'Custom Game - Ascent'", rpc.Details)
	}
	if rpc.State != "Playing Sage (Party: 1/12)" {
		t.Errorf("got %q, want 'Playing Sage (Party: 1/12)'", rpc.State)
	}
	if rpc.LargeImage != st.AgentIconURL {
		t.Errorf("got %q, want %q", rpc.LargeImage, st.AgentIconURL)
	}
	if rpc.LargeText != "Sage" {
		t.Errorf("got %q, want 'Sage'", rpc.LargeText)
	}
	if rpc.SmallImage != "valorant" {
		t.Errorf("got %q, want 'valorant'", rpc.SmallImage)
	}
	if rpc.SmallText != "Ascent" {
		t.Errorf("got %q, want 'Ascent'", rpc.SmallText)
	}
}

