import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import busApi from '../services/busApi';
import './BusPassengerForm.css';

const BusPassengerForm = () => {
    const { t } = useTranslation();
    const { tripId, seatId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const trip = location.state?.trip;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [passengerName, setPassengerName] = useState('');
    const [passengerEmail, setPassengerEmail] = useState('');
    const [passengerPhone, setPassengerPhone] = useState('');
    const [passengerAge, setPassengerAge] = useState('');
    const [passengerGender, setPassengerGender] = useState('');

    const [price, setPrice] = useState(0);
    const [tripData, setTripData] = useState(null);

    useEffect(() => {
        if (tripId) {
            // Cena se může lišit, proto ji stále načítáme
            loadPrice();
            // Načteme také údaje o lince
            loadTripData();
        }
    }, [tripId]);

    // Debug: zobrazíme co máme v trip objektu
    useEffect(() => {
        console.log('BusPassengerForm - trip object:', trip);
        console.log('BusPassengerForm - tripId:', tripId);
        console.log('BusPassengerForm - seatId:', seatId);
    }, [trip, tripId, seatId]);

    const loadPrice = async () => {
        try {
            const response = await busApi.getSeats({ trip_id: parseInt(tripId) });
            if (response.success) {
                setPrice(response.price || 0);
            }
        } catch (err) {
            // Ignorujeme chybu, cena není kritická
        }
    };

    const loadTripData = async () => {
        try {
            const response = await busApi.getTripDetails({ trip_id: parseInt(tripId) });
            if (response.success) {
                setTripData(response.trip);
                console.log('BusPassengerForm - loaded trip data:', response.trip);
            }
        } catch (err) {
            console.error('Chyba při načítání údajů o lince:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = busApi.validatePassengerData(passengerName, passengerEmail);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await busApi.bookTicket({
                trip_id: parseInt(tripId),
                seat_id: seatId,
                passenger_data: {
                    name: passengerName.trim(),
                    email: passengerEmail.trim(),
                    age: passengerAge || '0',
                    gender: passengerGender || '-',
                    boarding_point: trip?.from_id || '',
                    dropping_point: trip?.to_id || ''
                }
            });

            if (response.success) {
                // Úspěšná rezervace - přesměrujeme na stránku s potvrzením a předáme data
                navigate('/reservation/confirmation', {
                    state: {
                        orderId: response.order_id,
                        orderUrl: response.order_url,
                        paymentDate: new Date().toISOString(),
                        trip: trip || tripData,
                        seatId: seatId,
                        passengerData: {
                            name: passengerName.trim(),
                            email: passengerEmail.trim(),
                            age: passengerAge || '0',
                            gender: passengerGender || '-'
                        },
                        price: price
                    }
                });
            } else {
                setError(response.error || 'Nepodařilo se rezervovat jízdenku');
            }
        } catch (err) {
            setError(err.message || 'Chyba při rezervaci jízdenky');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(`/bus/seats/${tripId}`);
    };

    const canSubmit = passengerName.trim() && passengerEmail.trim() && !loading;

    return (
        <div className="bus-passenger-form">
            <div className="passenger-container">
                <div className="passenger-header">
                    <button className="back-button" onClick={handleBack}>
                        ← Zpět na výběr sedadla
                    </button>
                    <h2 className="page-title">Údaje cestujícího</h2>
                </div>

                {(trip || tripData) && (
                    <div className="trip-summary">
                        <div className="trip-details">
                            <div className="trip-route">
                                {(trip?.from || tripData?.from) || 'Nástupní místo'} → {(trip?.to || tripData?.to) || 'Výstupní místo'}
                            </div>
                            <div className="trip-times">
                                <span>Odjezd: {busApi.formatTime(trip?.departure_time || tripData?.departure_time) || '--:--'}</span>
                                <span>Příjezd: {busApi.formatTime(trip?.arrival_time || tripData?.arrival_time) || '--:--'}</span>
                            </div>
                            <div className="seat-info">
                                Sedadlo: {seatId}
                            </div>
                        </div>
                        <div className="trip-price">
                            {busApi.formatPrice(price)}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="passenger-form">
                    <div className="form-section">
                        <h3 className="section-title">Povinné údaje</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="passenger-name">Jméno a příjmení *</label>
                                <input
                                    id="passenger-name"
                                    type="text"
                                    value={passengerName}
                                    onChange={(e) => {
                                        setPassengerName(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="Zadejte celé jméno"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="passenger-email">Email *</label>
                                <input
                                    id="passenger-email"
                                    type="email"
                                    value={passengerEmail}
                                    onChange={(e) => {
                                        setPassengerEmail(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="vas@email.cz"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Volitelné údaje</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="passenger-phone">Telefon</label>
                                <input
                                    id="passenger-phone"
                                    type="tel"
                                    value={passengerPhone}
                                    onChange={(e) => setPassengerPhone(e.target.value)}
                                    placeholder="+420 123 456 789"
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="passenger-age">Věk</label>
                                <input
                                    id="passenger-age"
                                    type="number"
                                    value={passengerAge}
                                    onChange={(e) => setPassengerAge(e.target.value)}
                                    placeholder="25"
                                    min="0"
                                    max="120"
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="passenger-gender">Pohlaví</label>
                                <select
                                    id="passenger-gender"
                                    value={passengerGender}
                                    onChange={(e) => setPassengerGender(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Vyberte</option>
                                    <option value="M">Muž</option>
                                    <option value="F">Žena</option>
                                    <option value="O">Jiné</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={handleBack}
                            disabled={loading}
                        >
                            Zrušit
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!canSubmit}
                        >
                            {loading ? 'Rezervuji...' : 'Rezervovat jízdenku'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BusPassengerForm;
