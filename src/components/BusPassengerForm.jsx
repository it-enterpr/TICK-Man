// API služba pro komunikaci s Odoo backendem pro nákup jízdenek
// Integruje funkcionalitu z modulů ie_bus_ticket_web a buy_bus_ticket

import odooApi from './odooApi';

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
                    boarding_point: parseInt((trip || tripData)?.from_id) || 0,
                    dropping_point: parseInt((trip || tripData)?.to_id) || 0
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
        return await odooApi.getBusPoints();
    },

    async searchTrips(payload) {
        return await odooApi.searchTrips(payload.from_location, payload.to_location, payload.date_str);
    },

    async getSeats(payload) {
        return await odooApi.getSeats(payload.trip_id);
    },

    async getTripDetails(payload) {
        return await odooApi.getTripDetails(payload.trip_id);
    },

    async bookTicket(payload) {
        return await odooApi.bookTicket(payload.trip_id, payload.seat_id, payload.passenger_data);
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
    }
};

export default busApi;
