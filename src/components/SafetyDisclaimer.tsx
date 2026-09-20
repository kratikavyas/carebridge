'use client';

import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { AlertTriangle, PhoneCall } from 'lucide-react';

interface SafetyDisclaimerProps {
  language: Language;
}

export const SafetyDisclaimer: React.FC<SafetyDisclaimerProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="w-full bg-amber-950/40 border-y sm:border sm:rounded-xl border-amber-600/30 p-3 sm:p-4 text-amber-200">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-amber-300">
            {t.emergencyDisclaimer}
          </p>
        </div>
        <a
          href="tel:112"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shrink-0 shadow-sm transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>DIAL 112</span>
        </a>
      </div>
    </div>
  );
};
