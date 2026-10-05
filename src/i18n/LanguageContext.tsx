import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, SUPPORTED_LANGUAGES, LanguageInfo } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  currentLanguageInfo: LanguageInfo;
  languages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('rentora_lang') as Language;
    if (saved && (saved === 'en' || saved === 'am' || saved === 'om')) {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('rentora_lang', lang);
    } catch {}
  };

  const t = (key: keyof typeof translations['en']): string => {
    const langDict = translations[language] || translations['en'];
    return (langDict as any)[key] || (translations['en'] as any)[key] || key;
  };

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageInfo,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
