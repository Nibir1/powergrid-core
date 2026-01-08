/**
 * CopilotChat Component.
 * An interface to interact with the Compliance AI Agent.
 */
import React, { useState } from 'react';
import { askCopilot } from '../services/api';

const CopilotChat: React.FC = () => {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [citations, setCitations] = useState<Array<any>>([]);

    const handleAsk = async () => {
        if (!query) return;
        setLoading(true);
        setAnswer(null);

        const response = await askCopilot(query);
        
        if (response) {
            setAnswer(response.answer);
            setCitations(response.citations);
        } else {
            setAnswer("Sorry, I couldn't reach the intelligence service.");
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3>🤖 Regulatory Copilot</h3>
            </div>
            <p style={styles.subtext}>Ask questions about EU Energy Directives (Python/RAG Backend)</p>

            <div style={styles.inputGroup}>
                <input 
                    style={styles.input}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., What are the rules for public building renovation?"
                    onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                />
                <button style={styles.button} onClick={handleAsk} disabled={loading}>
                    {loading ? 'Thinking...' : 'Ask'}
                </button>
            </div>

            {answer && (
                <div style={styles.responseBox}>
                    <p style={styles.answerText}>{answer}</p>
                    {citations.length > 0 && (
                        <div style={styles.citationBox}>
                            <small><strong>Sources:</strong></small>
                            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                {citations.map((c, i) => (
                                    <li key={i}><small>{c.document} - {c.section}</small></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    header: { marginBottom: '5px' },
    subtext: { color: '#666', fontSize: '0.85rem', marginBottom: '15px' },
    inputGroup: { display: 'flex', gap: '10px', marginBottom: '20px' },
    input: { flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '10px 20px', backgroundColor: '#0078d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' as 'bold' },
    responseBox: { backgroundColor: '#f3f2f1', padding: '15px', borderRadius: '4px', borderLeft: '4px solid #0078d4' },
    answerText: { lineHeight: '1.5', margin: '0 0 10px 0' },
    citationBox: { borderTop: '1px solid #e1dfdd', paddingTop: '10px', color: '#605e5c' }
};

export default CopilotChat;