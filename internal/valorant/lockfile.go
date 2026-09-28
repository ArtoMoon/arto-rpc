package valorant

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Lockfile holds the credentials parsed from Riot Client's lockfile.
type Lockfile struct {
	Process  string
	PID      string
	Port     string
	Password string
	Protocol string
}

// DefaultLockfilePath returns the standard path to Riot Client's lockfile.
func DefaultLockfilePath() string {
	localAppData := os.Getenv("LOCALAPPDATA")
	if localAppData == "" {
		return ""
	}
	return filepath.Join(localAppData, "Riot Games", "Riot Client", "Config", "lockfile")
}

// ReadLockfile reads and parses a lockfile from the specified path.
func ReadLockfile(path string) (*Lockfile, error) {
	if path == "" {
		return nil, errors.New("lockfile path is empty")
	}

	content, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read lockfile: %w", err)
	}

	parts := strings.Split(strings.TrimSpace(string(content)), ":")
	if len(parts) < 5 {
		return nil, fmt.Errorf("invalid lockfile format, expected 5 parts, got %d", len(parts))
	}

	return &Lockfile{
		Process:  parts[0],
		PID:      parts[1],
		Port:     parts[2],
		Password: parts[3],
		Protocol: parts[4],
	}, nil
}
