// Mock server pro testování API funkcionalité
// Spustíte pomocí: node src/services/mockServer.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock data
const mockPoints = [
    { id: 1, name: 'Praha', active: true },
    { id: 2, name: 'Brno', active: true },
    { id: 3, name: 'Ostrava', active: true },
    { id: 4, name: 'Plzeň', active: true },
    { id: 5, name: 'České Budějovice', active: true }
];

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

// API endpoints
app.post('/api/bus/points', (req, res) => {
    console.log('Mock API: Getting bus points');
    res.json({
        success: true,
        points: mockPoints
    });
});

app.post('/api/bus/search', (req, res) => {
    const { from_location, to_location, date_str } = req.body;
    console.log('Mock API: Searching trips', { from_location, to_location, date_str });
    
    res.json({
        success: true,
        trips: mockTrips.filter(trip => 
            trip.from_id === from_location && trip.to_id === to_location
        )
    });
});

app.post('/api/bus/seats', (req, res) => {
    const { trip_id } = req.body;
    console.log('Mock API: Getting seats for trip', trip_id);
    
    // Generujeme mock sedadla
    const seats = [];
    for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 4; col++) {
            const seatId = `${row}_${col}`;
            seats.push({
                id: seatId,
                number: (row - 1) * 4 + col,
                row: row,
                col: col,
                booked: Math.random() < 0.3 // 30% šance obsazení
            });
        }
    }
    
    res.json({
        success: true,
        seats: seats,
        bus_layout: '2-2',
        price: 250
    });
});

app.post('/api/bus/trip_details', (req, res) => {
    const { trip_id } = req.body;
    console.log('Mock API: Getting trip details', trip_id);
    
    const trip = mockTrips.find(t => t.id === parseInt(trip_id));
    
    res.json({
        success: true,
        trip: trip || mockTrips[0]
    });
});

app.post('/api/bus/book', (req, res) => {
    const { trip_id, seat_id, passenger_data } = req.body;
    console.log('Mock API: Booking ticket', { trip_id, seat_id, passenger_data });
    
    // Simulujeme úspěšnou rezervaci
    const orderId = `MOCK-${Date.now()}`;
    
    res.json({
        success: true,
        order_id: orderId,
        order_url: `/shop/payment/validate?order=${orderId}`,
        message: 'Jízdenka byla úspěšně rezervována (Mock API)'
    });
});

app.listen(PORT, () => {
    console.log(`Mock API server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- POST /api/bus/points');
    console.log('- POST /api/bus/search');
    console.log('- POST /api/bus/seats');
    console.log('- POST /api/bus/trip_details');
    console.log('- POST /api/bus/book');
});

module.exports = app;