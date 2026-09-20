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
    <header className="sticky top-0 z-40 w-full bg-[#090B10]/90 backdrop-blur-md border-b border-white/[0.08] transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={onResetHome}
          title="CareBridge Home"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-teal-400 group-hover:border-teal-500/40 transition-colors shadow-xs">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
              CareBridge
            </span>
          </div>
        </div>

        {/* Controls: Location + Language + SOS */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Location Pill */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-medium transition-all shadow-xs max-w-[120px] sm:max-w-[170px] truncate cursor-pointer"
            title="Change city or detect GPS"
          >
            <MapPin className={`w-3 h-3 shrink-0 ${userLocation.isLive ? 'text-teal-400' : 'text-zinc-400'}`} />
            <span className="truncate">{userLocation.label}</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-300 shadow-xs">
            <Globe className="w-3 h-3 mr-1 text-zinc-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer pr-1 font-medium"
              aria-label="Select Language"
            >
              <option value="en" className="bg-zinc-900 text-zinc-100">English</option>
              <option value="hi" className="bg-zinc-900 text-zinc-100">हिंदी (Hindi)</option>
              <option value="hinglish" className="bg-zinc-900 text-zinc-100">Hinglish</option>
              <option value="bn" className="bg-zinc-900 text-zinc-100">বাংলা (Bengali)</option>
              <option value="zh" className="bg-zinc-900 text-zinc-100">中文 (Chinese)</option>
              <option value="es" className="bg-zinc-900 text-zinc-100">Español (Spanish)</option>
              <option value="fr" className="bg-zinc-900 text-zinc-100">Français (French)</option>
              <option value="pt" className="bg-zinc-900 text-zinc-100">Português (Portuguese)</option>
              <option value="ar" className="bg-zinc-900 text-zinc-100">العربية (Arabic)</option>
            </select>
          </div>

          {/* 112 Emergency Button */}
          <button
            onClick={onTriggerEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 border border-rose-700/60 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title={`Instant Emergency SOS (${emergencyNum})`}
          >
            <PhoneCall className="w-3 h-3 text-rose-400" />
            <span className="hidden xs:inline">{emergencyNum} SOS</span>
            <span className="xs:hidden">{emergencyNum}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
