import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import busApi from '../services/busApi';
import './BusSearchPage.css';

const BusSearchPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [points, setPoints] = useState([]);
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [dateStr, setDateStr] = useState('');

    const [trips, setTrips] = useState([]);

    useEffect(() => {
        loadPoints();
        // Nastavíme výchozí datum na zítra
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDateStr(tomorrow.toISOString().split('T')[0]);
    }, []);

    const loadPoints = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await busApi.getPoints();
            if (response.success) {
                setPoints(response.points || []);
            } else {
                setError(response.error || 'Nepodařilo se načíst místa');
            }
        } catch (err) {
            setError(err.message || 'Chyba při načítání míst');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        const validationError = busApi.validateSearchParams(fromLocation, toLocation, dateStr);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await busApi.searchTrips({
                from_location: parseInt(fromLocation),
                to_location: parseInt(toLocation),
                date_str: dateStr
            });

            if (response.success) {
                setTrips(response.trips || []);
                if (response.trips.length === 0) {
                    setError('Pro zadané parametry nebyly nalezeny žádné spoje');
                }
            } else {
                setError(response.error || 'Chyba při vyhledávání spojů');
            }
        } catch (err) {
            setError(err.message || 'Chyba při vyhledávání spojů');
        } finally {
            setLoading(false);
        }
    };

    const handleTripSelect = (trip) => {
        // Přesměrujeme na stránku výběru sedadel a předáme data
        navigate(`/bus/seats/${trip.id}`, { state: { trip } });
    };

    const canSearch = fromLocation && toLocation && dateStr && !loading;

    return (
        <div className="bus-search-page">
            <div className="search-container">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="search-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="from-location">Odkud</label>
                            <select
                                id="from-location"
                                value={fromLocation}
                                onChange={(e) => {
                                    setFromLocation(e.target.value);
                                    setError(null);
                                }}
                                disabled={loading}
                            >
                                <option value="">Vyberte nástupní místo</option>
                                {points.map(point => (
                                    <option key={point.id} value={point.id}>
                                        {point.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="to-location">Kam</label>
                            <select
                                id="to-location"
                                value={toLocation}
                                onChange={(e) => {
                                    setToLocation(e.target.value);
                                    setError(null);
                                }}
                                disabled={loading}
                            >
                                <option value="">Vyberte výstupní místo</option>
                                {points.map(point => (
                                    <option key={point.id} value={point.id}>
                                        {point.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="date">Datum cesty</label>
                            <input
                                id="date"
                                type="date"
                                value={dateStr}
                                onChange={(e) => {
                                    setDateStr(e.target.value);
                                    setError(null);
                                }}
                                disabled={loading}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <button
                                className="search-button"
                                onClick={handleSearch}
                                disabled={!canSearch}
                            >
                                {loading ? 'Hledám...' : 'Hledat spoje'}
                            </button>
                        </div>
                    </div>
                </div>

                {trips.length > 0 && (
                    <div className="trips-results">
                        <h3>Nalezené spoje</h3>
                        <div className="trips-list">
                            {trips.map(trip => (
                                <div key={trip.id} className="trip-card">
                                    <div className="trip-info">
                                        <div className="trip-route">
                                            <span className="route-from">{trip.from}</span>
                                            <span className="route-arrow">→</span>
                                            <span className="route-to">{trip.to}</span>
                                        </div>
                                        <div className="trip-times">
                                            <span className="trip-time">
                                                {busApi.formatTime(trip.departure_time)} - {busApi.formatTime(trip.arrival_time)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="trip-details">
                                        <div className="trip-price-row">
                                            <span className="trip-seats">Volná: {trip.available_seats}</span>
                                            <span className="trip-price">{busApi.formatPrice(trip.price)}</span>
                                        </div>
                                        <button
                                            className="select-trip-button"
                                            onClick={() => handleTripSelect(trip)}
                                            disabled={trip.available_seats === 0}
                                        >
                                            {trip.available_seats === 0 ? 'Vyprodáno' : 'Vybrat'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusSearchPage;
