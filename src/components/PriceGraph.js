import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useTranslation } from '../hooks/useTranslation';
import './PriceGraph.css';

const PriceGraph = ({ flights }) => {
  const { t, isRTL } = useTranslation();

  const generatePriceData = () => {
    if (!flights.length) return [];
    
    const data = [];
    const now = new Date();
    const basePrice = flights.reduce((sum, flight) => sum + flight.price, 0) / flights.length;
    
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const hourStr = hour.getHours().toString().padStart(2, '0') + ':00';
      
      const variation = Math.sin(i * 0.5) * 0.15 + Math.random() * 0.1;
      const price = Math.round(basePrice * (1 + variation));
      
      data.push({
        time: hourStr,
        price,
        avgPrice: Math.round(basePrice * 1.1),
        lowPrice: Math.round(price * 0.9),
        highPrice: Math.round(price * 1.2),
      });
    }
    
    return data;
  };

  const priceData = generatePriceData();
  
  const stats = flights.length > 0 ? {
    min: Math.min(...flights.map(f => f.price)),
    max: Math.max(...flights.map(f => f.price)),
    avg: Math.round(flights.reduce((sum, f) => sum + f.price, 0) / flights.length),
    current: flights[0] ? flights[0].price : 0,
  } : null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-time">{label}</p>
          <p className="tooltip-price">
            <span>{t('graph.currentPrice')}: </span>
            {payload[0].value} {t('common.currency')}
          </p>
          <p className="tooltip-avg">
            <span>{t('graph.averagePrice')}: </span>
            {payload[1] ? payload[1].value : 0} {t('common.currency')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="price-graph">
      <h2>📈 {t('graph.title')}</h2>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card current">
            <div className="stat-label">{t('graph.currentPrice')}</div>
            <div className="stat-value">{stats.current} {t('common.currency')}</div>
            <div className="stat-trend">
              <span className="trend-up">↑ 2.5%</span>
            </div>
          </div>
          
          <div className="stat-card average">
            <div className="stat-label">{t('graph.averagePrice')}</div>
            <div className="stat-value">{stats.avg} {t('common.currency')}</div>
            <div className="stat-trend">
              <span className="trend-down">↓ 1.2%</span>
            </div>
          </div>
          
          <div className="stat-card low">
            <div className="stat-label">{t('graph.lowestPrice')}</div>
            <div className="stat-value">{stats.min} {t('common.currency')}</div>
            <div className="stat-trend">
              <span className="trend-up">↑ 3.1%</span>
            </div>
          </div>
          
          <div className="stat-card high">
            <div className="stat-label">{t('graph.highestPrice')}</div>
            <div className="stat-value">{stats.max} {t('common.currency')}</div>
            <div className="stat-trend">
              <span className="trend-down">↓ 0.8%</span>
            </div>
          </div>
        </div>
      )}

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={priceData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#ddd' }}
            />
            <YAxis 
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#ddd' }}
              label={{ 
                value: `${t('graph.currentPrice')} (${t('common.currency')})`, 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#666' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="lowPrice"
              stackId="1"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.3}
              name={t('graph.lowestPrice')}
            />
            <Area
              type="monotone"
              dataKey="price"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
              name={t('graph.currentPrice')}
              strokeWidth={3}
              dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Area
              type="monotone"
              dataKey="highPrice"
              stackId="1"
              stroke="#ffc658"
              fill="#ffc658"
              fillOpacity={0.3}
              name={t('graph.highestPrice')}
            />
            <Line
              type="monotone"
              dataKey="avgPrice"
              stroke="#ff7300"
              strokeWidth={2}
              strokeDasharray="5 5"
              name={t('graph.averagePrice')}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="graph-info">
        <div className="info-icon">💡</div>
        <div className="info-content">
          <h4>{t('graph.tipsTitle')}</h4>
          <p>{t('graph.tipsMessage')}</p>
        </div>
      </div>
    </div>
  );
};

export default PriceGraph;
