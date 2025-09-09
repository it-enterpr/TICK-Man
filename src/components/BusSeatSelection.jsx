import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import busApi from '../services/busApi';
import './BusSeatSelection.css';

const BusSeatSelection = () => {
    const { t } = useTranslation();
    const { tripId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const trip = location.state?.trip;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [seats, setSeats] = useState([]);
    const [selectedSeatId, setSelectedSeatId] = useState('');
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (tripId) {
            loadSeats();
        }
    }, [tripId]);

    const loadSeats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await busApi.getSeats({ trip_id: parseInt(tripId) });

            if (response.success) {
                setSeats(response.seats || []);
                setPrice(response.price || 0);
            } else {
                setError(response.error || 'Nepodařilo se načíst sedadla');
            }
        } catch (err) {
            setError(err.message || 'Chyba při načítání sedadel');
        } finally {
            setLoading(false);
        }
    };

    const handleSeatSelect = (seat) => {
        if (seat.booked) return;
        setSelectedSeatId(seat.id);
        setError(null);
    };

    const handleContinue = () => {
        if (!selectedSeatId) {
            setError('Vyberte prosím sedadlo');
            return;
        }
        navigate(`/bus/passenger/${tripId}/${selectedSeatId}`, { state: { trip } });
    };

    const handleBack = () => {
        navigate('/bus/search');
    };

    const getSeatStatus = (seat) => {
        if (seat.booked) return 'booked';
        if (selectedSeatId === seat.id) return 'selected';
        return 'available';
    };

    const getSeatClass = (seat) => {
        const status = getSeatStatus(seat);
        return `seat-button seat-${status}`;
    };

    const availableSeats = seats.filter(seat => !seat.booked).length;
    const totalSeats = seats.length;

    return (
        <div className="bus-seat-selection">
            <div className="seat-container">
                <div className="seat-header">
                    <button className="back-button" onClick={handleBack}>
                        ← Zpět na vyhledávání
                    </button>
                    <h2 className="page-title">Výběr sedadla</h2>
                    {trip && (
                        <div className="trip-summary">
                            <div className="trip-route">
                                {trip.from} → {trip.to}
                            </div>
                            <div className="trip-price">
                                {busApi.formatPrice(price)}
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="loading-message">
                        Načítám sedadla...
                    </div>
                ) : (
                    <>
                        <div className="seat-legend">
                            <div className="legend-item">
                                <div className="legend-seat seat-available"></div>
                                <span>Volné</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-seat seat-selected"></div>
                                <span>Vybrané</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-seat seat-booked"></div>
                                <span>Obsazené</span>
                            </div>
                        </div>

                        <div className="bus-layout">
                            <div className="bus-front">
                                <div className="driver-area">Řidič</div>
                            </div>

                            <div className="seats-grid">
                                {seats.map(seat => (
                                    <button
                                        key={seat.id}
                                        className={getSeatClass(seat)}
                                        onClick={() => handleSeatSelect(seat)}
                                        disabled={seat.booked}
                                        title={`Řada ${seat.row}, sedadlo ${seat.col}`}
                                    >
                                        {seat.number}
                                    </button>
                                ))}
                            </div>

                            <div className="bus-rear">
                                <div className="exit-area">Východ</div>
                            </div>
                        </div>

                        <div className="seat-info">
                            <div className="seat-stats">
                                <span>Volná místa: {availableSeats}/{totalSeats}</span>
                            </div>
                            {selectedSeatId && (
                                <div className="selected-seat-info">
                                    <span>Vybrané sedadlo: {selectedSeatId}</span>
                                </div>
                            )}
                        </div>

                        <div className="seat-actions">
                            <button
                                className="continue-button"
                                onClick={handleContinue}
                                disabled={!selectedSeatId}
                            >
                                Pokračovat k údajům cestujícího
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BusSeatSelection;
