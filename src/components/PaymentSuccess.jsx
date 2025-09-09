import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { orderId, orderUrl, paymentDate } = location.state || {};

    const handlePayment = () => {
        if (orderUrl) {
            // Použijeme plné přesměrování, abychom se dostali na doménu Odoo
            // URL je již relativní a povede na správný endpoint /shop/payment
            window.location.href = orderUrl;
        } else {
            // Fallback na /shop/cart pokud orderUrl není k dispozici
            window.location.href = '/shop/cart';
        }
    };

    if (!orderId) {
        // Fallback, pokud data nejsou k dispozici
        return (
            <div className="payment-success">
                <div className="success-container">
                    <h1 className="success-title">Něco se pokazilo</h1>
                    <p className="success-message">
                        Informace o objednávce nebyly nalezeny.
                    </p>
                    <div className="success-actions">
                        <Link to="/bus/search" className="action-button primary">
                            Zkusit znovu
                        </Link>
                        <Link to="/" className="action-button secondary">
                            Zpět na hlavní stránku
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-success">
            <div className="success-container">
                <div className="success-icon">
                    ✅
                </div>
                <h1 className="success-title">Rezervace dokončena!</h1>
                <p className="success-message">
                    Vaše jízdenka byla úspěšně rezervována. Klikněte na tlačítko níže pro dokončení platby.
                </p>
                <div className="success-details">
                    <div className="detail-item">
                        <span className="detail-label">Jízdenka číslo:</span>
                        <span className="detail-value">#{orderId}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Datum rezervace:</span>
                        <span className="detail-value">{new Date(paymentDate).toLocaleDateString('cs-CZ')}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Stav:</span>
                        <span className="detail-value warning-status">Čeká na platbu</span>
                    </div>
                </div>
                <div className="success-actions">
                    <button onClick={handlePayment} className="action-button primary pay-button">
                        Pokračovat k platbě
                    </button>
                    <Link to="/" className="action-button secondary">
                        Zpět na hlavní stránku
                    </Link>
                </div>
                <div className="success-info">
                    <p>
                        <strong>Důležité informace:</strong>
                    </p>
                    <ul>
                        <li>Jízdenka byla rezervována a email s potvrzením byl odeslán na váš email.</li>
                        <li>Pro dokončení rezervace prosím dokončete platbu.</li>
                        <li>Před cestou si ověřte čas odjezdu.</li>
                        <li>Přijďte na zastávku alespoň 10 minut před odjezdem.</li>
                        <li>Mějte připravenou jízdenku na mobilním zařízení.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
