'use client';

import React, { useState } from 'react';
import { Language, UserLocation, Facility } from '../types';
import { translations } from '../i18n/translations';
import { shareEmergencyLocation } from '../services/shareService';
import { PhoneCall, Ambulance, Share2, Check, AlertOctagon } from 'lucide-react';

interface QuickEmergencyBarProps {
  language: Language;
  userLocation: UserLocation;
  conditionText: string;
  nearestFacility?: Facility;
}

export const QuickEmergencyBar: React.FC<QuickEmergencyBarProps> = ({
  language,
  userLocation,
  conditionText,
  nearestFacility,
}) => {
  const t = translations[language];
  const [sharedToast, setSharedToast] = useState(false);

  const handleShare = async () => {
    await shareEmergencyLocation(userLocation, conditionText, nearestFacility);
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 4000);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* CALL 112 */}
        <a
          href="tel:112"
          className="relative group flex items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-base sm:text-lg shadow-xl shadow-rose-950/50 border-2 border-rose-400 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
            <PhoneCall className="w-6 h-6 animate-bounce" />
          </div>
          <div className="text-left">
            <div className="leading-tight tracking-wide">{t.call112}</div>
            <div className="text-[11px] font-medium text-rose-100 opacity-90">
              {t.call112Sub}
            </div>
          </div>
        </a>

        {/* CALL 108 AMBULANCE */}
        <a
          href="tel:108"
          className="flex items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-base sm:text-lg border-2 border-amber-500/80 shadow-lg shadow-amber-950/20 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400">
            <Ambulance className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="leading-tight tracking-wide text-white">{t.call108}</div>
            <div className="text-[11px] font-medium text-amber-300">
              Free Emergency Dispatch
            </div>
          </div>
        </a>

        {/* SHARE LOCATION SOS */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-emerald-300 font-black text-base sm:text-lg border-2 border-emerald-500/80 shadow-lg shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400">
            {sharedToast ? <Check className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
          </div>
          <div className="text-left">
            <div className="leading-tight tracking-wide text-white">
              {sharedToast ? 'SOS Triggered!' : t.shareLocation}
            </div>
            <div className="text-[11px] font-medium text-emerald-400">
              WhatsApp & GPS Pin
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
