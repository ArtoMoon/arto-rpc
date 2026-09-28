package valorant

import "testing"

func TestResolveQueue(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"competitive", "Competitive"},
		{"unrated", "Unrated"},
		{"ggteam", "Swiftplay"},
		{"spikerush", "Spike Rush"},
		{"deathmatch", "Deathmatch"},
		{"hurm", "Team Deathmatch"},
		{"", ""},
		{"custom", "Custom Game"},
	}

	for _, tt := range tests {
		got := ResolveQueue(tt.input)
		if got != tt.want {
			t.Errorf("ResolveQueue(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}
