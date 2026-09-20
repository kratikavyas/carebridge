'use client';

import React from 'react';
import { Facility, Language, UserLocation } from '../types';
import { translations } from '../i18n/translations';
import { FacilityCard } from './FacilityCard';
import { Building2, ShieldCheck, MapPin } from 'lucide-react';

interface FacilityListProps {
  facilities: Facility[];
  language: Language;
  userLocation: UserLocation;
  conditionText: string;
}

export const FacilityList: React.FC<FacilityListProps> = ({
  facilities,
  language,
  userLocation,
  conditionText,
}) => {
  const t = translations[language];

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-rose-500" />
            <span>{t.topFacilitiesTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            {t.nearestFacilitiesSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-rose-300 font-bold px-3 py-1 bg-rose-950/60 border border-rose-800 rounded-lg w-fit">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          <span>Top {facilities.length} Emergency Matches</span>
        </div>
      </div>

      {facilities.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="font-semibold text-sm">No emergency facilities detected within immediate range.</p>
          <p className="text-xs text-slate-500 mt-1">Please dial 112 directly or adjust your location coordinates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {facilities.map((facility, index) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              language={language}
              userLocation={userLocation}
              conditionText={conditionText}
              isTopChoice={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};
