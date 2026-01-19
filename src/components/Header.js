import React from 'react';
import { FaPlane, FaUser, FaBell } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import './Header.css';

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <FaPlane className="plane-icon" />
          <div>
            <h1>✈️ {t('app.title')}</h1>
            <p className="subtitle">{t('app.subtitle')}</p>
          </div>
        </div>
        
        <div className="header-actions">
          <LanguageSwitcher />
          
          <button className="icon-button">
            <FaBell />
            <span className="notification-dot"></span>
          </button>
          
          <button className="user-button">
            <FaUser />
            <span>{t('header.myAccount')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
