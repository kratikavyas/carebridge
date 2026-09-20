'use client';

import React from 'react';
import { Language, UserLocation, CountryConfig } from '../types';
import { translations } from '../i18n/translations';
import { HeartPulse, Globe, MapPin, PhoneCall } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userLocation: UserLocation;
  country?: CountryConfig;
  onOpenLocationModal: () => void;
  onTriggerEmergency: () => void;
  onResetHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  userLocation,
  country,
  onOpenLocationModal,
  onTriggerEmergency,
  onResetHome,
}) => {
  const t = translations[language] || translations.en;
  const emergencyNum = country?.emergencyNumber || '112';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/85 backdrop-blur-md border-b border-zinc-200/70 transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={onResetHome}
          title="CareBridge Home"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 group-hover:bg-teal-100/70 transition-colors shadow-xs">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 group-hover:text-teal-900 transition-colors">
              CareBridge
            </span>
          </div>
        </div>

        {/* Controls: Location + Language + SOS */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Location Pill */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200/80 text-xs font-medium transition-all shadow-xs max-w-[120px] sm:max-w-[170px] truncate cursor-pointer"
            title="Change city or detect GPS"
          >
            <MapPin className={`w-3 h-3 shrink-0 ${userLocation.isLive ? 'text-teal-600' : 'text-zinc-400'}`} />
            <span className="truncate">{userLocation.label}</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-white border border-zinc-200/80 rounded-lg px-2 py-1.5 text-xs text-zinc-700 shadow-xs">
            <Globe className="w-3 h-3 mr-1 text-zinc-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-xs text-zinc-800 focus:outline-none cursor-pointer pr-1 font-medium"
              aria-label="Select Language"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="hinglish">Hinglish</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="zh">中文 (Chinese)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="pt">Português (Portuguese)</option>
              <option value="ar">العربية (Arabic)</option>
            </select>
          </div>

          {/* Subtle Emergency SOS Button */}
          <button
            onClick={onTriggerEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title={`Instant Emergency SOS (${emergencyNum})`}
          >
            <PhoneCall className="w-3 h-3 text-rose-600" />
            <span className="hidden xs:inline">{emergencyNum} SOS</span>
            <span className="xs:hidden">{emergencyNum}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
