// API služba pro komunikaci s Odoo backendem pro nákup jízdenek
// Integruje funkcionalitu z modulů ie_bus_ticket_web a buy_bus_ticket

import odooApi from './odooApi';
import { API_CONFIG, testApiConnection } from './apiConfig';

export const busApi = {
    // Typy dat
    types: {
        BusPoint: { id: 'number', name: 'string', active: 'boolean' },
        Trip: {
            id: 'number',
            from: 'string',
            to: 'string',
            departure_time: 'string',
            arrival_time: 'string',
            price: 'number',
            available_seats: 'number',
            total_seats: 'number'
        },
        Seat: {
            id: 'string',
            number: 'number',
            row: 'number',
            col: 'number',
            booked: 'boolean'
        }
    },

    // Základní HTTP funkce
    async postJson(url, body = {}) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'same-origin',
            });

            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                const message = text ? text.slice(0, 500) : `${response.status} ${response.statusText}`;
                throw new Error(message);
            }

            if (!isJson) {
                const text = await response.text().catch(() => '');
                throw new Error(text || 'Neplatná odpověď serveru (neočekávaný obsah).');
            }

            return await response.json();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Neznámá chyba komunikace';
            throw new Error(message);
        }
    },

    // API endpointy - používáme skutečná data z ie_bus_ticket_admin
    async getPoints() {
        if (API_CONFIG.USE_MOCK) {
            return await this.mockGetPoints();
        }
        return await odooApi.getBusPoints();
    },

    async searchTrips(payload) {
        if (API_CONFIG.USE_MOCK) {
            return await this.mockSearchTrips(payload);
        }
        return await odooApi.searchTrips(payload.from_location, payload.to_location, payload.date_str);
    },

    async getSeats(payload) {
        if (API_CONFIG.USE_MOCK) {
            return await this.mockGetSeats(payload);
        }
        return await odooApi.getSeats(payload.trip_id);
    },

    async getTripDetails(payload) {
        if (API_CONFIG.USE_MOCK) {
            return await this.mockGetTripDetails(payload);
        }
        return await odooApi.getTripDetails(payload.trip_id);
    },

    async bookTicket(payload) {
        if (API_CONFIG.USE_MOCK) {
            return await this.mockBookTicket(payload.trip_id, payload.seat_id, payload.passenger_data);
        }
        return await odooApi.bookTicket(payload.trip_id, payload.seat_id, payload.passenger_data);
    },

    // Test API connection
    async testConnection() {
        return await testApiConnection();
    },

    // Pomocné funkce pro formátování
    formatPrice(price) {
        return `${price} Kč`;
    },

    formatTime(timeStr) {
        if (!timeStr) return '--:--';
        return timeStr.substring(0, 5); // Zobrazíme pouze HH:MM
    },

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('cs-CZ');
    },

    // Validace dat
    validateSearchParams(fromLocation, toLocation, dateStr) {
        if (!fromLocation || !toLocation || !dateStr) {
            return 'Vyplňte všechna pole pro vyhledávání';
        }

        // Zpracování stringů nebo objektů
        const fromName = typeof fromLocation === 'string' ? fromLocation : fromLocation.name;
        const toName = typeof toLocation === 'string' ? toLocation : toLocation.name;

        if (fromName === toName) {
            return 'Nástupní a výstupní místo musí být různé';
        }
        const selectedDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            return 'Datum cesty nemůže být v minulosti';
        }
        return null;
    },

    validatePassengerData(name, email) {
        if (!name || !name.trim()) {
            return 'Jméno je povinné';
        }
        if (!email || !email.trim()) {
            return 'Email je povinný';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Neplatný formát emailu';
        }
        return null;
    },

    // Příprava dat pro server
    preparePassengerData(passengerData) {
        return {
            name: passengerData.name,
            email: passengerData.email,
            phone: passengerData.phone || '',
            age: passengerData.age ? parseInt(passengerData.age) : null,
            gender: passengerData.gender || 'male',
            boarding_point: passengerData.boarding_point || null,
            dropping_point: passengerData.dropping_point || null
        };
    },

    // Mock funkce pro testování
    async mockGetPoints() {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_API.delay));
        return {
            success: true,
            points: [
                { id: 1, name: 'Praha', active: true },
                { id: 2, name: 'Brno', active: true },
                { id: 3, name: 'Ostrava', active: true },
                { id: 4, name: 'Plzeň', active: true },
                { id: 5, name: 'České Budějovice', active: true }
            ]
        };
    },

    async mockSearchTrips(payload) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_API.delay));
        const mockTrips = [
            {
                id: 1,
                from: 'Praha',
                to: 'Brno',
                from_id: 1,
                to_id: 2,
                departure_time: '08:00:00',
                arrival_time: '10:30:00',
                price: 250,
                available_seats: 45,
                total_seats: 50
            },
            {
                id: 2,
                from: 'Praha',
                to: 'Brno',
                from_id: 1,
                to_id: 2,
                departure_time: '14:00:00',
                arrival_time: '16:30:00',
                price: 250,
                available_seats: 30,
                total_seats: 50
            }
        ];
        
        return {
            success: true,
            trips: mockTrips.filter(trip => 
                trip.from_id === payload.from_location && trip.to_id === payload.to_location
            )
        };
    },

    async mockGetSeats(payload) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_API.delay));
        const seats = [];
        for (let row = 1; row <= 10; row++) {
            for (let col = 1; col <= 4; col++) {
                const seatId = `${row}_${col}`;
                seats.push({
                    id: seatId,
                    number: (row - 1) * 4 + col,
                    row: row,
                    col: col,
                    booked: Math.random() < 0.3
                });
            }
        }
        
        return {
            success: true,
            seats: seats,
            bus_layout: '2-2',
            price: 250
        };
    },

    async mockGetTripDetails(payload) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_API.delay));
        return {
            success: true,
            trip: {
                id: payload.trip_id,
                from: 'Praha',
                to: 'Brno',
                from_id: 1,
                to_id: 2,
                departure_time: '08:00:00',
                arrival_time: '10:30:00',
                price: 250
            }
        };
    },

    async mockBookTicket(tripId, seatId, passengerData) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_API.delay));
        
        const orderId = `MOCK-${Date.now()}`;
        return {
            success: true,
            order_id: orderId,
            order_url: `/shop/payment/validate?order=${orderId}`,
            message: 'Jízdenka byla úspěšně rezervována (Mock API)'
        };
    }
};

export default busApi;
