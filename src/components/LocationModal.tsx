'use client';

import React, { useState } from 'react';
import { UserLocation } from '../types';
import { PRESET_LOCATIONS, getLiveBrowserLocation } from '../services/locationService';
import { MapPin, Navigation, Check, X, AlertCircle } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: UserLocation;
  onSelectLocation: (loc: UserLocation) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDetectGPS = async () => {
    setIsLocating(true);
    setErrorMsg(null);
    try {
      const liveLoc = await getLiveBrowserLocation();
      onSelectLocation(liveLoc);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not fetch GPS. Please select a preset city below.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold">
            <MapPin className="w-5 h-5 text-rose-500" />
            <span>Select Your Location</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live GPS Button */}
        <button
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detecting Live GPS...' : 'Use Live GPS (Auto-Detect)'}</span>
        </button>

        {errorMsg && (
          <div className="text-xs text-amber-400 bg-amber-950/60 border border-amber-800 p-2.5 rounded-lg flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preset Cities */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-slate-400">Or Select a Preset Testing City:</p>
          <div className="space-y-1.5">
            {Object.entries(PRESET_LOCATIONS).map(([key, loc]) => {
              const isSelected =
                !currentLocation.isLive &&
                Math.abs(currentLocation.lat - loc.lat) < 0.01 &&
                Math.abs(currentLocation.lng - loc.lng) < 0.01;

              return (
                <button
                  key={key}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-rose-950/50 border-rose-600 text-white'
                      : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                    <span>{loc.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
