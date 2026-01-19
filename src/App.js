import React, { useState, useEffect } from 'react';
import { searchFlights, getFlightPriceAnalysis } from './services/amadeusService';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import FlightResults from './components/FlightResults';
import PriceGraph from './components/PriceGraph';
import Filters from './components/Filters';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import './App.css';

const AppContent = () => {
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [apiStatus, setApiStatus] = useState('ready'); // ready, loading, error, success
  const [filters, setFilters] = useState({
    stops: [],
    priceRange: [0, 5000],
    airlines: [],
    duration: [0, 24],
    departureTime: [],
  });

  // استخدام context اللغة لتحديد الاتجاه
  const { language, direction } = useLanguage();

  // تعيين direction للوثيقة
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  // اختبار اتصال API عند التحميل
  useEffect(() => {
    testAmadeusConnection();
  }, []);

  const testAmadeusConnection = async () => {
    try {
      // اختبار بسيط للاتصال
      console.log('Testing Amadeus API connection...');
      setApiStatus('testing');
    } catch (error) {
      console.warn('Amadeus API not available, using mock data mode');
      setApiStatus('mock');
    }
  };

  const searchFlightsHandler = async (params) => {
    setLoading(true);
    setApiStatus('loading');
    setSearchParams(params);
    
    try {
      // 1. البحث عن الرحلات
      console.log('Starting flight search with:', params);
      const flightResults = await searchFlights(params);
      
      // 2. الحصول على تحليل الأسعار
      let priceAnalysis = [];
      try {
        priceAnalysis = await getFlightPriceAnalysis(params) || [];
      } catch (priceError) {
        console.log('Price analysis not available, using generated data');
      }
      
      setFlights(flightResults);
      setFilteredFlights(flightResults);
      setPriceHistory(priceAnalysis);
      setApiStatus('success');
      
      console.log(`✅ Found ${flightResults.length} flights`);
      
    } catch (error) {
      console.error('Search failed:', error);
      setApiStatus('error');
      
      // استخدام بيانات تجريبية
      const mockData = generateMockFlights(params);
      setFlights(mockData);
      setFilteredFlights(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockFlights = (params) => {
    // بيانات تجريبية عندما يفشل API
    const airlines = ['Saudia', 'Flynas', 'Emirates', 'Qatar Airways', 'Etihad'];
    const flights = [];
    
    for (let i = 0; i < 8; i++) {
      const airline = airlines[i % airlines.length];
      const basePrice = airline === 'Saudia' ? 450 : 
                       airline === 'Flynas' ? 380 : 
                       airline === 'Emirates' ? 620 : 510;
      
      flights.push({
        id: i + 1,
        airline,
        airlineCode: airline === 'Saudia' ? 'SV' : 
                    airline === 'Flynas' ? 'XY' : 
                    airline === 'Emirates' ? 'EK' : 'QR',
        origin: params.origin || 'JED',
        destination: params.destination || 'RUH',
        departure: `${params.departureDate || '2024-01-20'}T${8 + i}:00:00`,
        arrival: `${params.departureDate || '2024-01-20'}T${9 + i}:30:00`,
        duration: i % 3 === 0 ? '1h 30m' : i % 3 === 1 ? '2h 15m' : '3h 00m',
        stops: i % 4 === 0 ? 1 : 0,
        price: Math.floor(basePrice * (0.9 + Math.random() * 0.4)),
        currency: 'SAR',
        flightNumber: `${airline === 'Saudia' ? 'SV' : 'XY'}${1000 + i}`,
        aircraft: i % 2 === 0 ? 'Boeing 777' : 'Airbus A320',
        airlineLogo: 'https://cdn-icons-png.flaticon.com/512/825/825517.png',
        seatsAvailable: Math.floor(Math.random() * 20) + 10,
      });
    }
    
    return flights;
  };

  // تطبيق الفلاتر
  useEffect(() => {
    if (flights.length === 0) return;
    
    let result = [...flights];

    // فلتر عدد التوقفات
    if (filters.stops.length > 0) {
      result = result.filter(flight => filters.stops.includes(flight.stops));
    }

    // فلتر السعر
    result = result.filter(flight => 
      flight.price >= filters.priceRange[0] && 
      flight.price <= filters.priceRange[1]
    );

    // فلتر شركات الطيران
    if (filters.airlines.length > 0) {
      result = result.filter(flight => filters.airlines.includes(flight.airline));
    }

    // فلتر وقت المغادرة
    if (filters.departureTime.length > 0) {
      result = result.filter(flight => {
        const hour = new Date(flight.departure).getHours();
        if (filters.departureTime.includes('morning') && hour >= 6 && hour < 12) return true;
        if (filters.departureTime.includes('afternoon') && hour >= 12 && hour < 18) return true;
        if (filters.departureTime.includes('evening') && hour >= 18 && hour < 24) return true;
        if (filters.departureTime.includes('night') && (hour >= 0 && hour < 6)) return true;
        return false;
      });
    }

    // فلتر المدة
    const durationInHours = flight => {
      const match = flight.duration.match(/(\d+)h\s*(\d+)?m?/);
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      return hours + minutes / 60;
    };

    result = result.filter(flight => {
      const hours = durationInHours(flight);
      return hours >= filters.duration[0] && hours <= filters.duration[1];
    });

    setFilteredFlights(result);
  }, [filters, flights]);

  // تحديث الأسعار كل دقيقة (محاكاة للتغيرات الحية)
  useEffect(() => {
    if (flights.length === 0) return;
    
    const interval = setInterval(() => {
      const updatedFlights = flights.map(flight => ({
        ...flight,
        price: Math.floor(flight.price * (0.98 + Math.random() * 0.04))
      }));
      setFlights(updatedFlights);
    }, 60000); // كل دقيقة

    return () => clearInterval(interval);
  }, [flights]);

  return (
    <div className={`App ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
      <Header />
      
      <div className="container">
        {/* حالة API */}
        <div className={`api-status ${apiStatus}`}>
          {apiStatus === 'loading' && '🔍 Connecting to Amadeus API...'}
          {apiStatus === 'success' && '✅ Connected to Amadeus API'}
          {apiStatus === 'error' && '⚠️ Using mock data'}
          {apiStatus === 'mock' && '📊 Mock data mode'}
        </div>

        <SearchForm onSearch={searchFlightsHandler} loading={loading} />
        
        {searchParams && (
          <div className="main-content">
            {/* الفلاتر على اليسار للغة الإنجليزية */}
            {direction === 'ltr' && (
              <div className="filters-section">
                <Filters filters={filters} setFilters={setFilters} flights={flights} />
              </div>
            )}
            
            <div className="results-section">
              <div className="price-graph-container">
                <PriceGraph flights={filteredFlights} priceHistory={priceHistory} />
              </div>
              
              <div className="flight-results-container">
                <h2>
                  ✈️ Search Results ({filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''})
                  <span className="api-source">
                    {apiStatus === 'success' ? ' (Amadeus API)' : ' (Mock data)'}
                  </span>
                </h2>
                <FlightResults 
                  flights={filteredFlights} 
                  loading={loading}
                  searchParams={searchParams}
                  apiStatus={apiStatus}
                />
              </div>
            </div>

            {/* الفلاتر على اليمين للغة العربية */}
            {direction === 'rtl' && (
              <div className="filters-section">
                <Filters filters={filters} setFilters={setFilters} flights={flights} />
              </div>
            )}
          </div>
        )}

        {!searchParams && (
          <div className="welcome-message">
            <h2>✈️ Flight Search Engine</h2>
            <p>Search for real flights using Amadeus API</p>
            <div className="features">
              <div className="feature">
                <span>🔍</span>
                <p>Real flight search</p>
              </div>
              <div className="feature">
                <span>📊</span>
                <p>Live prices</p>
              </div>
              <div className="feature">
                <span>🌐</span>
                <p>Arabic/English support</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;