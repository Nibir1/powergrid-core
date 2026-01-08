package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"powergrid/ingestion/internal/domain"
	"testing"
)

func TestGetTelemetry(t *testing.T) {
	// 1. Setup
	// FIXED: NewSimulator() takes no arguments
	sim := domain.NewSimulator()

	// FIXED: GenerateData now requires the number of devices to generate
	sim.GenerateData(5)

	handler := &Handler{Sim: sim}

	// 2. Create Request
	req, err := http.NewRequest("GET", "/api/energy/telemetry", nil)
	if err != nil {
		t.Fatal(err)
	}

	// 3. Record Response
	rr := httptest.NewRecorder()
	handler.GetTelemetry(rr, req)

	// 4. Assertions
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var readings []domain.EnergyReading
	if err := json.Unmarshal(rr.Body.Bytes(), &readings); err != nil {
		t.Errorf("handler returned invalid JSON: %v", err)
	}

	if len(readings) != 5 {
		t.Errorf("expected 5 readings, got %d", len(readings))
	}
}
