package valorant

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"testing"

	"github.com/rs/zerolog"
)

type fakeHTTPDoer struct {
	resp *http.Response
	err  error
}

func (f *fakeHTTPDoer) Do(req *http.Request) (*http.Response, error) {
	return f.resp, f.err
}

func TestClient_FetchPresence(t *testing.T) {
	tmpDir := t.TempDir()
	lockPath := filepath.Join(tmpDir, "lockfile")
	if err := os.WriteFile(lockPath, []byte("Riot Client:1:5000:pass:https"), 0644); err != nil {
		t.Fatal(err)
	}

	priv := ValorantPrivateData{
		IsValid:                      true,
		SessionLoopState:             "INGAME",
		QueueID:                      "competitive",
		MatchMap:                     "/Game/Maps/Ascent/Ascent",
		PartyOwnerMatchScoreAllyTeam: 5,
		PartyOwnerMatchScoreEnemyTeam: 3,
		PartySize:                    1,
		MaxPartySize:                 5,
	}
	privBytes, _ := json.Marshal(priv)
	privB64 := base64.StdEncoding.EncodeToString(privBytes)

	respObj := PresencesResponse{
		Presences: []RawPresence{
			{
				Product: "league_of_legends",
				Private: "",
			},
			{
				Product: "valorant",
				Private: privB64,
			},
		},
	}
	bodyBytes, _ := json.Marshal(respObj)

	client := NewClient(
		zerolog.Nop(),
		WithLockfilePath(lockPath),
		WithHTTPDoer(&fakeHTTPDoer{
			resp: &http.Response{
				StatusCode: 200,
				Body:       io.NopCloser(bytes.NewReader(bodyBytes)),
			},
		}),
	)

	got, err := client.FetchPresence(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if got.SessionLoopState != "INGAME" || got.QueueID != "competitive" {
		t.Errorf("unexpected presence: %+v", got)
	}
	if !client.IsConnected() {
		t.Errorf("expected client.IsConnected() to be true")
	}
}
