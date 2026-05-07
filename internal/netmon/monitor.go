package netmon

import (
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	gopsnet "github.com/shirou/gopsutil/v3/net"
)

// InterfaceSpeed is the current transfer rate for a single network interface.
type InterfaceSpeed struct {
	DownloadBps float64 `json:"downloadBps"`
	UploadBps   float64 `json:"uploadBps"`
}

// NetworkSpeedSample is the aggregate payload consumed by the frontend.
type NetworkSpeedSample struct {
	DownloadBytesPerSecond float64  `json:"downloadBytesPerSecond"`
	UploadBytesPerSecond   float64  `json:"uploadBytesPerSecond"`
	TotalBytesReceived     uint64   `json:"totalBytesReceived"`
	TotalBytesSent         uint64   `json:"totalBytesSent"`
	InterfaceCount         int      `json:"interfaceCount"`
	InterfaceNames         []string `json:"interfaceNames"`
	SampledAt              string   `json:"sampledAt"`
}

type interfaceSnapshot struct {
	BytesRecv uint64
	BytesSent uint64
}

// Monitor polls network counters and keeps the latest computed speeds in memory.
type Monitor struct {
	interval time.Duration

	mu           sync.RWMutex
	speeds       map[string]InterfaceSpeed
	interfaces   []string
	latestSample NetworkSpeedSample
	lastError    string
	previous     map[string]interfaceSnapshot
	stopCh       chan struct{}
	doneCh       chan struct{}
	running      bool
}

// NewMonitor creates a monitor with a default 1 second poll if the provided
// interval is invalid.
func NewMonitor(intervalMs int) *Monitor {
	interval := time.Duration(intervalMs) * time.Millisecond
	if interval <= 0 {
		interval = time.Second
	}

	return &Monitor{
		interval: interval,
		speeds:   make(map[string]InterfaceSpeed),
		previous: make(map[string]interfaceSnapshot),
	}
}

// Start begins the polling loop.
func (m *Monitor) Start() {
	m.mu.Lock()
	if m.running {
		m.mu.Unlock()
		return
	}

	m.stopCh = make(chan struct{})
	m.doneCh = make(chan struct{})
	m.running = true
	m.mu.Unlock()

	go m.run()
}

// Stop stops the polling loop and waits for the worker to exit.
func (m *Monitor) Stop() {
	m.mu.Lock()
	if !m.running {
		m.mu.Unlock()
		return
	}

	stopCh := m.stopCh
	doneCh := m.doneCh
	m.running = false
	m.stopCh = nil
	m.doneCh = nil
	m.mu.Unlock()

	close(stopCh)
	<-doneCh
}

// GetSpeeds returns a copy of the latest speed map.
func (m *Monitor) GetSpeeds() map[string]InterfaceSpeed {
	m.mu.RLock()
	defer m.mu.RUnlock()

	result := make(map[string]InterfaceSpeed, len(m.speeds))
	for name, speed := range m.speeds {
		result[name] = speed
	}

	return result
}

// ListInterfaces returns a sorted copy of the latest interface list.
func (m *Monitor) ListInterfaces() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()

	result := make([]string, len(m.interfaces))
	copy(result, m.interfaces)
	return result
}

// GetSample returns the latest aggregate frontend-facing sample.
func (m *Monitor) GetSample() NetworkSpeedSample {
	m.mu.RLock()
	defer m.mu.RUnlock()

	result := m.latestSample
	result.InterfaceNames = append([]string(nil), m.latestSample.InterfaceNames...)
	return result
}

// GetLastError returns the latest sampling error, if any.
func (m *Monitor) GetLastError() string {
	m.mu.RLock()
	defer m.mu.RUnlock()

	return m.lastError
}

func (m *Monitor) run() {
	defer close(m.doneCh)

	// Prime the previous counters before the first interval to avoid reporting a
	// large spike from boot-time totals.
	m.sample()

	ticker := time.NewTicker(m.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			m.sample()
		case <-m.stopCh:
			return
		}
	}
}

func (m *Monitor) sample() {
	stats, err := gopsnet.IOCounters(true)
	if err != nil {
		m.mu.Lock()
		m.lastError = fmt.Sprintf("Unable to read network activity: %v", err)
		m.mu.Unlock()
		return
	}

	intervalSeconds := m.interval.Seconds()
	nextSpeeds := make(map[string]InterfaceSpeed)
	nextPrevious := make(map[string]interfaceSnapshot, len(stats))
	nextInterfaces := make([]string, 0, len(stats))
	aggregateSample := NetworkSpeedSample{
		InterfaceNames: make([]string, 0, len(stats)),
		SampledAt:      time.Now().UTC().Format(time.RFC3339Nano),
	}

	m.mu.RLock()
	previous := make(map[string]interfaceSnapshot, len(m.previous))
	for name, snapshot := range m.previous {
		previous[name] = snapshot
	}
	m.mu.RUnlock()

	for _, stat := range stats {
		if shouldIgnoreInterface(stat.Name) {
			continue
		}

		if stat.BytesRecv == 0 && stat.BytesSent == 0 {
			continue
		}

		nextPrevious[stat.Name] = interfaceSnapshot{
			BytesRecv: stat.BytesRecv,
			BytesSent: stat.BytesSent,
		}
		nextInterfaces = append(nextInterfaces, stat.Name)
		aggregateSample.TotalBytesReceived += stat.BytesRecv
		aggregateSample.TotalBytesSent += stat.BytesSent

		last, seen := previous[stat.Name]
		if !seen || intervalSeconds <= 0 {
			nextSpeeds[stat.Name] = InterfaceSpeed{}
			continue
		}

		download := 0.0
		upload := 0.0

		if stat.BytesRecv >= last.BytesRecv {
			download = float64(stat.BytesRecv-last.BytesRecv) / intervalSeconds
		}

		if stat.BytesSent >= last.BytesSent {
			upload = float64(stat.BytesSent-last.BytesSent) / intervalSeconds
		}

		nextSpeeds[stat.Name] = InterfaceSpeed{
			DownloadBps: download,
			UploadBps:   upload,
		}
		aggregateSample.DownloadBytesPerSecond += download
		aggregateSample.UploadBytesPerSecond += upload
	}

	sort.Strings(nextInterfaces)
	aggregateSample.InterfaceNames = append(aggregateSample.InterfaceNames, nextInterfaces...)
	aggregateSample.InterfaceCount = len(nextInterfaces)

	m.mu.Lock()
	m.previous = nextPrevious
	m.interfaces = nextInterfaces
	m.speeds = nextSpeeds
	m.latestSample = aggregateSample
	m.lastError = ""
	m.mu.Unlock()
}

func shouldIgnoreInterface(name string) bool {
	lower := strings.ToLower(name)

	return lower == "lo" ||
		lower == "loopback pseudo-interface" ||
		strings.Contains(lower, "loopback")
}
