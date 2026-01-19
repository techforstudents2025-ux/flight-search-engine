import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [direction, setDirection] = useState('ltr'); // تغيير إلى ltr كقيمة افتراضية

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    // تصحيح المنطق: الإنجليزية = ltr، العربية = rtl
    setDirection(savedLanguage === 'en' ? 'ltr' : 'rtl');
    loadTranslations(savedLanguage);
    
    // تطبيق الاتجاه على body و html
    document.body.dir = savedLanguage === 'en' ? 'ltr' : 'rtl';
    document.documentElement.dir = savedLanguage === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = savedLanguage;
  }, []);

  const loadTranslations = async (lang) => {
    try {
      const translation = await import(`./${lang}.json`);
      setTranslations(translation.default);
    } catch (error) {
      console.error('Error loading translations:', error);
      // تحميل ملفات ترجمة افتراضية
      try {
        const fallbackTranslation = await import(`./en.json`);
        setTranslations(fallbackTranslation.default);
      } catch (fallbackError) {
        console.error('Error loading fallback translations:', fallbackError);
        setTranslations({}); // مجموعة فارغة كحماية
      }
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    // تصحيح المنطق: الإنجليزية = ltr، العربية = rtl
    setDirection(lang === 'en' ? 'ltr' : 'rtl');
    localStorage.setItem('language', lang);
    loadTranslations(lang);
    
    // تحديث اتجاه الصفحة
    document.body.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        console.warn(`Translation missing for key: ${key}`);
        // العودة إلى المفتاح أو البحث عن قيمة افتراضية
        return getFallbackValue(key);
      }
    }
    return value;
  };

  // دالة مساعدة للحصول على ترجمة افتراضية
  const getFallbackValue = (key) => {
    // بعض الترجمات الافتراضية الأساسية
    const fallbackTranslations = {
      'app.title': language === 'en' ? 'Flight Search' : 'بحث عن الرحلات',
      'app.subtitle': language === 'en' ? 'Find your perfect flight' : 'ابحث عن رحلتك المثالية',
      'search.search': language === 'en' ? 'Search' : 'بحث',
      'search.from': language === 'en' ? 'From' : 'من',
      'search.to': language === 'en' ? 'To' : 'إلى',
      'search.departure': language === 'en' ? 'Departure' : 'تاريخ المغادرة',
      'search.return': language === 'en' ? 'Return' : 'تاريخ العودة',
      'search.passengers': language === 'en' ? 'Passengers' : 'ركاب',
      'search.class': language === 'en' ? 'Class' : 'فئة السفر',
      'search.oneWay': language === 'en' ? 'One Way' : 'ذهاب فقط',
      'search.roundTrip': language === 'en' ? 'Round Trip' : 'ذهاب وعودة',
      'search.economy': language === 'en' ? 'Economy' : 'اقتصادية',
      'search.business': language === 'en' ? 'Business' : 'رجال الأعمال',
      'search.first': language === 'en' ? 'First' : 'الأولى',
      'common.currency': 'SAR',
      'filters.title': language === 'en' ? 'Filters' : 'الفلاتر',
      'filters.reset': language === 'en' ? 'Reset' : 'إعادة تعيين',
      'filters.apply': language === 'en' ? 'Apply' : 'تطبيق',
      'filters.close': language === 'en' ? 'Close' : 'إغلاق',
    };
    
    return fallbackTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      toggleLanguage,
      t, 
      direction,
      isRTL: direction === 'rtl'
    }}>
      {children}
    </LanguageContext.Provider>
  );
};