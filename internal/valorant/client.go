package valorant

import (
	"context"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync/atomic"
	"time"

	"github.com/rs/zerolog"
)

// HTTPDoer makes HTTP requests; allows mocking in tests.
type HTTPDoer interface {
	Do(req *http.Request) (*http.Response, error)
}

// Client communicates with the local Riot Client API for Valorant.
type Client struct {
	http         HTTPDoer
	lockfilePath string
	logger            zerolog.Logger
	connected         atomic.Bool
	lastLockfile      *Lockfile
	region            string
	cachedToken       *entitlementsToken
	cachedMatchID     string
	cachedCharacterID string
}

type entitlementsToken struct {
	AccessToken string `json:"accessToken"`
	Token       string `json:"token"`
	Subject     string `json:"subject"`
}

// ClientOption configures a Client.
type ClientOption func(*Client)

// WithHTTPDoer overrides the HTTP client.
func WithHTTPDoer(doer HTTPDoer) ClientOption {
	return func(c *Client) { c.http = doer }
}

// WithLockfilePath overrides the lockfile path.
func WithLockfilePath(path string) ClientOption {
	return func(c *Client) { c.lockfilePath = path }
}

// NewClient returns a new Valorant local API client.
func NewClient(logger zerolog.Logger, opts ...ClientOption) *Client {
	c := &Client{
		lockfilePath: DefaultLockfilePath(),
		logger:       logger,
	}

	for _, opt := range opts {
		opt(c)
	}

	if c.http == nil {
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // Riot local API uses self-signed TLS cert
		}
		c.http = &http.Client{
			Transport: tr,
			Timeout:   3 * time.Second,
		}
	}

	return c
}

// IsConnected reports whether the client recently successfully connected to the Riot Client API.
func (c *Client) IsConnected() bool {
	return c.connected.Load()
}

// FetchPresence queries /chat/v4/presences and returns the local player's Valorant private data.
func (c *Client) FetchPresence(ctx context.Context) (*ValorantPrivateData, error) {
	lf, err := ReadLockfile(c.lockfilePath)
	if err != nil {
		c.connected.Store(false)
		return nil, fmt.Errorf("could not read Riot lockfile: %w", err)
	}
	c.lastLockfile = lf

	url := fmt.Sprintf("https://127.0.0.1:%s/chat/v4/presences", lf.Port)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.SetBasicAuth("riot", lf.Password)

	resp, err := c.http.Do(req)
	if err != nil {
		c.connected.Store(false)
		return nil, fmt.Errorf("failed to query Riot API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusServiceUnavailable {
		// Riot Client is starting or chat service is connecting
		c.connected.Store(false)
		return nil, errors.New("chat service currently unavailable")
	}

	if resp.StatusCode != http.StatusOK {
		c.connected.Store(false)
		return nil, fmt.Errorf("riot API returned status %d", resp.StatusCode)
	}

	var data PresencesResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		c.connected.Store(false)
		return nil, fmt.Errorf("failed to decode presences JSON: %w", err)
	}

	c.connected.Store(true)

	// Find the presence item for Valorant
	for _, p := range data.Presences {
		if p.Product != "valorant" || p.Private == "" {
			continue
		}

		decoded, err := base64.StdEncoding.DecodeString(p.Private)
		if err != nil {
			c.logger.Debug().Err(err).Msg("Failed to decode Valorant private base64")
			continue
		}

		var priv ValorantPrivateData
		if err := json.Unmarshal(decoded, &priv); err != nil {
			c.logger.Debug().Err(err).Msg("Failed to unmarshal Valorant private data")
			continue
		}

		if priv.IsValid || priv.EffectiveSessionLoopState() != "" {
			return &priv, nil
		}
	}

	return nil, errors.New("no active Valorant presence found")
}

type glzPlayerResponse struct {
	MatchID string `json:"MatchID"`
	Subject string `json:"Subject"`
}

type glzMatchResponse struct {
	Players []struct {
		Subject     string `json:"Subject"`
		CharacterID string `json:"CharacterID"`
	} `json:"Players"`
}

func (c *Client) getRegion(ctx context.Context, lf *Lockfile) string {
	if c.region != "" {
		return c.region
	}

	// 1. Try external-sessions
	url := fmt.Sprintf("https://127.0.0.1:%s/product-session/v1/external-sessions", lf.Port)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err == nil {
		req.SetBasicAuth("riot", lf.Password)
		resp, err := c.http.Do(req)
		if err == nil {
			defer resp.Body.Close()
			if resp.StatusCode == http.StatusOK {
				var sessions map[string]struct {
					LaunchConfiguration struct {
						Arguments []string `json:"arguments"`
					} `json:"launchConfiguration"`
				}
				if err := json.NewDecoder(resp.Body).Decode(&sessions); err == nil {
					for _, s := range sessions {
						for _, arg := range s.LaunchConfiguration.Arguments {
							if strings.HasPrefix(arg, "-ares-deployment=") {
								reg := strings.TrimPrefix(arg, "-ares-deployment=")
								if reg != "" {
									c.region = reg
									return c.region
								}
							}
						}
					}
				}
			}
		}
	}

	// 2. Try region-locale fallback
	url = fmt.Sprintf("https://127.0.0.1:%s/riotclient/region-locale", lf.Port)
	req, err = http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err == nil {
		req.SetBasicAuth("riot", lf.Password)
		resp, err := c.http.Do(req)
		if err == nil {
			defer resp.Body.Close()
			if resp.StatusCode == http.StatusOK {
				var rl struct {
					Region string `json:"region"`
				}
				if err := json.NewDecoder(resp.Body).Decode(&rl); err == nil {
					switch strings.ToUpper(rl.Region) {
					case "TR", "EU", "EUNE", "EUW", "RU", "TUR":
						c.region = "eu"
					case "NA", "LATAM", "BR":
						c.region = "na"
					case "AP", "OCE", "JP":
						c.region = "ap"
					case "KR":
						c.region = "kr"
					}
				}
			}
		}
	}

	if c.region == "" {
		c.region = "eu"
	}
	return c.region
}

func (c *Client) getEntitlements(ctx context.Context, lf *Lockfile) (*entitlementsToken, error) {
	if c.cachedToken != nil && c.cachedToken.AccessToken != "" && c.cachedToken.Token != "" {
		return c.cachedToken, nil
	}

	url := fmt.Sprintf("https://127.0.0.1:%s/entitlements/v1/token", lf.Port)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.SetBasicAuth("riot", lf.Password)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("token endpoint status %d", resp.StatusCode)
	}

	var tok entitlementsToken
	if err := json.NewDecoder(resp.Body).Decode(&tok); err != nil {
		return nil, err
	}

	c.cachedToken = &tok
	return &tok, nil
}

// FetchActiveCharacter retrieves the character UUID for the local player from GLZ services.
func (c *Client) FetchActiveCharacter(ctx context.Context, sessionLoopState string) (string, error) {
	if sessionLoopState != "INGAME" && sessionLoopState != "PREGAME" {
		c.cachedMatchID = ""
		c.cachedCharacterID = ""
		return "", nil
	}

	lf := c.lastLockfile
	if lf == nil {
		var err error
		lf, err = ReadLockfile(c.lockfilePath)
		if err != nil {
			return "", err
		}
		c.lastLockfile = lf
	}

	tok, err := c.getEntitlements(ctx, lf)
	if err != nil {
		return "", fmt.Errorf("failed to get entitlements: %w", err)
	}

	region := c.getRegion(ctx, lf)
	endpointPrefix := "core-game"
	if sessionLoopState == "PREGAME" {
		endpointPrefix = "pregame"
	}

	// 1. Get player's current match
	playerURL := fmt.Sprintf("https://glz-%s-1.%s.a.pvp.net/%s/v1/players/%s", region, region, endpointPrefix, tok.Subject)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, playerURL, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+tok.AccessToken)
	req.Header.Set("X-Riot-Entitlements-JWT", tok.Token)
	req.Header.Set("X-Riot-ClientPlatform", "ewogICJwbGF0Zm9ybVR5cGUiOiAiUEMiLAogICJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLAogICJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwKICAicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iCn0=")
	req.Header.Set("X-Riot-ClientVersion", "release-13.06-shipping-17-5574446")

	resp, err := c.http.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		c.cachedToken = nil
		return "", errors.New("unauthorized")
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("player match returned status %d", resp.StatusCode)
	}

	var playerResp glzPlayerResponse
	if err := json.NewDecoder(resp.Body).Decode(&playerResp); err != nil {
		return "", err
	}

	matchID := playerResp.MatchID
	if matchID == "" {
		return "", nil
	}

	if sessionLoopState == "INGAME" && matchID == c.cachedMatchID && c.cachedCharacterID != "" {
		return c.cachedCharacterID, nil
	}

	// 2. Query match details
	matchURL := fmt.Sprintf("https://glz-%s-1.%s.a.pvp.net/%s/v1/matches/%s", region, region, endpointPrefix, matchID)
	req2, err := http.NewRequestWithContext(ctx, http.MethodGet, matchURL, nil)
	if err != nil {
		return "", err
	}
	req2.Header.Set("Authorization", "Bearer "+tok.AccessToken)
	req2.Header.Set("X-Riot-Entitlements-JWT", tok.Token)
	req2.Header.Set("X-Riot-ClientPlatform", "ewogICJwbGF0Zm9ybVR5cGUiOiAiUEMiLAogICJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLAogICJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwKICAicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iCn0=")
	req2.Header.Set("X-Riot-ClientVersion", "release-13.06-shipping-17-5574446")

	resp2, err := c.http.Do(req2)
	if err != nil {
		return "", err
	}
	defer resp2.Body.Close()

	if resp2.StatusCode != http.StatusOK {
		return "", fmt.Errorf("match returned status %d", resp2.StatusCode)
	}

	var matchResp glzMatchResponse
	if err := json.NewDecoder(resp2.Body).Decode(&matchResp); err != nil {
		return "", err
	}

	for _, p := range matchResp.Players {
		if p.Subject == tok.Subject && p.CharacterID != "" {
			if sessionLoopState == "INGAME" {
				c.cachedMatchID = matchID
				c.cachedCharacterID = p.CharacterID
			}
			return p.CharacterID, nil
		}
	}

	return "", nil
}

