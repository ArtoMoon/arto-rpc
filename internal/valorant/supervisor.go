package valorant

import (
	"context"
	"sync"
	"sync/atomic"
	"time"

	"github.com/ArtoMoon/arto-rpc/pkg/constants"
	"github.com/rs/zerolog"
)

// ProcessChecker reports whether any process in names is running.
type ProcessChecker interface {
	IsRunning(names ...string) (bool, error)
}

// PresenceFetcher queries Valorant presence; *Client satisfies this.
type PresenceFetcher interface {
	FetchPresence(ctx context.Context) (*ValorantPrivateData, error)
	FetchActiveCharacter(ctx context.Context, sessionLoopState string) (string, error)
	IsConnected() bool
}

// Supervisor manages Valorant process detection and state polling.
type Supervisor struct {
	checker      ProcessChecker
	fetcher      PresenceFetcher
	logger       zerolog.Logger
	pollInterval time.Duration

	processNames []string
	processUp    atomic.Bool
	connected    atomic.Bool

	mu          sync.RWMutex
	state       *State
	subscribers []chan *State
}

// SupervisorOption configures a Supervisor.
type SupervisorOption func(*Supervisor)

// WithPollInterval sets the poll interval for checking Valorant presence.
func WithPollInterval(d time.Duration) SupervisorOption {
	return func(s *Supervisor) { s.pollInterval = d }
}

// NewSupervisor creates a new Supervisor for Valorant.
func NewSupervisor(checker ProcessChecker, fetcher PresenceFetcher, logger zerolog.Logger, opts ...SupervisorOption) *Supervisor {
	s := &Supervisor{
		checker:      checker,
		fetcher:      fetcher,
		logger:       logger,
		pollInterval: 2 * time.Second,
		processNames: []string{
			constants.ValorantProcessName,
			constants.ValorantShippingProcessName,
		},
		state: &State{},
	}
	for _, opt := range opts {
		opt(s)
	}
	return s
}

// ProcessRunning reports whether the Valorant OS process was detected.
func (s *Supervisor) ProcessRunning() bool {
	return s.processUp.Load()
}

// Connected reports whether Valorant local API is currently connected.
func (s *Supervisor) Connected() bool {
	return s.connected.Load()
}

// Get returns a copy of the current Valorant state.
func (s *Supervisor) Get() *State {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.state.Copy()
}

// Subscribe returns a channel that receives state updates.
func (s *Supervisor) Subscribe() <-chan *State {
	s.mu.Lock()
	defer s.mu.Unlock()
	ch := make(chan *State, 5)
	s.subscribers = append(s.subscribers, ch)
	return ch
}

func (s *Supervisor) broadcast(st *State) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.state = st.Copy()
	for _, ch := range s.subscribers {
		select {
		case ch <- st.Copy():
		default:
		}
	}
}

// Run checks process status and polls presence until ctx is canceled.
func (s *Supervisor) Run(ctx context.Context) {
	ticker := time.NewTicker(s.pollInterval)
	defer ticker.Stop()

	var matchStart int64
	var lastLoopState string

	s.poll(ctx, &matchStart, &lastLoopState)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			s.poll(ctx, &matchStart, &lastLoopState)
		}
	}
}

func (s *Supervisor) poll(ctx context.Context, matchStart *int64, lastLoopState *string) {
	running, err := s.checker.IsRunning(s.processNames...)
	if err != nil {
		s.logger.Debug().Err(err).Msg("Error checking Valorant process")
		return
	}
	s.processUp.Store(running)

	if !running {
		if s.connected.Load() || s.Get().ProcessRunning {
			s.connected.Store(false)
			*matchStart = 0
			*lastLoopState = ""
			s.broadcast(&State{ProcessRunning: false, Connected: false})
		}
		return
	}

	priv, err := s.fetcher.FetchPresence(ctx)
	if err != nil {
		s.logger.Debug().Err(err).Msg("Error fetching Valorant presence")
		s.connected.Store(false)
		curr := s.Get()
		if curr.Connected {
			curr.Connected = false
			s.broadcast(curr)
		}
		return
	}

	s.connected.Store(true)

	loopState := priv.EffectiveSessionLoopState()
	matchMap := priv.EffectiveMatchMap()
	mapName, mapAsset := ResolveMap(matchMap)
	queueID := priv.EffectiveQueueID()
	queueName := ResolveQueue(queueID)
	partySize, maxPartySize := priv.EffectivePartySize()
	partyState := priv.EffectivePartyState()
	allyScore, enemyScore := priv.EffectiveScores()

	accountLevel := priv.AccountLevel
	if accountLevel == 0 {
		accountLevel = priv.PlayerPresenceData.AccountLevel
	}

	// Manage match start timer
	if loopState == "INGAME" {
		if *lastLoopState != "INGAME" || *matchStart == 0 {
			*matchStart = time.Now().Unix()
		}
	} else if loopState == "MENUS" {
		*matchStart = 0
	}
	*lastLoopState = loopState

	var charID, agentName, agentAsset, agentIconURL string
	if loopState == "INGAME" || loopState == "PREGAME" {
		cid, err := s.fetcher.FetchActiveCharacter(ctx, loopState)
		if err == nil && cid != "" {
			charID = cid
			agentName, agentAsset, agentIconURL = ResolveAgent(cid)
		}
	}

	newState := &State{
		ProcessRunning:   true,
		Connected:        true,
		SessionLoopState: loopState,
		QueueID:          queueID,
		QueueName:        queueName,
		PartyID:          priv.PartyID,
		PartySize:        partySize,
		MaxPartySize:     maxPartySize,
		PartyState:       partyState,
		MatchMap:         matchMap,
		MapName:          mapName,
		MapAsset:         mapAsset,
		AllyScore:        allyScore,
		EnemyScore:       enemyScore,
		AccountLevel:     accountLevel,
		GameStartTime:    *matchStart,
		CharacterID:      charID,
		AgentName:        agentName,
		AgentAsset:       agentAsset,
		AgentIconURL:     agentIconURL,
	}

	curr := s.Get()
	if !curr.Equals(newState) {
		s.broadcast(newState)
	}
}
