/**
 * Main Application Layout.
 * Simulates a SharePoint/Power BI Dashboard.
 */
import React, { useEffect, useState } from 'react';
import EnergyDashboard from './components/EnergyDashboard';
import CopilotChat from './components/CopilotChat';
import { login } from './services/api';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Simulate IAM Login on load
        const authenticate = async () => {
            const token = await login();
            if (token) {
                console.log("Authenticated with scope:", token);
                setIsAuthenticated(true);
            }
        };
        authenticate();
    }, []);

    return (
        <div style={styles.page}>
            <header style={styles.nav}>
                <h1 style={styles.logo}>PowerGrid <span style={{fontWeight: 'normal', fontSize: '0.6em'}}>Intelligent CoE Core</span></h1>
                <div style={styles.user}>{isAuthenticated ? "👤 Admin User (Fortum)" : "Connecting..."}</div>
            </header>

            <main style={styles.main}>
                <div style={styles.column}>
                    <EnergyDashboard />
                </div>
                <div style={styles.column}>
                    <CopilotChat />
                </div>
            </main>
        </div>
    );
};

const styles = {
    page: { fontFamily: '"Segoe UI", "Roboto", sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' },
    nav: { backgroundColor: '#2b88d8', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logo: { margin: 0, fontSize: '1.5rem' },
    user: { fontSize: '0.9rem', opacity: 0.9 },
    main: { maxWidth: '1200px', margin: '30px auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', padding: '0 20px' },
    column: { minWidth: '0' } // Flexbox hack for grids
};

export default App;