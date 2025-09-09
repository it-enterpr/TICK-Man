import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ReservationConfirmation.css';

const ReservationConfirmation = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { orderId, orderUrl, paymentDate, trip, seatId, passengerData, price } = location.state || {};

    const handlePayment = () => {
        if (orderUrl) {
            // Použijeme plné přesměrování, abychom se dostali na doménu Odoo
            window.location.href = orderUrl;
        } else {
            // Fallback na /shop/payment pokud orderUrl není k dispozici
            window.location.href = '/shop/payment';
        }
    };

    const handleStatusClick = () => {
        handlePayment();
    };

    if (!orderId) {
        // Fallback, pokud data nejsou k dispozici
        return (
            <div className="reservation-confirmation">
                <div className="confirmation-container">
                    <h1 className="confirmation-title">{t('somethingWentWrong')}</h1>
                    <p className="confirmation-message">
                        {t('orderInfoNotFound')}
                    </p>
                    <div className="confirmation-actions">
                        <Link to="/bus/search" className="action-button primary">
                            {t('tryAgain')}
                        </Link>
                        <Link to="/" className="action-button secondary">
                            {t('backToHome')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reservation-confirmation">
            <div className="confirmation-container">
                <div className="confirmation-icon">
                    🎫
                </div>
                <h1 className="confirmation-title">{t('reservationCreated')}</h1>
                <p className="confirmation-message">
                    {t('reservationMessage')}
                </p>

                <div className="confirmation-details">
                    <div className="detail-item">
                        <span className="detail-label">{t('ticketNumber')}</span>
                        <span className="detail-value">#{orderId}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">{t('reservationDate')}</span>
                        <span className="detail-value">{new Date(paymentDate).toLocaleDateString('cs-CZ')}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">{t('price')}</span>
                        <span className="detail-value price">{price ? `${price} Kč` : '--'}</span>
                    </div>
                    {trip && (
                        <>
                            <div className="detail-item">
                                <span className="detail-label">{t('route')}</span>
                                <span className="detail-value">{trip.from} → {trip.to}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">{t('departure')}</span>
                                <span className="detail-value">{trip.departure_time}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">{t('seat')}</span>
                                <span className="detail-value">{seatId}</span>
                            </div>
                        </>
                    )}
                    {passengerData && (
                        <>
                            <div className="detail-item">
                                <span className="detail-label">{t('passenger')}</span>
                                <span className="detail-value">{passengerData.name}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">{t('email')}</span>
                                <span className="detail-value">{passengerData.email}</span>
                            </div>
                        </>
                    )}
                    <div className="detail-item status-item" onClick={handleStatusClick}>
                        <span className="detail-label">{t('status')}</span>
                        <span className="detail-value status-unpaid clickable">
                            {t('unpaid')}
                            <span className="status-arrow">→</span>
                        </span>
                    </div>
                </div>

                <div className="confirmation-actions">
                    <button onClick={handlePayment} className="action-button primary pay-button">
                        {t('payNow')}
                    </button>
                    <Link to="/" className="action-button secondary">
                        {t('backToHome')}
                    </Link>
                </div>

                <div className="confirmation-info">
                    <p>
                        <strong>{t('importantInfo')}</strong>
                    </p>
                    <ul>
                        <li>{t('reservationInfo1')}</li>
                        <li>{t('reservationInfo2')}</li>
                        <li>{t('reservationInfo3')}</li>
                        <li>{t('reservationInfo4')}</li>
                        <li>{t('reservationInfo5')}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReservationConfirmation;
