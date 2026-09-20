'use client';

import React, { useState } from 'react';
import { Facility, Language, UserLocation } from '../types';
import { translations } from '../i18n/translations';
import { getDirectionsUrl, shareEmergencyLocation } from '../services/shareService';
import { isExplicitly24x7 } from '../services/facilityService';
import {
  Phone,
  Navigation,
  Share2,
  Clock,
  ShieldCheck,
  Check,
  BedDouble,
  Radio,
  Building,
} from 'lucide-react';

interface FacilityCardProps {
  facility: Facility;
  language: Language;
  userLocation: UserLocation;
  conditionText?: string;
  isTopChoice?: boolean;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  language,
  userLocation,
  conditionText = '',
  isTopChoice = false,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const directionsUrl = getDirectionsUrl(
    facility.coordinates.lat,
    facility.coordinates.lng
  );

  const handleShare = async () => {
    await shareEmergencyLocation(userLocation, conditionText, facility);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const primaryPhone = facility.emergencyPhone || facility.phone;
  const isOsmLive = facility.source === 'osm_live';

  return (
    <div
      className={`relative rounded-2xl border-2 p-4 sm:p-5 transition-all shadow-lg ${
        isTopChoice
          ? 'bg-slate-900 border-rose-600/80 shadow-rose-950/30 ring-1 ring-rose-500/50'
          : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-600'
      }`}
    >
      {/* Top badges: 24/7 Status, Live OSM badge, & Distance */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {facility.emergency24x7 && isExplicitly24x7(facility.openHours) ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-950 text-rose-300 border border-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              {t.open247}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
              <Clock className="w-3.5 h-3.5" />
              {facility.openHours || 'Hours unavailable'}
            </span>
          )}

          {/* Live Data vs Fallback Indicator */}
          {isOsmLive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Live OSM</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
              <span>Verified Backup</span>
            </span>
          )}

          {isTopChoice && (
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
              Nearest Match
            </span>
          )}
        </div>

        {/* Distance & ETA */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-rose-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
          <span>{facility.distanceKm} {t.kmAway}</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">~{facility.etaMinutes} {t.minAway}</span>
        </div>
      </div>

      {/* Facility Name & Address */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base sm:text-lg font-black text-white leading-snug">
            {facility.name}
          </h3>
          {facility.verified && (
            <span title="Verified Healthcare Facility" className="shrink-0 text-emerald-400 mt-1">
              <ShieldCheck className="w-5 h-5" />
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
          {facility.address}
        </p>
      </div>

      {/* Real Capabilities / Services (No fabricated data) */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {facility.services && facility.services.length > 0 ? (
          facility.services.slice(0, 4).map((service, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
            >
              {service}
            </span>
          ))
        ) : (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
            Emergency Care Unit
          </span>
        )}

        {facility.bedAvailability && (
          <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
            <BedDouble className="w-3 h-3" />
            ICU: {facility.bedAvailability.icu} Beds
          </span>
        )}
      </div>

      {/* 3 Core Facility Actions: Call Facility, Navigate, Share */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-800">
        {/* CALL FACILITY (Disabled if phone is genuinely unavailable) */}
        {primaryPhone ? (
          <a
            href={`tel:${primaryPhone.replace(/[^0-9]/g, '')}`}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm shadow-md shadow-rose-950/40 transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>{t.callFacility}</span>
          </a>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800/80 text-slate-500 font-bold text-xs sm:text-sm cursor-not-allowed border border-slate-700/50"
            title="Direct phone number not listed on OpenStreetMap"
          >
            <Phone className="w-4 h-4 opacity-40" />
            <span>Phone Unavailable</span>
          </button>
        )}

        {/* NAVIGATE (DIRECTIONS) */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-xs sm:text-sm border border-slate-700 transition-all active:scale-95"
        >
          <Navigation className="w-4 h-4 text-cyan-400" />
          <span>{t.navigate}</span>
        </a>

        {/* SHARE WITH FAMILY / EMS */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs sm:text-sm border border-slate-700 transition-all active:scale-95 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-emerald-400" />}
          <span>{copied ? 'Shared!' : t.shareLocation}</span>
        </button>
      </div>
    </div>
  );
};
