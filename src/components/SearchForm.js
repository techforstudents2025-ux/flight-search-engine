import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch, FaExchangeAlt, FaUsers, FaPlaneDeparture, FaPlaneArrival, FaSpinner, FaTimes } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';
import { searchAirports } from '../services/amadeusService';
import './SearchForm.css';

const SearchForm = ({ onSearch, loading }) => {
  const { t, isRTL } = useTranslation();
  const [formData, setFormData] = useState({
    origin: null,
    destination: null,
    departureDate: new Date().toISOString().split('T')[0],
    passengers: 1,
    tripType: 'one-way',
    class: 'economy'
  });

  const [airportSuggestions, setAirportSuggestions] = useState({
    origin: [],
    destination: []
  });
  const [loadingAirports, setLoadingAirports] = useState({
    origin: false,
    destination: false
  });
  const [showSuggestions, setShowSuggestions] = useState({
    origin: false,
    destination: false
  });
  const [searchInputs, setSearchInputs] = useState({
    origin: '',
    destination: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({
    origin: '',
    destination: ''
  });

  const searchOriginTimeoutRef = useRef(null);
  const searchDestinationTimeoutRef = useRef(null);
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const suggestionsRef = useRef(null);
const originSuggestionsRef = useRef(null);
const destinationSuggestionsRef = useRef(null);


 // قائمة المطارات المحلية للاستخدام كـ fallback
  const allAirports = useRef([
    // Saudi Arabia
    { iataCode: 'JED', name: 'King Abdulaziz International Airport', address: { cityName: 'Jeddah', countryName: 'Saudi Arabia' } },
    { iataCode: 'RUH', name: 'King Khalid International Airport', address: { cityName: 'Riyadh', countryName: 'Saudi Arabia' } },
    { iataCode: 'MED', name: 'Prince Mohammad bin Abdulaziz Airport', address: { cityName: 'Medina', countryName: 'Saudi Arabia' } },
    { iataCode: 'DMM', name: 'King Fahd International Airport', address: { cityName: 'Dammam', countryName: 'Saudi Arabia' } },
    { iataCode: 'AHB', name: 'Abha International Airport', address: { cityName: 'Abha', countryName: 'Saudi Arabia' } },
    { iataCode: 'TIF', name: 'Taif International Airport', address: { cityName: 'Taif', countryName: 'Saudi Arabia' } },
    { iataCode: 'ELQ', name: 'Prince Nayef bin Abdulaziz Airport', address: { cityName: 'Buraidah', countryName: 'Saudi Arabia' } },
    { iataCode: 'URY', name: 'Gurayat Airport', address: { cityName: 'Gurayat', countryName: 'Saudi Arabia' } },
    { iataCode: 'HOF', name: 'Al-Ahsa International Airport', address: { cityName: 'Al-Ahsa', countryName: 'Saudi Arabia' } },
    { iataCode: 'AJF', name: 'Al-Jawf Airport', address: { cityName: 'Al-Jawf', countryName: 'Saudi Arabia' } },
    { iataCode: 'EAM', name: 'Najran Airport', address: { cityName: 'Najran', countryName: 'Saudi Arabia' } },
    { iataCode: 'TUU', name: 'Tabuk Airport', address: { cityName: 'Tabuk', countryName: 'Saudi Arabia' } },
    { iataCode: 'RAH', name: 'Rafha Airport', address: { cityName: 'Rafha', countryName: 'Saudi Arabia' } },
    { iataCode: 'RAE', name: 'Arar Airport', address: { cityName: 'Arar', countryName: 'Saudi Arabia' } },
    { iataCode: 'SHW', name: 'Sharurah Airport', address: { cityName: 'Sharurah', countryName: 'Saudi Arabia' } },
    { iataCode: 'ABT', name: 'Al-Baha Airport', address: { cityName: 'Al-Baha', countryName: 'Saudi Arabia' } },
    { iataCode: 'AQI', name: 'Al Qaisumah Airport', address: { cityName: 'Al Qaisumah', countryName: 'Saudi Arabia' } },
    
    // UAE
    { iataCode: 'DXB', name: 'Dubai International Airport', address: { cityName: 'Dubai', countryName: 'United Arab Emirates' } },
    { iataCode: 'AUH', name: 'Abu Dhabi International Airport', address: { cityName: 'Abu Dhabi', countryName: 'United Arab Emirates' } },
    { iataCode: 'SHJ', name: 'Sharjah International Airport', address: { cityName: 'Sharjah', countryName: 'United Arab Emirates' } },
    { iataCode: 'DWC', name: 'Al Maktoum International Airport', address: { cityName: 'Dubai', countryName: 'United Arab Emirates' } },
    { iataCode: 'RKT', name: 'Ras Al Khaimah International Airport', address: { cityName: 'Ras Al Khaimah', countryName: 'United Arab Emirates' } },
    { iataCode: 'FJR', name: 'Fujairah International Airport', address: { cityName: 'Fujairah', countryName: 'United Arab Emirates' } },
    
    // Egypt
    { iataCode: 'CAI', name: 'Cairo International Airport', address: { cityName: 'Cairo', countryName: 'Egypt' } },
    { iataCode: 'HRG', name: 'Hurghada International Airport', address: { cityName: 'Hurghada', countryName: 'Egypt' } },
    { iataCode: 'SSH', name: 'Sharm El Sheikh International Airport', address: { cityName: 'Sharm El Sheikh', countryName: 'Egypt' } },
    { iataCode: 'LXR', name: 'Luxor International Airport', address: { cityName: 'Luxor', countryName: 'Egypt' } },
    { iataCode: 'ALY', name: 'Alexandria International Airport', address: { cityName: 'Alexandria', countryName: 'Egypt' } },
    
    // Major International Airports
    { iataCode: 'LHR', name: 'Heathrow Airport', address: { cityName: 'London', countryName: 'United Kingdom' } },
    { iataCode: 'CDG', name: 'Charles de Gaulle Airport', address: { cityName: 'Paris', countryName: 'France' } },
    { iataCode: 'FRA', name: 'Frankfurt Airport', address: { cityName: 'Frankfurt', countryName: 'Germany' } },
    { iataCode: 'AMS', name: 'Amsterdam Airport Schiphol', address: { cityName: 'Amsterdam', countryName: 'Netherlands' } },
    { iataCode: 'IST', name: 'Istanbul Airport', address: { cityName: 'Istanbul', countryName: 'Turkey' } },
    { iataCode: 'JFK', name: 'John F. Kennedy International Airport', address: { cityName: 'New York', countryName: 'USA' } },
    { iataCode: 'LAX', name: 'Los Angeles International Airport', address: { cityName: 'Los Angeles', countryName: 'USA' } },
    { iataCode: 'ORD', name: "O'Hare International Airport", address: { cityName: 'Chicago', countryName: 'USA' } },
    { iataCode: 'HKG', name: 'Hong Kong International Airport', address: { cityName: 'Hong Kong', countryName: 'China' } },
    { iataCode: 'SIN', name: 'Singapore Changi Airport', address: { cityName: 'Singapore', countryName: 'Singapore' } },
    { iataCode: 'NRT', name: 'Narita International Airport', address: { cityName: 'Tokyo', countryName: 'Japan' } },
    { iataCode: 'SYD', name: 'Sydney Airport', address: { cityName: 'Sydney', countryName: 'Australia' } },
    { iataCode: 'YYZ', name: 'Toronto Pearson International Airport', address: { cityName: 'Toronto', countryName: 'Canada' } }
  ]);

  // البحث عن المطارات
  const searchAirportsFromAPI = useCallback(async (query, type) => {
    if (!query || query.length < 2) {
      setAirportSuggestions(prev => ({ ...prev, [type]: [] }));
      return;
    }

    setLoadingAirports(prev => ({ ...prev, [type]: true }));

    try {
      const results = await searchAirports(query);
      
      const combinedResults = [
        ...allAirports.current,
        ...(results || []).filter(apiAirport => 
          !allAirports.current.some(local => local.iataCode === apiAirport.iataCode)
        )
      ];

      const searchLower = query.toLowerCase();
      const filtered = combinedResults.filter(airport => {
        return (
          airport.iataCode.toLowerCase().includes(searchLower) ||
          airport.name.toLowerCase().includes(searchLower) ||
          (airport.address?.cityName?.toLowerCase() || '').includes(searchLower) ||
          (airport.address?.countryName?.toLowerCase() || '').includes(searchLower)
        );
      }).slice(0, 10);

      setAirportSuggestions(prev => ({ ...prev, [type]: filtered }));
    } catch (error) {
      console.error('Error searching airports:', error);
      performLocalSearch(query, type);
    } finally {
      setLoadingAirports(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  const performLocalSearch = useCallback((query, type) => {
    const searchLower = query.toLowerCase();
    const filtered = allAirports.current.filter(airport => {
      return (
        airport.iataCode.toLowerCase().includes(searchLower) ||
        airport.name.toLowerCase().includes(searchLower) ||
        (airport.address?.cityName?.toLowerCase() || '').includes(searchLower)
      );
    });

    setAirportSuggestions(prev => ({ ...prev, [type]: filtered.slice(0, 10) }));
  }, []);

  // إصلاح: اختيار مطار من القائمة
  const handleSelectAirport = (airport, type) => {
    console.log('Selecting airport for', type, ':', airport); // Debug
    
    // تحديث formData مباشرة
    setFormData(prev => ({ 
      ...prev, 
      [type]: airport 
    }));
    
    // تحديث searchInputs لعرض القيمة
    setSearchInputs(prev => ({ 
      ...prev, 
      [type]: `${airport.iataCode} - ${airport.name}` 
    }));
    
    // إغلاق القائمة
    setShowSuggestions(prev => ({ ...prev, [type]: false }));
    setAirportSuggestions(prev => ({ ...prev, [type]: [] }));
    
    // تنظيف رسالة الخطأ
    setValidationErrors(prev => ({ ...prev, [type]: '' }));
    
    // Debug: تأكيد التحديث
    console.log('Updated formData:', formData);
    console.log('Updated searchInputs:', searchInputs);
  };

  // عند النقر على الحقل
  const handleInputClick = (type) => {
    setShowSuggestions(prev => ({ ...prev, [type]: true }));
    
    // إذا كان الحقل يحتوي على بيانات، نظهرها في حقل البحث للتحرير
    if (formData[type]) {
      // نعرض القيمة الحالية في حقل البحث للتحرير
      setSearchInputs(prev => ({ 
        ...prev, 
        [type]: `${formData[type].iataCode} - ${formData[type].name}` 
      }));
    }
    
    // البحث عن الاقتراحات
    setTimeout(() => {
      if (searchInputs[type] && searchInputs[type].length >= 2) {
        searchAirportsFromAPI(searchInputs[type], type);
      } else {
        // إظهار المطارات الشائعة
        showPopularAirports(type);
      }
    }, 100);
  };

  const showPopularAirports = (type) => {
    const popularAirports = allAirports.current.slice(0, 5);
    setAirportSuggestions(prev => ({ ...prev, [type]: popularAirports }));
  };

  // معالجة تغيير البحث
  const handleSearchChange = (value, type) => {
    setSearchInputs(prev => ({ ...prev, [type]: value }));
    
    setValidationErrors(prev => ({ ...prev, [type]: '' }));
    
    // إلغاء البحث السابق
    if (type === 'origin' && searchOriginTimeoutRef.current) {
      clearTimeout(searchOriginTimeoutRef.current);
    }
    if (type === 'destination' && searchDestinationTimeoutRef.current) {
      clearTimeout(searchDestinationTimeoutRef.current);
    }

    if (value.length >= 1) {
      setShowSuggestions(prev => ({ ...prev, [type]: true }));
      const timeoutId = setTimeout(() => {
        if (value.length >= 2) {
          searchAirportsFromAPI(value, type);
        } else {
          showPopularAirports(type);
        }
      }, 300);
      
      if (type === 'origin') {
        searchOriginTimeoutRef.current = timeoutId;
      } else {
        searchDestinationTimeoutRef.current = timeoutId;
      }
    } else {
      setShowSuggestions(prev => ({ ...prev, [type]: true }));
      showPopularAirports(type);
    }
  };

  // عند التركيز
  const handleFocus = (type) => {
    setShowSuggestions(prev => ({ ...prev, [type]: true }));
    
    if (!searchInputs[type] || searchInputs[type].length === 0) {
      showPopularAirports(type);
    } else if (searchInputs[type].length >= 1) {
      if (searchInputs[type].length >= 2) {
        searchAirportsFromAPI(searchInputs[type], type);
      } else {
        showPopularAirports(type);
      }
    }
  };

  // عند فقدان التركيز
  const handleBlur = (type) => {
    setTimeout(() => {
      const activeElement = document.activeElement;
      const inputRef = type === 'origin' ? originInputRef.current : destinationInputRef.current;
      
      if (activeElement !== inputRef && 
          !activeElement?.closest('.suggestions-dropdown')) {
        setShowSuggestions(prev => ({ ...prev, [type]: false }));
        
        // إذا كان حقل البحث فارغاً ولكن لدينا بيانات في formData
        if (!searchInputs[type] && formData[type]) {
          setSearchInputs(prev => ({
            ...prev,
            [type]: `${formData[type].iataCode} - ${formData[type].name}`
          }));
        }
      }
    }, 200);
  };

  // زر مسح الحقل
  const handleClearField = (type, e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, [type]: null }));
    setSearchInputs(prev => ({ ...prev, [type]: '' }));
    setValidationErrors(prev => ({ ...prev, [type]: '' }));
    setShowSuggestions(prev => ({ ...prev, [type]: true }));
    showPopularAirports(type);
    
    if (type === 'origin' && originInputRef.current) {
      originInputRef.current.focus();
    } else if (type === 'destination' && destinationInputRef.current) {
      destinationInputRef.current.focus();
    }
  };

  // إغلاق القائمة
  const handleCloseSuggestions = (type) => {
    setShowSuggestions(prev => ({ ...prev, [type]: false }));
    setAirportSuggestions(prev => ({ ...prev, [type]: [] }));
  };

  // تبديل المطارات
  const swapAirports = () => {
    const currentOrigin = formData.origin;
    const currentDestination = formData.destination;
    const currentOriginInput = searchInputs.origin;
    const currentDestinationInput = searchInputs.destination;
    
    // التبديل في formData
    setFormData(prev => ({
      ...prev,
      origin: currentDestination,
      destination: currentOrigin
    }));
    
    // التبديل في searchInputs
    setSearchInputs(prev => ({
      origin: currentDestinationInput,
      destination: currentOriginInput
    }));
    
    setValidationErrors({
      origin: '',
      destination: ''
    });
  };

  // التحقق من البيانات
  const validateForm = () => {
    const errors = {
      origin: '',
      destination: ''
    };
    
    let isValid = true;
    
    if (!formData.origin || !formData.origin?.iataCode) {
      errors.origin = t('validation.originRequired') || 'Please select departure airport';
      isValid = false;
    }
    
    if (!formData.destination || !formData.destination?.iataCode) {
      errors.destination = t('validation.destinationRequired') || 'Please select arrival airport';
      isValid = false;
    }
    
    if (formData.origin && formData.destination && 
        formData.origin?.iataCode && formData.destination?.iataCode &&
        formData.origin.iataCode === formData.destination.iataCode) {
      errors.destination = t('validation.sameAirport') || 'Departure and arrival airports cannot be the same';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Submitting form with:', formData); // Debug
    
    if (!validateForm()) {
      if (validationErrors.origin && originInputRef.current) {
        originInputRef.current.focus();
      } else if (validationErrors.destination && destinationInputRef.current) {
        destinationInputRef.current.focus();
      }
      return;
    }
    
    const searchData = {
      origin: formData.origin?.iataCode || '',
      destination: formData.destination?.iataCode || '',
      originName: formData.origin?.name || '',
      destinationName: formData.destination?.name || '',
      originCity: formData.origin?.address?.cityName || '',
      destinationCity: formData.destination?.address?.cityName || '',
      departureDate: formData.departureDate,
      passengers: formData.passengers,
      tripType: formData.tripType,
      class: formData.class,
      returnDate: formData.returnDate || ''
    };
    
    console.log('Search data prepared:', searchData); // Debug
    onSearch(searchData);
  };

  // النقر خارج الحقل
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && 
          !suggestionsRef.current.contains(event.target) &&
          !originInputRef.current?.contains(event.target) &&
          !destinationInputRef.current?.contains(event.target)) {
        setShowSuggestions({ origin: false, destination: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // تنظيف timeouts
  useEffect(() => {
    return () => {
      if (searchOriginTimeoutRef.current) {
        clearTimeout(searchOriginTimeoutRef.current);
      }
      if (searchDestinationTimeoutRef.current) {
        clearTimeout(searchDestinationTimeoutRef.current);
      }
    };
  }, []);

  // الحصول على قيمة العرض
  const getInputValue = (type) => {
    return searchInputs[type] || '';
  };

  return (
    <div className="search-form-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="trip-type">
          <button
            type="button"
            className={`type-button ${formData.tripType === 'one-way' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, tripType: 'one-way' }))}
          >
            {t('search.oneWay')}
          </button>
          <button
            type="button"
            className={`type-button ${formData.tripType === 'round-trip' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, tripType: 'round-trip' }))}
          >
            {t('search.roundTrip')}
          </button>
        </div>

        <div className="airports-row">
          {/* حقل "من" */}
          <div className="airport-input">
            <label>
              <FaPlaneDeparture /> {t('search.from')}
              <span className="required-star">*</span>
            </label>
            <div className="autocomplete-wrapper" ref={originInputRef}>
              <div className="input-with-icon">
                <FaPlaneDeparture className="input-icon" />
                <input
                  ref={originInputRef}
                  type="text"
                  className={`airport-search-input ${validationErrors.origin ? 'error' : ''}`}
                  placeholder={t('search.airportPlaceholder') || "Search for departure airport..."}
                  value={getInputValue('origin')}
                  onChange={(e) => handleSearchChange(e.target.value, 'origin')}
                  onFocus={() => handleFocus('origin')}
                  onBlur={() => handleBlur('origin')}
                  onClick={() => handleInputClick('origin')}
                />
                <div className="input-actions">
                  {searchInputs.origin && (
                    <button 
                      type="button" 
                      className="clear-button"
                      onClick={(e) => handleClearField('origin', e)}
                      title="Clear"
                    >
                      <FaTimes />
                    </button>
                  )}
                  {loadingAirports.origin && (
                    <FaSpinner className="spinner-icon" />
                  )}
                </div>
              </div>
              
              {showSuggestions.origin && (
                <div className="suggestions-dropdown">
                  <div className="suggestions-header">
                    <span>Departure Airports</span>
                    <button 
                      type="button" 
                      className="close-suggestions"
                      onClick={() => handleCloseSuggestions('origin')}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  {airportSuggestions.origin.length > 0 ? (
                    airportSuggestions.origin.map((airport, index) => (
                      <div
                        key={`${airport.iataCode}-${index}`}
                        className={`suggestion-item ${formData.origin?.iataCode === airport.iataCode ? 'selected' : ''}`}
                        onClick={() => handleSelectAirport(airport, 'origin')}
                      >
                        <div className="airport-code">{airport.iataCode}</div>
                        <div className="airport-info">
                          <div className="airport-name">{airport.name}</div>
                          <div className="airport-location">
                            {airport.address?.cityName}, {airport.address?.countryName}
                          </div>
                        </div>
                        {formData.origin?.iataCode === airport.iataCode && (
                          <div className="selected-indicator">✓</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-suggestions">
                      {searchInputs.origin.length > 0 
                        ? 'No airports found'
                        : 'Start typing to search airports...'}
                    </div>
                  )}
                </div>
              )}
              
              {validationErrors.origin && (
                <div className="error-message">{validationErrors.origin}</div>
              )}
            </div>
          </div>

          {/* زر التبديل */}
          <button 
            type="button" 
            className="swap-button" 
            onClick={swapAirports} 
            title={t('search.swap') || "Swap airports"}
            disabled={!formData.origin || !formData.destination}
          >
            <FaExchangeAlt />
          </button>

          {/* حقل "إلى" */}
          <div className="airport-input">
            <label>
              <FaPlaneArrival /> {t('search.to')}
              <span className="required-star">*</span>
            </label>
 
<div className="autocomplete-wrapper" ref={destinationSuggestionsRef}>

              <div className="input-with-icon">
                <FaPlaneArrival className="input-icon" />
                <input
                  ref={destinationInputRef}
                  type="text"
                  className={`airport-search-input ${validationErrors.destination ? 'error' : ''}`}
                  placeholder={t('search.airportPlaceholder') || "Search for arrival airport..."}
                  value={getInputValue('destination')}
                  onChange={(e) => handleSearchChange(e.target.value, 'destination')}
                  onFocus={() => handleFocus('destination')}
                  onBlur={() => handleBlur('destination')}
                  onClick={() => handleInputClick('destination')}

                />
                <div className="input-actions">
                  {searchInputs.destination && (
                    <button 
                      type="button" 
                      className="clear-button"
                      onClick={(e) => handleClearField('destination', e)}
                      title="Clear"
                    >
                      <FaTimes />
                    </button>
                  )}
                  {loadingAirports.destination && (
                    <FaSpinner className="spinner-icon" />
                  )}
                </div>
              </div>
              
              {showSuggestions.destination && (
                <div className="suggestions-dropdown">
                  <div className="suggestions-header">
                    <span>Arrival Airports</span>
                    <button 
                      type="button" 
                      className="close-suggestions"
                      onClick={() => handleCloseSuggestions('destination')}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  {airportSuggestions.destination.length > 0 ? (
                    airportSuggestions.destination.map((airport, index) => (
                      <div
                        key={`${airport.iataCode}-${index}`}
                        className={`suggestion-item ${formData.destination?.iataCode === airport.iataCode ? 'selected' : ''}`}
                        onClick={() => handleSelectAirport(airport, 'destination')}
                      >
                        <div className="airport-code">{airport.iataCode}</div>
                        <div className="airport-info">
                          <div className="airport-name">{airport.name}</div>
                          <div className="airport-location">
                            {airport.address?.cityName}, {airport.address?.countryName}
                          </div>
                        </div>
                        {formData.destination?.iataCode === airport.iataCode && (
                          <div className="selected-indicator">✓</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-suggestions">
                      {searchInputs.destination.length > 0 
                        ? 'No airports found'
                        : 'Start typing to search airports...'}
                    </div>
                  )}
                </div>
              )}
              
              {validationErrors.destination && (
                <div className="error-message">{validationErrors.destination}</div>
              )}
            </div>
          </div>
        </div>

        {/* باقي الحقول... */}
        {/* ... (نفس الكود السابق) ... */}
        
        <div className="dates-row">
          <div className="date-input">
            <label>{t('search.departure')}</label>
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          {formData.tripType === 'round-trip' && (
            <div className="date-input">
              <label>{t('search.return')}</label>
              <input
                type="date"
                value={formData.returnDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                min={formData.departureDate}
                required={formData.tripType === 'round-trip'}
              />
            </div>
          )}
        </div>

        <div className="passengers-row">
          <div className="passengers-input">
            <label>
              <FaUsers /> {t('search.passengers')}
            </label>
            <div className="passengers-control">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  passengers: Math.max(1, prev.passengers - 1) 
                }))}
                className="control-button"
              >
                -
              </button>
              <span className="passengers-count">{formData.passengers}</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  passengers: Math.min(9, prev.passengers + 1) 
                }))}
                className="control-button"
              >
                +
              </button>
            </div>
          </div>

          <div className="class-input">
            <label>{t('search.class')}</label>
            <select
              value={formData.class}
              onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
            >
              <option value="economy">{t('search.economy')}</option>
              <option value="business">{t('search.business')}</option>
              <option value="first">{t('search.first')}</option>
            </select>
          </div>
        </div>

        {(!formData.origin || !formData.destination) && (
          <div className="form-warning">
            ⚠️ {t('validation.selectAirports') || 'Please select both departure and arrival airports'}
          </div>
        )}

        <button 
          type="submit" 
          className="search-button" 
          disabled={loading || !formData.origin || !formData.destination}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              {t('search.searching') || 'Searching...'}
            </>
          ) : (
            <>
              <FaSearch />
              {t('search.search') || 'Search Flights'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;