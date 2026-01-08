/**
 * EnergyDashboard Component.
 * Displays a live grid of smart meter readings.
 */
import React, { useEffect, useState } from 'react';
import { EnergyReading, fetchTelemetry } from '../services/api';

const EnergyDashboard: React.FC = () => {
    const [readings, setReadings] = useState<EnergyReading[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Poll for data every 3 seconds
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchTelemetry();
            setReadings(data);
            setLastUpdated(new Date());
        };

        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3>⚡ Live Grid Telemetry</h3>
                <span style={styles.badge}>Live</span>
            </div>
            <p style={styles.subtext}>Simulated IoT Data Stream (Go Backend) • Last Sync: {lastUpdated.toLocaleTimeString()}</p>
            
            <div style={styles.gridContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Device ID</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Consumption (kWh)</th>
                            <th style={styles.th}>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {readings.slice(0, 8).map((r) => (
                            <tr key={r.deviceId} style={styles.tr}>
                                <td style={styles.td}>{r.deviceId}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: r.status === 'Peak' ? '#ffcccc' : '#ccffcc',
                                        color: r.status === 'Peak' ? '#990000' : '#006600'
                                    }}>
                                        {r.status}
                                    </span>
                                </td>
                                <td style={styles.td}><strong>{r.value}</strong></td>
                                <td style={styles.td}>{new Date(r.timestamp).toLocaleTimeString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Simple inline styles to avoid CSS file complexity for the demo
const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
    },
    header: { display: 'flex', alignItems: 'center', gap: '10px' },
    badge: { backgroundColor: 'red', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' as 'bold' },
    subtext: { color: '#666', fontSize: '0.85rem', marginBottom: '15px' },
    gridContainer: { overflowX: 'auto' as 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' as 'collapse' },
    th: { textAlign: 'left' as 'left', padding: '10px', borderBottom: '2px solid #eee', color: '#444' },
    tr: { borderBottom: '1px solid #f9f9f9' },
    td: { padding: '10px', fontSize: '0.9rem' },
    statusBadge: { padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' as 'bold' }
};

export default EnergyDashboard;