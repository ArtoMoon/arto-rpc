package valorant

import (
	"path"
	"strings"
)

type mapInfo struct {
	Name     string
	AssetKey string
}

var knownMaps = map[string]mapInfo{
	"/Game/Maps/Ascent/Ascent":     {Name: "Ascent", AssetKey: "ascent"},
	"/Game/Maps/Bonsai/Bonsai":     {Name: "Split", AssetKey: "split"},
	"/Game/Maps/Duality/Duality":   {Name: "Bind", AssetKey: "bind"},
	"/Game/Maps/Port/Port":         {Name: "Icebox", AssetKey: "icebox"},
	"/Game/Maps/Triad/Triad":       {Name: "Haven", AssetKey: "haven"},
	"/Game/Maps/Foxtrot/Foxtrot":   {Name: "Breeze", AssetKey: "breeze"},
	"/Game/Maps/Canyon/Canyon":     {Name: "Fracture", AssetKey: "fracture"},
	"/Game/Maps/Pitt/Pitt":         {Name: "Pearl", AssetKey: "pearl"},
	"/Game/Maps/Jam/Jam":           {Name: "Lotus", AssetKey: "lotus"},
	"/Game/Maps/Jules/Jules":       {Name: "Sunset", AssetKey: "sunset"},
	"/Game/Maps/Infinity/Infinity": {Name: "Abyss", AssetKey: "abyss"},
	"/Game/Maps/Poveglia/Poveglia": {Name: "The Range", AssetKey: "range"},
	"/Game/Maps/Kasbah/Kasbah":     {Name: "Kasbah", AssetKey: "kasbah"},
	"/Game/Maps/Piazza/Piazza":     {Name: "Piazza", AssetKey: "piazza"},
	"/Game/Maps/District/District": {Name: "District", AssetKey: "district"},
	"/Game/Maps/Drift/Drift":       {Name: "Drift", AssetKey: "drift"},
}

// ResolveMap converts a raw Valorant map path into a human-readable display name
// and Discord asset key.
func ResolveMap(mapPath string) (name string, assetKey string) {
	if mapPath == "" {
		return "", "valorant"
	}

	if info, ok := knownMaps[mapPath]; ok {
		return info.Name, info.AssetKey
	}

	// Also check case-insensitively or matching suffix
	clean := strings.TrimRight(mapPath, "/")
	base := path.Base(clean)
	for k, info := range knownMaps {
		if strings.EqualFold(k, mapPath) || strings.EqualFold(path.Base(k), base) {
			return info.Name, info.AssetKey
		}
	}

	// Fallback: use the base name of the path
	if base != "" && base != "." {
		return base, strings.ToLower(base)
	}

	return "Unknown Map", "valorant"
}
