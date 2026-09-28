package valorant

import "testing"

func TestResolveMap(t *testing.T) {
	tests := []struct {
		input     string
		wantName  string
		wantAsset string
	}{
		{"/Game/Maps/Ascent/Ascent", "Ascent", "ascent"},
		{"/Game/Maps/Duality/Duality", "Bind", "bind"},
		{"/Game/Maps/Triad/Triad", "Haven", "haven"},
		{"/Game/Maps/Bonsai/Bonsai", "Split", "split"},
		{"/Game/Maps/Port/Port", "Icebox", "icebox"},
		{"/Game/Maps/Infinity/Infinity", "Abyss", "abyss"},
		{"/Game/Maps/Poveglia/Poveglia", "The Range", "range"},
		{"", "", "valorant"},
		{"/Game/Maps/CustomMap/CustomMap", "CustomMap", "custommap"},
	}

	for _, tt := range tests {
		name, asset := ResolveMap(tt.input)
		if name != tt.wantName || asset != tt.wantAsset {
			t.Errorf("ResolveMap(%q) = (%q, %q), want (%q, %q)", tt.input, name, asset, tt.wantName, tt.wantAsset)
		}
	}
}
