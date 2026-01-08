/*
Package domain includes the Simulator service.
This service manages the lifecycle of simulated devices and holds the
latest state of the grid in memory.
*/
package domain

import (
	"fmt"
	"sync"
	"time"
)

// Simulator manages the state of all smart meters.
type Simulator struct {
	// Readings is a map of DeviceID -> Latest Reading.
	// We use a Read/Write Mutex to allow multiple API readers but one writer at a time.
	readings map[string]EnergyReading
	mu       sync.RWMutex

	// Control channels
	stopChan chan bool
}

// NewSimulator initializes the internal storage.
func NewSimulator() *Simulator {
	return &Simulator{
		readings: make(map[string]EnergyReading),
		stopChan: make(chan bool),
	}
}

// Start begins the simulation background process.
// count: Number of meters to simulate.
// interval: How often they update.
func (s *Simulator) Start(count int, interval time.Duration) {
	fmt.Printf("Starting Simulation for %d devices...\n", count)

	// Initialize devices
	for i := 1; i <= count; i++ {
		deviceID := fmt.Sprintf("METER-%03d", i)

		// Launch a Goroutine (Lightweight thread) for each meter
		go func(id string) {
			ticker := time.NewTicker(interval)
			defer ticker.Stop()

			for {
				select {
				case <-s.stopChan:
					return
				case t := <-ticker.C:
					// Thread-Safe Update
					s.updateReading(id, t)
				}
			}
		}(deviceID)
	}
}

// GenerateData runs a SINGLE synchronous pass for testing purposes.
// This allows us to test the logic without waiting for tickers.
func (s *Simulator) GenerateData(count int) {
	now := time.Now()
	for i := 1; i <= count; i++ {
		deviceID := fmt.Sprintf("METER-%03d", i)
		s.updateReading(deviceID, now)
	}
}

// Helper to centralize the update logic
func (s *Simulator) updateReading(id string, t time.Time) {
	reading := GenerateSimulatedValue(id, t)

	s.mu.Lock()
	s.readings[id] = reading
	s.mu.Unlock()
}

// GetAllReadings performs a Thread-Safe Read of the current state.
func (s *Simulator) GetAllReadings() []EnergyReading {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Convert map to slice for JSON API
	results := make([]EnergyReading, 0, len(s.readings))
	for _, reading := range s.readings {
		results = append(results, reading)
	}
	return results
}
