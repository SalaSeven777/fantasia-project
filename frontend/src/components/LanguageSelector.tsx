import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Simple flag icons for languages
const LanguageFlag = ({ language }: { language: string }) => {
  const flags: Record<string, string> = {
    en: '🇬🇧',
    fr: '🇫🇷',
    ar: '🇸🇦',
  };

  return <span className="mr-2">{flags[language] || '🌐'}</span>;
};

// Language names in their native language
const languageNames: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};

interface LanguageSelectorProps {
  className?: string;
  dropdownPosition?: 'top' | 'bottom';
  iconOnly?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '',
  dropdownPosition = 'bottom',
  iconOnly = false
}) => {
  const { i18n, t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  // If language code contains a region (e.g., "en-US"), get only the language part
  const getBaseLanguage = (language: string) => {
    return language.split('-')[0];
  };

  useEffect(() => {
    // Keep local state in sync with i18n
    setCurrentLanguage(getBaseLanguage(i18n.language || 'en'));
  }, [i18n.language]);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('i18nextLng', language);
    setDropdownOpen(false);
  };
  
  // Set RTL direction for Arabic
  useEffect(() => {
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    // Add/remove RTL class to help with styling
    if (currentLanguage === 'ar') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [currentLanguage]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-1 py-2 px-3 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
        aria-expanded={dropdownOpen}
      >
        <LanguageFlag language={currentLanguage} />
        {!iconOnly && (
          <>
            <span>{languageNames[currentLanguage] || languageNames.en}</span>
            <svg
              className="h-4 w-4 text-neutral-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </>
        )}
      </button>

      {dropdownOpen && (
        <>
          {/* Backdrop for closing the dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setDropdownOpen(false)}
          ></div>
          
          {/* Dropdown menu */}
          <div 
            className={`absolute ${
              dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
            } right-0 z-20 w-48 bg-white rounded-md shadow-lg py-1 border border-neutral-200`}
          >
            {Object.keys(languageNames).map((language) => (
              <button
                key={language}
                onClick={() => changeLanguage(language)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 flex items-center ${
                  currentLanguage === language ? 'bg-neutral-50 font-medium' : ''
                }`}
              >
                <LanguageFlag language={language} />
                {languageNames[language]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector; 