import React, { useState } from 'react';
import busApi from '../services/busApi';
import { API_CONFIG } from '../services/apiConfig';

const ApiTestPage = () => {
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const addResult = (test, result) => {
        setTestResults(prev => [...prev, { test, result, timestamp: new Date().toLocaleTimeString() }]);
    };

    const testApiConnection = async () => {
        setLoading(true);
        try {
            const result = await busApi.testConnection();
            addResult('API Connection Test', result);
        } catch (error) {
            addResult('API Connection Test', { success: false, error: error.message });
        }
        setLoading(false);
    };

    const testGetPoints = async () => {
        setLoading(true);
        try {
            const result = await busApi.getPoints();
            addResult('Get Points', result);
        } catch (error) {
            addResult('Get Points', { success: false, error: error.message });
        }
        setLoading(false);
    };

    const testSearchTrips = async () => {
        setLoading(true);
        try {
            const result = await busApi.searchTrips({
                from_location: 1,
                to_location: 2,
                date_str: '2024-01-15'
            });
            addResult('Search Trips', result);
        } catch (error) {
            addResult('Search Trips', { success: false, error: error.message });
        }
        setLoading(false);
    };

    const testGetSeats = async () => {
        setLoading(true);
        try {
            const result = await busApi.getSeats({ trip_id: 1 });
            addResult('Get Seats', result);
        } catch (error) {
            addResult('Get Seats', { success: false, error: error.message });
        }
        setLoading(false);
    };

    const testBookTicket = async () => {
        setLoading(true);
        try {
            const result = await busApi.bookTicket({
                trip_id: 1,
                seat_id: '1_1',
                passenger_data: {
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '+420123456789',
                    age: 25,
                    gender: 'male'
                }
            });
            addResult('Book Ticket', result);
        } catch (error) {
            addResult('Book Ticket', { success: false, error: error.message });
        }
        setLoading(false);
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>API Test Page</h1>
            
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Current Configuration</h3>
                <p><strong>Use Mock:</strong> {API_CONFIG.USE_MOCK ? 'Yes' : 'No'}</p>
                <p><strong>Real API URL:</strong> {API_CONFIG.REAL_API.baseUrl}</p>
                <p><strong>Mock Delay:</strong> {API_CONFIG.MOCK_API.delay}ms</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Test Functions</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={testApiConnection} disabled={loading}>
                        Test API Connection
                    </button>
                    <button onClick={testGetPoints} disabled={loading}>
                        Test Get Points
                    </button>
                    <button onClick={testSearchTrips} disabled={loading}>
                        Test Search Trips
                    </button>
                    <button onClick={testGetSeats} disabled={loading}>
                        Test Get Seats
                    </button>
                    <button onClick={testBookTicket} disabled={loading}>
                        Test Book Ticket
                    </button>
                    <button onClick={clearResults} disabled={loading}>
                        Clear Results
                    </button>
                </div>
            </div>

            {loading && <p>Testing...</p>}

            <div>
                <h3>Test Results</h3>
                {testResults.length === 0 ? (
                    <p>No tests run yet.</p>
                ) : (
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {testResults.map((result, index) => (
                            <div key={index} style={{ 
                                marginBottom: '15px', 
                                padding: '10px', 
                                border: '1px solid #ddd', 
                                borderRadius: '5px',
                                backgroundColor: result.result.success ? '#d4edda' : '#f8d7da'
                            }}>
                                <h4>{result.test} - {result.timestamp}</h4>
                                <pre style={{ 
                                    whiteSpace: 'pre-wrap', 
                                    fontSize: '12px',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {JSON.stringify(result.result, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiTestPage;