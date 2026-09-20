'use client';

import React from 'react';
import { Facility, Language } from '../types';
import { translations } from '../i18n/translations';
import { getDirectionsUrl } from '../services/shareService';
import { isExplicitly24x7 } from '../services/facilityService';
import { Navigation, Phone, Clock, Radio, ShieldCheck } from 'lucide-react';

interface CompactFacilityCardProps {
  facility: Facility;
  language: Language;
  isEmergency?: boolean;
}

export const CompactFacilityCard: React.FC<CompactFacilityCardProps> = ({
  facility,
  language,
  isEmergency = false,
}) => {
  const t = translations[language] || translations.en;
  const directionsUrl = getDirectionsUrl(facility.coordinates.lat, facility.coordinates.lng);
  const primaryPhone = facility.emergencyPhone || facility.phone;
  const isOsmLive = facility.source === 'osm_live';

  const specialtyLabel =
    facility.specialties && facility.specialties.length > 0
      ? facility.specialties[0]
      : facility.type.replace('_', ' ');

  return (
    <div
      className={`rounded-xl p-4 sm:p-4.5 border transition-all ${
        isEmergency
          ? 'bg-zinc-900/90 border-rose-500/30 hover:border-rose-500/50'
          : 'bg-zinc-900/60 border-white/[0.08] hover:border-white/[0.14]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left info */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm sm:text-base font-semibold text-zinc-100 truncate">
              {facility.name}
            </h4>
            {isOsmLive ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/60 font-medium">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>OSM</span>
              </span>
            ) : (
              <span className="text-[10px] text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded font-normal">
                Backup
              </span>
            )}
            {facility.verified && (
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            )}
            {isEmergency && !facility.emergencyCapabilityVerified && (
              <span className="text-[10px] text-amber-400/90 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/40 font-normal">
                Emergency capability not verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
            <span className="capitalize font-medium text-zinc-300">
              {isEmergency ? 'Emergency Care' : specialtyLabel}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="font-semibold text-zinc-200">
              {facility.distanceKm} {t.kmAway}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400">
              {facility.emergency24x7 && isExplicitly24x7(facility.openHours) ? (
                <span className="text-rose-400 font-medium">24/7 Open</span>
              ) : (
                facility.openHours || 'Hours unavailable'
              )}
            </span>
          </div>

          {facility.address && (
            <p className="text-[11px] text-zinc-500 truncate max-w-md">
              {facility.address}
            </p>
          )}
        </div>

        {/* Right action buttons: [ Navigate ] [ Call ] */}
        <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
          {/* Navigate */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-white/10 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-zinc-400" />
            <span>Navigate</span>
          </a>

          {/* Call button (disabled if phone is missing) */}
          {primaryPhone ? (
            <a
              href={`tel:${primaryPhone.replace(/[^0-9]/g, '')}`}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isEmergency
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-950/30'
                  : 'bg-zinc-100 hover:bg-white text-zinc-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          ) : (
            <button
              disabled
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 text-zinc-500 text-xs font-normal border border-white/[0.05] cursor-not-allowed"
              title="Phone number not listed on OpenStreetMap"
            >
              <Phone className="w-3.5 h-3.5 opacity-30" />
              <span>No phone</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
