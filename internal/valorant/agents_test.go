package valorant

import (
	"testing"
)

func TestResolveAgent(t *testing.T) {
	tests := []struct {
		charID      string
		wantName    string
		wantAsset   string
		wantIconURL string
	}{
		{
			charID:      "569fdd95-4d10-43ab-ca70-79becc718b46",
			wantName:    "Sage",
			wantAsset:   "sage",
			wantIconURL: "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png",
		},
		{
			charID:      "add6443a-41bd-e414-f6ad-e58d267f4e95",
			wantName:    "Jett",
			wantAsset:   "jett",
			wantIconURL: "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png",
		},
		{
			charID:      "",
			wantName:    "",
			wantAsset:   "",
			wantIconURL: "",
		},
		{
			charID:      "unknown-uuid-1234",
			wantName:    "",
			wantAsset:   "",
			wantIconURL: "https://media.valorant-api.com/agents/unknown-uuid-1234/displayicon.png",
		},
	}

	for _, tt := range tests {
		name, asset, iconURL := ResolveAgent(tt.charID)
		if name != tt.wantName {
			t.Errorf("ResolveAgent(%q) name = %q, want %q", tt.charID, name, tt.wantName)
		}
		if asset != tt.wantAsset {
			t.Errorf("ResolveAgent(%q) asset = %q, want %q", tt.charID, asset, tt.wantAsset)
		}
		if iconURL != tt.wantIconURL {
			t.Errorf("ResolveAgent(%q) iconURL = %q, want %q", tt.charID, iconURL, tt.wantIconURL)
		}
	}
}
