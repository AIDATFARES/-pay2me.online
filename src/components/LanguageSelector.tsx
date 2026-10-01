'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface LanguageOption {
  code: string;
  flagCode: string;
  name: string;
  shortCode: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', flagCode: 'us', name: 'English', shortCode: 'EN' },
  { code: 'nl', flagCode: 'nl', name: 'Dutch', shortCode: 'NL' },
  { code: 'fr', flagCode: 'fr', name: 'French', shortCode: 'FR' },
  { code: 'de', flagCode: 'de', name: 'German', shortCode: 'DE' },
  { code: 'it', flagCode: 'it', name: 'Italian', shortCode: 'IT' },
  { code: 'pt', flagCode: 'pt', name: 'Portuguese', shortCode: 'PT' },
  { code: 'ru', flagCode: 'ru', name: 'Russian', shortCode: 'RU' },
  { code: 'es', flagCode: 'es', name: 'Spanish', shortCode: 'ES' },
  { code: 'ar', flagCode: 'sa', name: 'Arabic', shortCode: 'AR' },
];

interface LanguageSelectorProps {
  className?: string;
  variant?: 'inline' | 'floating';
  direction?: 'down' | 'up';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'inline',
  direction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageOption>(LANGUAGES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // If direction is not explicitly set, floating opens up, inline opens down
  const effectiveDirection = direction || (variant === 'floating' ? 'up' : 'down');

  // Helper to read cookie
  const getGoogleTransCookie = (): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(?:^|; )googtrans=([^;]*)/);
    if (!match) return null;
    const val = decodeURIComponent(match[1]); // e.g. "/en/fr"
    const parts = val.split('/');
    return parts[parts.length - 1] || null;
  };

  // Helper to set cookie
  const setGoogleTransCookie = (targetCode: string) => {
    const hostname = window.location.hostname;
    if (targetCode === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${hostname}; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${hostname}; path=/;`;
    } else {
      const cookieVal = `/en/${targetCode}`;
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      document.cookie = `googtrans=${cookieVal}; domain=${hostname}; path=/;`;
      if (hostname.includes('.')) {
        document.cookie = `googtrans=${cookieVal}; domain=.${hostname}; path=/;`;
      }
    }
  };

  useEffect(() => {
    const cookieLangCode = getGoogleTransCookie();
    const savedCode = cookieLangCode || localStorage.getItem('site_lang') || 'en';
    const found = LANGUAGES.find((l) => l.code === savedCode) || LANGUAGES[0];
    setCurrentLang(found);

    // Ensure hidden container exists once
    if (!document.getElementById('google_translate_element')) {
      const container = document.createElement('div');
      container.id = 'google_translate_element';
      container.style.display = 'none';
      container.setAttribute('aria-hidden', 'true');
      document.body.appendChild(container);
    }

    // Initialize google translate callback
    (window as any).googleTranslateElementInit = () => {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: LANGUAGES.map((l) => l.code).join(','),
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Load Google Translate script once
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select language handler
  const handleSelectLanguage = (lang: LanguageOption) => {
    setCurrentLang(lang);
    setIsOpen(false);
    localStorage.setItem('site_lang', lang.code);
    setGoogleTransCookie(lang.code);

    // Trigger Google Translate combo element if available
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      select.value = lang.code;
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const containerClasses =
    variant === 'floating'
      ? `fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 notranslate ${className}`
      : `relative inline-block text-left notranslate ${className}`;

  return (
    <div ref={dropdownRef} className={containerClasses}>
      {/* Trigger Button with High Visibility & Contrast + Subtle Animation (e.g. 🇺🇸 EN ⌵) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          variant === 'floating'
            ? `flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs sm:text-sm font-black border-2 border-indigo-500/50 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/50 select-none hover:scale-105 active:scale-95 ${
                !isOpen ? 'animate-subtle-float' : 'shadow-2xl shadow-slate-950/40 ring-2 ring-indigo-500/50'
              }`
            : 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-extrabold border border-slate-700 shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 select-none hover:scale-102'
        }
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <img
          src={`/flags/${currentLang.flagCode}.png`}
          alt={currentLang.name}
          className="w-5 h-3.5 object-cover rounded-[2px] border border-white/20 shadow-xs flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
        />
        <span className="font-black tracking-tight text-white">{currentLang.shortCode}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-indigo-300 transition-transform duration-200 ease-out ${
            isOpen ? (effectiveDirection === 'up' ? '' : 'rotate-180') : (effectiveDirection === 'up' ? 'rotate-180' : '')
          }`}
        />
      </button>

      {/* Dropdown Menu Matching Screenshot */}
      {isOpen && (
        <div
          className={`absolute ${
            effectiveDirection === 'up' ? 'bottom-full mb-2.5' : 'top-full mt-2.5'
          } right-0 z-50 w-44 rounded-xl bg-white border border-slate-200/95 shadow-2xl shadow-slate-900/20 py-1.5 overflow-hidden transition-all duration-200 ease-out animate-in fade-in slide-in-from-bottom-2 zoom-in-95`}
        >
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100/60">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang)}
                  className={`w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-xs sm:text-sm transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#546b95] text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                  }`}
                >
                  <img
                    src={`/flags/${lang.flagCode}.png`}
                    alt={lang.name}
                    className="w-5 h-3.5 object-cover rounded-[2px] border border-black/15 shadow-2xs flex-shrink-0"
                  />
                  <span className="flex-1">{lang.name}</span>
                  {isSelected && (
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
