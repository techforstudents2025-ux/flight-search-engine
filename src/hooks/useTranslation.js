import { useLanguage } from '../i18n/LanguageContext';

export const useTranslation = () => {
  const { t, language, changeLanguage, direction } = useLanguage();
  
  const translate = (key, params = {}) => {
    let text = t(key);
    
    // استبدال المعاملات إذا وجدت
    Object.keys(params).forEach(param => {
      text = text.replace(`{{${param}}}`, params[param]);
    });
    
    return text;
  };

  return {
    t: translate,
    language,
    changeLanguage,
    direction,
    isRTL: direction === 'rtl'
  };
};
