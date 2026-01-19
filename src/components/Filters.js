import React, { useState, useEffect } from 'react';
import { FaFilter, FaTimes, FaSlidersH } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';
import './Filters.css';

const Filters = ({ filters, setFilters, flights }) => {
  const { t, isRTL } = useTranslation();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // مزامنة localFilters مع filters الخارجية عند تغييرها
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const uniqueAirlines = flights.length > 0 
    ? [...new Set(flights.map(f => f.airline))]
    : [];

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...localFilters };
    
    switch (filterType) {
      case 'stops':
        newFilters.stops = localFilters.stops.includes(value)
          ? localFilters.stops.filter(s => s !== value)
          : [...localFilters.stops, value];
        break;
        
      case 'airlines':
        newFilters.airlines = localFilters.airlines.includes(value)
          ? localFilters.airlines.filter(a => a !== value)
          : [...localFilters.airlines, value];
        break;
        
      case 'priceRange':
        newFilters.priceRange = value;
        break;
        
      case 'departureTime':
        newFilters.departureTime = localFilters.departureTime.includes(value)
          ? localFilters.departureTime.filter(t => t !== value)
          : [...localFilters.departureTime, value];
        break;
        
      case 'duration':
        newFilters.duration = value;
        break;
        
      default:
        break;
    }
    
    // تحديث الحالة المحلية والفلاتر الرئيسية فوراً
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  // تطبيق الفلتر فور تغيير السعر (مع debounce)
  const handlePriceChange = (newValue) => {
    const newFilters = {
      ...localFilters,
      priceRange: [localFilters.priceRange[0], newValue]
    };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  const handleMinPriceChange = (newValue) => {
    const newFilters = {
      ...localFilters,
      priceRange: [parseInt(newValue), localFilters.priceRange[1]]
    };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  const handleDurationChange = (index, newValue) => {
    const newDuration = [...localFilters.duration];
    newDuration[index] = parseInt(newValue);
    const newFilters = { ...localFilters, duration: newDuration };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  const resetFilters = () => {
    const reset = {
      stops: [],
      priceRange: [0, 5000],
      airlines: [],
      duration: [0, 24],
      departureTime: [],
    };
    setLocalFilters(reset);
    setFilters(reset);
    setMobileFiltersOpen(false);
  };

  const FilterSection = ({ title, children }) => (
    <div className="filter-section">
      <h3 className="filter-title">
        <FaFilter className="filter-icon" />
        {title}
      </h3>
      {children}
    </div>
  );

  // إغلاق الفلاتر المتنقلة بعد اختيار فلتر
  const handleMobileFilterChange = (filterType, value) => {
    handleFilterChange(filterType, value);
    // إغلاق الفلاتر المتنقلة تلقائياً بعد الاختيار
    if (window.innerWidth < 768) {
      setTimeout(() => {
        setMobileFiltersOpen(false);
      }, 300);
    }
  };

  return (
    <>
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="mobile-filter-button"
      >
        <FaSlidersH />
        {t('filters.title')}
        {(filters.stops.length > 0 || 
          filters.airlines.length > 0 || 
          filters.departureTime.length > 0) && (
          <span className="active-filters-count">
            {filters.stops.length + filters.airlines.length + filters.departureTime.length}
          </span>
        )}
      </button>

      <div className="filters-sidebar">
        <div className="filters-header">
          <h2>🔍 {t('filters.title')}</h2>
          <button onClick={resetFilters} className="reset-button">
            {t('filters.reset')}
          </button>
        </div>

        <div className="filters-content">
          <FilterSection title={t('filters.stops')}>
            <div className="filter-options">
              {[
                { value: 0, label: t('filters.direct'), count: flights.filter(f => f.stops === 0).length },
                { value: 1, label: t('filters.oneStop'), count: flights.filter(f => f.stops === 1).length },
                { value: 2, label: t('filters.twoStops'), count: flights.filter(f => f.stops >= 2).length },
              ].map(option => (
                <label key={option.value} className="filter-option">
                  <input
                    type="checkbox"
                    checked={localFilters.stops.includes(option.value)}
                    onChange={() => handleFilterChange('stops', option.value)}
                    className="filter-checkbox"
                  />
                  <span className="filter-label">{option.label}</span>
                  <span className="filter-count">{option.count}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title={t('filters.priceRange')}>
            <div className="price-filter">
              <div className="price-inputs">
                <div className="price-input-group">
                  <label>{t('filters.minPrice')}</label>
                  <input
                    type="number"
                    min="0"
                    max={localFilters.priceRange[1]}
                    value={localFilters.priceRange[0]}
                    onChange={(e) => handleMinPriceChange(e.target.value)}
                    className="price-input"
                  />
                  <span className="currency">{t('common.currency')}</span>
                </div>
                <div className="price-input-group">
                  <label>{t('filters.maxPrice')}</label>
                  <input
                    type="number"
                    min={localFilters.priceRange[0]}
                    max="5000"
                    value={localFilters.priceRange[1]}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="price-input"
                  />
                  <span className="currency">{t('common.currency')}</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={localFilters.priceRange[1]}
                onChange={(e) => handlePriceChange(parseInt(e.target.value))}
                className="price-slider"
              />
              <div className="price-values">
                <div className="price-value">
                  <div className="price-amount">{localFilters.priceRange[0]} {t('common.currency')}</div>
                </div>
                <div className="price-value">
                  <div className="price-amount">{localFilters.priceRange[1]} {t('common.currency')}</div>
                </div>
              </div>
            </div>
          </FilterSection>

          <FilterSection title={t('filters.duration')}>
            <div className="duration-filter">
              <div className="duration-inputs">
                <div className="duration-input-group">
                  <label>{t('filters.minDuration')}</label>
                  <input
                    type="number"
                    min="0"
                    max={localFilters.duration[1]}
                    value={localFilters.duration[0]}
                    onChange={(e) => handleDurationChange(0, e.target.value)}
                    className="duration-input"
                  />
                  <span>{t('filters.hours')}</span>
                </div>
                <div className="duration-input-group">
                  <label>{t('filters.maxDuration')}</label>
                  <input
                    type="number"
                    min={localFilters.duration[0]}
                    max="24"
                    value={localFilters.duration[1]}
                    onChange={(e) => handleDurationChange(1, e.target.value)}
                    className="duration-input"
                  />
                  <span>{t('filters.hours')}</span>
                </div>
              </div>
              <div className="duration-range">
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={localFilters.duration[0]}
                  onChange={(e) => handleDurationChange(0, parseInt(e.target.value))}
                  className="duration-slider"
                />
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={localFilters.duration[1]}
                  onChange={(e) => handleDurationChange(1, parseInt(e.target.value))}
                  className="duration-slider"
                />
              </div>
            </div>
          </FilterSection>

          {uniqueAirlines.length > 0 && (
            <FilterSection title={t('filters.airlines')}>
              <div className="filter-options">
                {uniqueAirlines.map(airline => (
                  <label key={airline} className="filter-option">
                    <input
                      type="checkbox"
                      checked={localFilters.airlines.includes(airline)}
                      onChange={() => handleFilterChange('airlines', airline)}
                      className="filter-checkbox"
                    />
                    <span className="filter-label">{airline}</span>
                    <span className="filter-count">
                      {flights.filter(f => f.airline === airline).length}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          <FilterSection title={t('filters.departureTime')}>
            <div className="time-grid">
              {[
                { value: 'morning', label: t('filters.morning'), time: '06:00 - 12:00' },
                { value: 'afternoon', label: t('filters.afternoon'), time: '12:00 - 18:00' },
                { value: 'evening', label: t('filters.evening'), time: '18:00 - 24:00' },
                { value: 'night', label: t('filters.night'), time: '00:00 - 06:00' },
              ].map(time => (
                <label
                  key={time.value}
                  className={`time-option ${localFilters.departureTime.includes(time.value) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={localFilters.departureTime.includes(time.value)}
                    onChange={() => handleFilterChange('departureTime', time.value)}
                    className="time-checkbox"
                  />
                  <div className="time-content">
                    <div className="time-label">{time.label}</div>
                    <div className="time-range">{time.time}</div>
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="mobile-filters-overlay">
          <div className="mobile-filters">
            <div className="mobile-filters-header">
              <h2>🔍 {t('filters.title')}</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="close-button">
                <FaTimes />
              </button>
            </div>
            
            <div className="mobile-filters-content">
              <FilterSection title={t('filters.stops')}>
                <div className="filter-options">
                  {[
                    { value: 0, label: t('filters.direct'), count: flights.filter(f => f.stops === 0).length },
                    { value: 1, label: t('filters.oneStop'), count: flights.filter(f => f.stops === 1).length },
                    { value: 2, label: t('filters.twoStops'), count: flights.filter(f => f.stops >= 2).length },
                  ].map(option => (
                    <label key={option.value} className="filter-option">
                      <input
                        type="checkbox"
                        checked={localFilters.stops.includes(option.value)}
                        onChange={() => handleMobileFilterChange('stops', option.value)}
                        className="filter-checkbox"
                      />
                      <span className="filter-label">{option.label}</span>
                      <span className="filter-count">{option.count}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title={t('filters.priceRange')}>
                <div className="price-filter">
                  <div className="price-inputs">
                    <div className="price-input-group">
                      <label>{t('filters.minPrice')}</label>
                      <input
                        type="number"
                        min="0"
                        max={localFilters.priceRange[1]}
                        value={localFilters.priceRange[0]}
                        onChange={(e) => handleMinPriceChange(e.target.value)}
                        className="price-input"
                      />
                      <span className="currency">{t('common.currency')}</span>
                    </div>
                    <div className="price-input-group">
                      <label>{t('filters.maxPrice')}</label>
                      <input
                        type="number"
                        min={localFilters.priceRange[0]}
                        max="5000"
                        value={localFilters.priceRange[1]}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className="price-input"
                      />
                      <span className="currency">{t('common.currency')}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={localFilters.priceRange[1]}
                    onChange={(e) => handlePriceChange(parseInt(e.target.value))}
                    className="price-slider"
                  />
                </div>
              </FilterSection>

              <FilterSection title={t('filters.airlines')}>
                <div className="filter-options">
                  {uniqueAirlines.map(airline => (
                    <label key={airline} className="filter-option">
                      <input
                        type="checkbox"
                        checked={localFilters.airlines.includes(airline)}
                        onChange={() => handleMobileFilterChange('airlines', airline)}
                        className="filter-checkbox"
                      />
                      <span className="filter-label">{airline}</span>
                      <span className="filter-count">
                        {flights.filter(f => f.airline === airline).length}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title={t('filters.departureTime')}>
                <div className="time-grid">
                  {[
                    { value: 'morning', label: t('filters.morning'), time: '06:00 - 12:00' },
                    { value: 'afternoon', label: t('filters.afternoon'), time: '12:00 - 18:00' },
                    { value: 'evening', label: t('filters.evening'), time: '18:00 - 24:00' },
                    { value: 'night', label: t('filters.night'), time: '00:00 - 06:00' },
                  ].map(time => (
                    <label
                      key={time.value}
                      className={`time-option ${localFilters.departureTime.includes(time.value) ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.departureTime.includes(time.value)}
                        onChange={() => handleMobileFilterChange('departureTime', time.value)}
                        className="time-checkbox"
                      />
                      <div className="time-content">
                        <div className="time-label">{time.label}</div>
                        <div className="time-range">{time.time}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </FilterSection>
              
              <div className="mobile-filters-actions">
                <button onClick={resetFilters} className="reset-button">
                  {t('filters.reset')}
                </button>
                <button onClick={() => setMobileFiltersOpen(false)} className="apply-button">
                  {t('filters.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Filters;