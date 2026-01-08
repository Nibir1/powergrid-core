package domain

import (
	"testing"
)

func TestSimulator_GenerateData(t *testing.T) {
	// 1. Initialize Simulator (Zero arguments, matching the definition)
	sim := NewSimulator()

	// 2. Run one manual cycle for 10 devices
	sim.GenerateData(10)

	// 3. Verify Data
	readings := sim.GetAllReadings()

	// Assertions
	if len(readings) != 10 {
		t.Errorf("Expected 10 readings, got %d", len(readings))
	}

	// 4. Verify Values
	for _, r := range readings {
		if r.Value < 0 {
			t.Errorf("Reading for %s cannot be negative", r.DeviceID)
		}
		if r.Status == "" {
			t.Errorf("Status for %s cannot be empty", r.DeviceID)
		}
		// Optional: Verify ID format
		if len(r.DeviceID) < 6 {
			t.Errorf("Invalid DeviceID format: %s", r.DeviceID)
		}
	}
}
