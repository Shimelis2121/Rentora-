import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage, languages, currentLanguageInfo } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        title="Change Language / ቋንቋ ይቀይሩ / Afaan Jijjiiraa"
      >
        <span className="text-sm">{currentLanguageInfo.flag}</span>
        <span className="font-semibold">{currentLanguageInfo.nativeName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Languages / ቋንቋዎች
          </div>
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 transition-colors ${
                language === l.code ? 'text-emerald-800 bg-emerald-50/60 font-bold' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{l.flag}</span>
                <span>{l.nativeName}</span>
              </div>
              {language === l.code && <Check className="w-4 h-4 text-emerald-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
