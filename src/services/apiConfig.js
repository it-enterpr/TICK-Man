// Konfigurace API pro testování
export const API_CONFIG = {
    // Přepínač mezi mock a skutečným API
    USE_MOCK: true, // Změňte na false pro skutečné API
    
    // Skutečné API endpoints
    REAL_API: {
        baseUrl: 'https://tickets.symcherabus.eu',
        endpoints: {
            points: '/api/bus/points',
            search: '/api/bus/search',
            seats: '/api/bus/seats',
            tripDetails: '/api/bus/trip_details',
            book: '/api/bus/book'
        }
    },
    
    // Mock API pro testování
    MOCK_API: {
        baseUrl: 'http://localhost:3001', // Lokální mock server
        delay: 1000 // Simulace network delay
    }
};

// Funkce pro testování API dostupnosti
export const testApiConnection = async () => {
    try {
        const response = await fetch(`${API_CONFIG.REAL_API.baseUrl}/api/bus/points`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });
        
        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', [...response.headers.entries()]);
        
        if (response.ok) {
            const data = await response.json();
            console.log('API Response Data:', data);
            return { success: true, data };
        } else {
            const text = await response.text();
            console.log('API Error Response:', text);
            return { success: false, error: `HTTP ${response.status}: ${text}` };
        }
    } catch (error) {
        console.error('API Connection Error:', error);
        return { success: false, error: error.message };
    }
};