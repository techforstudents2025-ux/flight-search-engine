import React from 'react';
import { FaGlobe, FaLanguage } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useTranslation();

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    changeLanguage(newLang);
  };

  return (
    <button 
      className="language-switcher"
      onClick={toggleLanguage}
      title={language === 'ar' ? 'Switch to English' : 'التغيير إلى العربية'}
    >
      <FaGlobe className="globe-icon" />
      <span className="language-text">
        {language === 'ar' ? 'EN' : 'AR'}
      </span>
      <FaLanguage className="language-icon" />
    </button>
  );
};

export default LanguageSwitcher;
