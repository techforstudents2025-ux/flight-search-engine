import React, { useState, useEffect } from 'react';
import { FaPlane, FaClock, FaUser, FaDollarSign } from 'react-icons/fa';
import { parseFlightDuration, formatTime, formatDate } from '../utils/FlightUtils';
import './FlightList.css';

const FlightList = ({ flights, loading, error }) => {
  const [processedFlights, setProcessedFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [filters, setFilters] = useState({
    maxDuration: 24,
    maxPrice: 5000,
    airlines: [],
    stops: 'all'
  });

  // معالجة البيانات عند التحميل
  useEffect(() => {
    if (!flights || !Array.isArray(flights)) {
      setProcessedFlights([]);
      setFilteredFlights([]);
      return;
    }

    try {
      const processed = flights
        .filter(flight => flight && flight.itineraries && flight.itineraries[0])
        .map((flight, index) => {
          const itinerary = flight.itineraries[0];
          const segments = itinerary.segments || [];
          const firstSegment = segments[0] || null;
          const lastSegment = segments[segments.length - 1] || null;
          
          // استخدام الدالة المحسنة بأمان
          const duration = parseFlightDuration(itinerary.duration);
          
          // استخراج معلومات الناقل
          const operatingCarrier = firstSegment?.operating?.carrierCode || 
                                 firstSegment?.carrierCode || 
                                 'Unknown';
          
          // حساب عدد التوقفات
          const stops = segments.length - 1;
          
          // السعر بأمان
          const price = flight.price?.total || '0';
          const priceNumber = parseFloat(price) || 0;
          
          return {
            id: flight.id || `flight-${index}`,
            price: price,
            priceNumber: priceNumber,
            currency: flight.price?.currency || 'SAR',
            duration: duration.totalHours,
            formattedDuration: duration.formatted,
            departureTime: firstSegment ? formatTime(firstSegment.departure.at) : '--:--',
            departureDate: firstSegment ? formatDate(firstSegment.departure.at) : '---',
            arrivalTime: lastSegment ? formatTime(lastSegment.arrival.at) : '--:--',
            arrivalDate: lastSegment ? formatDate(lastSegment.arrival.at) : '---',
            departureAirport: firstSegment?.departure?.iataCode || '---',
            arrivalAirport: lastSegment?.arrival?.iataCode || '---',
            airline: operatingCarrier,
            stops: stops,
            segments: segments,
            rawData: flight
          };
        })
        .sort((a, b) => a.priceNumber - b.priceNumber);

      setProcessedFlights(processed);
      setFilteredFlights(processed);
    } catch (error) {
      console.error('Error processing flights:', error);
      setProcessedFlights([]);
      setFilteredFlights([]);
    }
  }, [flights]);

  // تطبيق الفلاتر
  useEffect(() => {
    if (processedFlights.length === 0) {
      setFilteredFlights([]);
      return;
    }

    try {
      const filtered = processedFlights.filter(flight => {
        // فلترة المدة
        if (flight.duration > filters.maxDuration) return false;
        
        // فلترة السعر
        if (flight.priceNumber > filters.maxPrice) return false;
        
        // فلترة عدد التوقفات
        if (filters.stops !== 'all') {
          const stopsFilter = parseInt(filters.stops, 10);
          if (flight.stops !== stopsFilter) return false;
        }
        
        // فلترة شركات الطيران
        if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) {
          return false;
        }
        
        return true;
      });
      
      setFilteredFlights(filtered);
    } catch (error) {
      console.error('Error applying filters:', error);
      setFilteredFlights(processedFlights);
    }
  }, [processedFlights, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSelectFlight = (flight) => {
    console.log('Selected flight:', flight);
    // يمكنك إضافة منطق اختيار الرحلة هنا
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>جاري البحث عن الرحلات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">حدث خطأ: {error}</p>
        <button onClick={() => window.location.reload()}>إعادة المحاولة</button>
      </div>
    );
  }

  if (!flights || flights.length === 0) {
    return (
      <div className="no-flights">
        <FaPlane size={50} />
        <h3>لا توجد رحلات متاحة</h3>
        <p>حاول تغيير معايير البحث</p>
      </div>
    );
  }

  return (
    <div className="flight-list-container">
      {/* فلاتر */}
      <div className="filters-section">
        <div className="filter-group">
          <label>أقصى مدة (ساعات)</label>
          <input
            type="range"
            min="1"
            max="48"
            value={filters.maxDuration}
            onChange={(e) => handleFilterChange('maxDuration', parseInt(e.target.value, 10))}
          />
          <span>{filters.maxDuration} ساعة</span>
        </div>
        
        <div className="filter-group">
          <label>أقصى سعر (SAR)</label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value, 10))}
          />
          <span>{filters.maxPrice.toLocaleString()} SAR</span>
        </div>
        
        <div className="filter-group">
          <label>عدد التوقفات</label>
          <select
            value={filters.stops}
            onChange={(e) => handleFilterChange('stops', e.target.value)}
          >
            <option value="all">جميع التوقفات</option>
            <option value="0">بدون توقف</option>
            <option value="1">توقف واحد</option>
            <option value="2">توقفين</option>
          </select>
        </div>
      </div>

      {/* عدد النتائج */}
      <div className="results-count">
        <p>عثرنا على {filteredFlights.length} رحلة</p>
      </div>

      {/* قائمة الرحلات */}
      <div className="flights-grid">
        {filteredFlights.map((flight) => (
          <FlightCard 
            key={flight.id} 
            flight={flight} 
            onSelect={handleSelectFlight}
          />
        ))}
      </div>
    </div>
  );
};

// مكون البطاقة الفردية
const FlightCard = ({ flight, onSelect }) => {
  const getStopsText = (stops) => {
    if (stops === 0) return 'رحلة مباشرة';
    if (stops === 1) return 'توقف واحد';
    return `${stops} توقفات`;
  };

  return (
    <div className="flight-card">
      <div className="flight-header">
        <div className="airline-info">
          <FaPlane className="airline-icon" />
          <span className="airline-name">{flight.airline}</span>
        </div>
        <div className="flight-price">
          <FaDollarSign />
          <span className="price">{flight.price} {flight.currency}</span>
        </div>
      </div>

      <div className="flight-details">
        <div className="time-section">
          <div className="time-group">
            <span className="time">{flight.departureTime}</span>
            <span className="date">{flight.departureDate}</span>
            <span className="airport">{flight.departureAirport}</span>
          </div>
          
          <div className="duration-section">
            <div className="duration-line">
              <span className="stops-indicator">{getStopsText(flight.stops)}</span>
            </div>
            <div className="duration-info">
              <FaClock />
              <span>{flight.formattedDuration}</span>
            </div>
          </div>
          
          <div className="time-group">
            <span className="time">{flight.arrivalTime}</span>
            <span className="date">{flight.arrivalDate}</span>
            <span className="airport">{flight.arrivalAirport}</span>
          </div>
        </div>

        <div className="flight-segments">
          {flight.segments && flight.segments.length > 0 && (
            <div className="segments-info">
              {flight.segments.map((segment, index) => (
                <div key={index} className="segment">
                  <span>{segment.departure?.iataCode || '---'}</span>
                  <span>→</span>
                  <span>{segment.arrival?.iataCode || '---'}</span>
                  {index < flight.segments.length - 1 && (
                    <span className="layover">انتظار {segment.duration || '--'}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        className="select-flight-btn"
        onClick={() => onSelect(flight)}
      >
        اختر هذه الرحلة
      </button>
    </div>
  );
};

export default FlightList;