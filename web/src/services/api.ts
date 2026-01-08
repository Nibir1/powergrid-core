/**
 * API Service Layer.
 * Centralizes all HTTP communication with the Nginx Gateway.
 */
import axios from 'axios';

// The Gateway URL (Accessing Nginx from the browser's perspective)
const GATEWAY_URL = 'http://localhost:8080';

// Interfaces for Type Safety (Matches the Backend Go/Python models)
export interface EnergyReading {
    deviceId: string;
    timestamp: string;
    value: number;
    unit: string;
    status: string;
}

export interface ChatResponse {
    answer: string;
    citations: Array<{ document: string; section: string }>;
    confidence_score: number;
}

/**
 * Authentication Service (Mock)
 * Simulates getting an Access Token from Azure AD.
 */
export const login = async (): Promise<string> => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/auth/token`);
        // In a real app, we would store this in SessionStorage or Context
        return response.data.access_token;
    } catch (error) {
        console.error("Auth failed:", error);
        return "";
    }
};

/**
 * Energy Data Service
 * Fetches high-frequency telemetry from the Go backend.
 */
export const fetchTelemetry = async (): Promise<EnergyReading[]> => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/api/energy/telemetry`);
        return response.data;
    } catch (error) {
        console.error("Telemetry fetch failed:", error);
        return [];
    }
};

/**
 * Compliance Service (AI)
 * Sends questions to the Python RAG backend.
 */
export const askCopilot = async (question: string): Promise<ChatResponse | null> => {
    try {
        const response = await axios.post(`${GATEWAY_URL}/api/compliance/ask`, {
            question: question,
            context_filter: "general"
        });
        return response.data;
    } catch (error) {
        console.error("AI Copilot failed:", error);
        return null;
    }
};