package valorant

import (
	"os"
	"path/filepath"
	"testing"
)

func TestReadLockfile(t *testing.T) {
	tmpDir := t.TempDir()
	path := filepath.Join(tmpDir, "lockfile")

	err := os.WriteFile(path, []byte("Riot Client:1234:5678:s3cr3t:https"), 0644)
	if err != nil {
		t.Fatal(err)
	}

	lf, err := ReadLockfile(path)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if lf.Process != "Riot Client" || lf.PID != "1234" || lf.Port != "5678" || lf.Password != "s3cr3t" || lf.Protocol != "https" {
		t.Errorf("parsed lockfile mismatch: %+v", lf)
	}
}

func TestReadLockfile_InvalidFormat(t *testing.T) {
	tmpDir := t.TempDir()
	path := filepath.Join(tmpDir, "lockfile")

	err := os.WriteFile(path, []byte("invalid:format"), 0644)
	if err != nil {
		t.Fatal(err)
	}

	_, err = ReadLockfile(path)
	if err == nil {
		t.Fatal("expected error on invalid lockfile format, got nil")
	}
}
