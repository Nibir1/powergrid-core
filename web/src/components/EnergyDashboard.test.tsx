import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EnergyDashboard from './EnergyDashboard';
import * as api from '../services/api';

// Mock the API layer
vi.mock('../services/api');

describe('EnergyDashboard', () => {
    
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the loading state initially', async () => {
        // TRICK: Return a promise that never resolves.
        // This keeps the component in "Loading" state forever during this test,
        // preventing the "act(...)" warning caused by a state update.
        vi.spyOn(api, 'fetchTelemetry').mockReturnValue(new Promise(() => {}));

        render(<EnergyDashboard />);
        
        // Now we can safely check for the loading indicator
        // Note: Make sure your component actually renders "Live Grid Telemetry" or a spinner
        expect(screen.getByText(/Live Grid Telemetry/i)).toBeInTheDocument();
    });

    it('renders telemetry data after fetch', async () => {
        // Mock successful data
        const mockData = [
            { deviceId: 'METER-001', timestamp: '12:00', value: 50.5, unit: 'kWh', status: 'Normal' }
        ];
        
        // Setup mock to resolve immediately
        vi.spyOn(api, 'fetchTelemetry').mockResolvedValue(mockData);

        render(<EnergyDashboard />);

        // Use waitFor to handle the async state update gracefully
        await waitFor(() => {
            expect(screen.getByText('METER-001')).toBeInTheDocument();
            expect(screen.getByText('50.5')).toBeInTheDocument();
        });
    });
});