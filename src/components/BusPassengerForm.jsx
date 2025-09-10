import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { busApi } from '../services/busApi';
import './BusPassengerForm.css';

const BusPassengerForm = () => {
    const { tripId, seatId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'male'
    });

    useEffect(() => {
        // Initialize component
        setLoading(false);
    }, [tripId, seatId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Process form submission
            console.log('Form submitted:', formData);
            navigate('/reservation/confirmation');
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="bus-passenger-form">
            <h2>{t('Passenger Information')}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">{t('Name')} *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="email">{t('Email')} *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="phone">{t('Phone')}</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="age">{t('Age')}</label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="1"
                        max="120"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="gender">{t('Gender')}</label>
                    <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                    >
                        <option value="male">{t('Male')}</option>
                        <option value="female">{t('Female')}</option>
                        <option value="other">{t('Other')}</option>
                    </select>
                </div>
                
                <button type="submit" disabled={loading}>
                    {loading ? t('Processing...') : t('Continue to Payment')}
                </button>
            </form>
        </div>
    );
};

export default BusPassengerForm;