package discord

// RPCData represents the data to be displayed in Discord Rich Presence
// This is equivalent to the Python RPCData dataclass
type RPCData struct {
	LargeImage string   // URL to the large image
	LargeText  string   // Text shown when hovering over large image
	SmallImage string   // URL to the small image
	SmallText  string   // Text shown when hovering over small image
	Details    string   // First line of text (queue name, etc.)
	State      string   // Second line of text (KDA, lobby count, etc.)
	Start      int64    // Unix timestamp for "Elapsed" timer
	Buttons    []Button // Optional Discord presence buttons
}

// Button represents a clickable button in Discord Rich Presence
type Button struct {
	Label string
	URL   string
}

// Equals compares two RPCData instances for equality
// Used to detect if Discord presence actually needs updating
func (r *RPCData) Equals(other *RPCData) bool {
	if other == nil {
		return false
	}

	if len(r.Buttons) != len(other.Buttons) {
		return false
	}
	for i := range r.Buttons {
		if r.Buttons[i] != other.Buttons[i] {
			return false
		}
	}

	return r.LargeImage == other.LargeImage &&
		r.LargeText == other.LargeText &&
		r.SmallImage == other.SmallImage &&
		r.SmallText == other.SmallText &&
		r.Details == other.Details &&
		r.State == other.State &&
		r.Start == other.Start
}

// Copy creates a deep copy of the RPCData
func (r *RPCData) Copy() *RPCData {
	if r == nil {
		return nil
	}

	res := *r
	if r.Buttons != nil {
		res.Buttons = make([]Button, len(r.Buttons))
		copy(res.Buttons, r.Buttons)
	}
	return &res
}

// IsEmpty returns true if the RPC data is empty (all fields are zero values)
func (r *RPCData) IsEmpty() bool {
	return r.LargeImage == "" &&
		r.LargeText == "" &&
		r.SmallImage == "" &&
		r.SmallText == "" &&
		r.Details == "" &&
		r.State == "" &&
		r.Start == 0 &&
		len(r.Buttons) == 0
}
