'use client';

import React, { useState, useEffect } from 'react';
import { Facility, FacilityType, Language, UserLocation } from '../types';
import { translations } from '../i18n/translations';
import { findNearbyFacilities } from '../services/facilityService';
import { getDirectionsUrl } from '../services/shareService';
import {
  Search,
  Star,
  Clock,
  Phone,
  Navigation,
  Sparkles,
  Droplet,
  Pill,
  Baby,
  Stethoscope,
  TestTubes,
  Radio,
  Loader2,
} from 'lucide-react';

interface NormalHealthcareProps {
  language: Language;
  userLocation: UserLocation;
  onSwitchToEmergency: () => void;
}

export const NormalHealthcare: React.FC<NormalHealthcareProps> = ({
  language,
  userLocation,
  onSwitchToEmergency,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<FacilityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories: { id: FacilityType | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t.categoryAll, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'dermatology', label: t.categoryDermatology, icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'gynecology', label: t.categoryGynecology, icon: <Baby className="w-4 h-4" /> },
    { id: 'pharmacy', label: t.categoryPharmacy, icon: <Pill className="w-4 h-4" /> },
    { id: 'blood_bank', label: t.categoryBloodBank, icon: <Droplet className="w-4 h-4" /> },
    { id: 'general_physician', label: t.categoryPhysician, icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'diagnostic_center', label: t.categoryDiagnostics, icon: <TestTubes className="w-4 h-4" /> },
  ];

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    const timer = setTimeout(() => {
      findNearbyFacilities(userLocation, selectedCategory, {
        mode: 'normal',
        searchQuery: searchQuery,
      })
        .then((data) => {
          if (isCurrent) {
            setFacilities(data);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isCurrent) setIsLoading(false);
        });
    }, 300);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [userLocation, selectedCategory, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* Normal Mode Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-950 border border-cyan-800/60 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Routine & Elective Healthcare</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{t.normalTitle}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">{t.normalSubtitle}</p>
          </div>

          <button
            onClick={onSwitchToEmergency}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/60 font-bold text-xs shrink-0 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Switch to Emergency SOS</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-5 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchFacilitiesPlaceholder}
            className="w-full pl-11 pr-4 py-3 bg-slate-950/90 text-slate-100 placeholder-slate-500 text-sm sm:text-base rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-medium"
          />
        </div>
      </div>

      {/* Specialty Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Facilities Comparison Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span>Found {facilities.length} healthcare facilities</span>
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
          </div>
          <span>Sorted by proximity from {userLocation.label}</span>
        </div>

        {facilities.length === 0 && !isLoading ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
            <p className="font-semibold text-sm">No facilities match your search query or filter in this area.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-cyan-400 underline font-semibold"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map((fac) => {
              const directionsUrl = getDirectionsUrl(
                fac.coordinates.lat,
                fac.coordinates.lng
              );
              const isOsm = fac.source === 'osm_live';

              return (
                <div
                  key={fac.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-md"
                >
                  <div>
                    {/* Top Row: Specialty + Distance + Source */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {fac.specialties[0] || fac.type.replace('_', ' ')}
                        </span>
                        {isOsm && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                            <Radio className="w-2.5 h-2.5 animate-pulse" />
                            <span>Live OSM</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        {fac.rating && (
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{fac.rating}</span>
                          </div>
                        )}
                        <span className="font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {fac.distanceKm} km
                        </span>
                      </div>
                    </div>

                    {/* Facility Name & Address */}
                    <h3 className="text-base font-bold text-white leading-tight">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {fac.address}
                    </p>

                    {/* Hours */}
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{fac.openHours}</span>
                    </div>

                    {/* Services */}
                    {fac.services && fac.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {fac.services.map((srv, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-medium"
                          >
                            {srv}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
                    {fac.phone ? (
                      <a
                        href={`tel:${fac.phone.replace(/[^0-9]/g, '')}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t.callFacility}</span>
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/60 text-slate-500 font-bold text-xs border border-slate-800 cursor-not-allowed"
                        title="Phone number not listed on OpenStreetMap"
                      >
                        <Phone className="w-3.5 h-3.5 opacity-40" />
                        <span>No Phone</span>
                      </button>
                    )}

                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-950/40 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t.navigate}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
