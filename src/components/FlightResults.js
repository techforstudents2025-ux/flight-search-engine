import React, { useState } from 'react';
import { FaPlane, FaClock, FaStopwatch, FaChevronDown, FaChevronUp ,FaExternalLinkAlt } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';
import './FlightResults.css';

const FlightResults = ({ flights, loading, searchParams }) => {
  const { t, isRTL } = useTranslation();
  const [sortBy, setSortBy] = useState('price');
  const [expandedFlight, setExpandedFlight] = useState(null);

  const sortFlights = (flights) => {
    const sorted = [...flights];
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'duration':
        return sorted.sort((a, b) => {
          const getMinutes = (duration) => {
            const parts = duration.split('h');
            const hours = parseInt(parts[0]) || 0;
            const minutes = parts[1] ? parseInt(parts[1].replace('m', '').trim()) || 0 : 0;
            return hours * 60 + minutes;
          };
          return getMinutes(a.duration) - getMinutes(b.duration);
        });
      case 'departure':
        return sorted.sort((a, b) => new Date(a.departure) - new Date(b.departure));
      default:
        return sorted;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStopsText = (stops) => {
    if (stops === 0) return t('results.directFlight');
    if (stops === 1) return t('results.oneStopFlight');
    return `${stops} ${t('results.multipleStops')}`;
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const next = e.target.nextSibling;
    if (next && next.className === 'airline-fallback') {
      next.style.display = 'block';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{t('results.loading')}</p>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="no-results">
        <div className="no-results-icon">✈️</div>
        <h3>{t('results.noResults')}</h3>
        <p>{t('results.noResultsMessage')}</p>
      </div>
    );
  }

  const sortedFlights = sortFlights(flights);

 const handleBookNow = (flight) => {
    // التحقق من وجود رابط الحجار
    if (flight.bookingLink) {
      // فتح الرابط في علامة تبويب جديدة
      window.open(flight.bookingLink, '_blank', 'noopener,noreferrer');
    } else {
      // إذا لم يكن هناك رابط، أنشئ رابطًا افتراضيًا
      const defaultUrl = generateDefaultBookingLink(flight, searchParams);
      window.open(defaultUrl, '_blank', 'noopener,noreferrer');
    }
      // يمكنك أيضًا إضافة تتبع/تحليلات هنا
    console.log('Booking initiated for flight:', flight.id);
  };

 const generateDefaultBookingLink = (flight, params) => {
    const baseUrl = 'https://www.saudia.com';
    const queryParams = new URLSearchParams({
      origin: flight.origin,
      destination: flight.destination,
      departureDate: flight.departure.split('T')[0],
      adults: params.passengers || 1,
      cabinClass: params.class || 'ECONOMY',
      airline: flight.airlineCode || flight.airline
    });
    
    return `${baseUrl}/booking/flights?${queryParams.toString()}`;
  };

  return (
    <div className="flight-results">
      <div className="results-header">
        <div className="results-count">
          <span className="count">{sortedFlights.length}</span> {t('results.flightsFound')}
        </div>
        
        <div className="sort-options">
          <span>{t('results.sortBy')}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="price">{t('results.priceLow')}</option>
            <option value="duration">{t('results.durationShort')}</option>
            <option value="departure">{t('results.departureTime')}</option>
          </select>
        </div>
      </div>

      <div className="flights-list">
        {sortedFlights.map((flight) => (
          <div
            key={flight.id}
            className={`flight-card ${expandedFlight === flight.id ? 'expanded' : ''}`}
          >
            <div className="flight-main-info">
              <div className="airline-info">
                <div className="airline-logo">
                  <img
                    src={flight.logo}
                    alt={flight.airline}
                    onError={handleImageError}
                  />
                  <div className="airline-fallback">
                    {flight.airline.charAt(0)}
                  </div>
                </div>
                <div className="airline-details">
                  <h3>{flight.airline}</h3>
                  <p className="flight-number">{flight.flightNumber}</p>
                </div>
              </div>

              <div className="flight-timeline">
                <div className="time-info">
                  <div className="time">{formatTime(flight.departure)}</div>
                  <div className="airport">{flight.origin}</div>
                </div>
                
                <div className="timeline-middle">
                  <div className="duration-badge">
                    {flight.duration}
                  </div>
                  <div className="timeline-line">
                    <div className="line"></div>
                    <FaPlane className="plane-icon" />
                    <div className="line"></div>
                  </div>
                  <div className="stops-info">
                    {getStopsText(flight.stops)}
                  </div>
                </div>
                
                <div className="time-info">
                  <div className="time">{formatTime(flight.arrival)}</div>
                  <div className="airport">{flight.destination}</div>
                </div>
              </div>

              <div className="flight-meta">
                <div className="meta-item">
                  <FaClock />
                  <span>{flight.duration}</span>
                  <small>{t('results.duration')}</small>
                </div>
                <div className="meta-item">
                  <FaStopwatch />
                  <span>{flight.stops === 0 ? t('results.directFlight') : `${flight.stops} ${t('results.stops')}`}</span>
                  <small>{t('results.stops')}</small>
                </div>
              </div>

              <div className="flight-price">
                <div className="price">
                  {flight.price} <span className="currency">{t('common.currency')}</span>
                </div>
                <div className="flight-actions">
                  <button
                    className="details-button"
                    onClick={() => setExpandedFlight(expandedFlight === flight.id ? null : flight.id)}
                  >
                    {expandedFlight === flight.id ? (
                      <>{t('results.hideDetails')} <FaChevronUp /></>
                    ) : (
                      <>{t('results.details')} <FaChevronDown /></>
                    )}
                  </button>
                  <button className="book-button"
                     onClick={() => handleBookNow(flight)}
                     >
                    {t('results.bookNow')} <FaExternalLinkAlt className="external-icon" />
                  </button>
                </div>
              </div>
            </div>

            {expandedFlight === flight.id && (
              <div className="flight-details">
                <div className="details-grid">
                  <div className="detail-section">
                    <h4>{t('results.flightInfo')}</h4>
                    <div className="detail-item">
                      <span>{t('results.flightNumber')}:</span>
                      <span>{flight.flightNumber}</span>
                    </div>
                    <div className="detail-item">
                      <span>{t('results.aircraftType')}:</span>
                      <span>{flight.aircraft}</span>
                    </div>
                    <div className="detail-item">
                      <span>{t('results.seatsAvailable')}:</span>
                      <span className="available">24 {t('common.seats')}</span>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>{t('results.services')}</h4>
                    <div className="services">
                      {['Snack', 'Drinks', 'Entertainment', 'Wi-Fi'].map(service => (
                        <span key={service} className="service-tag">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>{t('results.priceDetails')}</h4>
                    <div className="price-details">
                      <div className="detail-item">
                        <span>{t('results.seatPrice')}:</span>
                        <span>{flight.price - 50} {t('common.currency')}</span>
                      </div>
                      <div className="detail-item">
                        <span>{t('results.taxesFees')}:</span>
                        <span>50 {t('common.currency')}</span>
                      </div>
                      <div className="detail-item total">
                        <span>{t('results.total')}:</span>
                        <span className="total-price">{flight.price} {t('common.currency')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightResults;
