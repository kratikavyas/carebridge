'use client';

import React, { useState } from 'react';
import { ConversationTurn, Facility, Language, UserLocation, CountryConfig } from '../types';
import { translations } from '../i18n/translations';
import { speakText, stopSpeaking } from '../services/speechService';
import { CompactFacilityCard } from './CompactFacilityCard';
import {
  PhoneCall,
  Volume2,
  Square,
  Share2,
  Loader2,
  Ambulance,
  HeartPulse,
} from 'lucide-react';

interface ConversationalMessageTurnProps {
  turn: ConversationTurn;
  language: Language;
  userLocation: UserLocation;
  country: CountryConfig;
  onShareLocation: (facility?: Facility) => void;
}

export const ConversationalMessageTurn: React.FC<ConversationalMessageTurnProps> = ({
  turn,
  language,
  userLocation,
  country,
  onShareLocation,
}) => {
  const activeLang: Language = language || turn.language || 'en';
  const t = translations[activeLang] || translations.en;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const { triage, facilities, isLoadingFacilities } = turn;
  const isEmergency = triage.urgencyLevel === 'CRITICAL' || triage.urgencyLevel === 'URGENT';
  const isCritical = triage.urgencyLevel === 'CRITICAL';

  // Two-layer response texts:
  // Strict language resolution ensuring English is ALWAYS strictly respected when selected
  const visualText =
    (activeLang === 'en'
      ? triage.conversationalResponse?.en
      : triage.conversationalResponse?.[activeLang]) ||
    triage.conversationalResponse?.en ||
    (activeLang === 'en'
      ? triage.immediateGuidance.en
      : triage.immediateGuidance[activeLang]) ||
    triage.immediateGuidance.en ||
    '';

  // Layer 2: Short spoken response for audio TTS (never a long medical essay)
  const spokenText =
    (activeLang === 'en'
      ? triage.spokenResponse?.en
      : triage.spokenResponse?.[activeLang]) ||
    triage.spokenResponse?.en ||
    visualText;

  const immediateGuidanceText =
    (activeLang === 'en'
      ? triage.immediateGuidance.en
      : triage.immediateGuidance[activeLang]) ||
    triage.immediateGuidance.en ||
    '';

  const actionPromptText =
    (activeLang === 'en'
      ? triage.actionPrompt?.en
      : triage.actionPrompt?.[activeLang]) ||
    triage.actionPrompt?.en ||
    'Nearby Healthcare Facilities';

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakText(
        spokenText,
        activeLang,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  // In emergency mode: top 3 (or 5 on escalation). In normal mode: display all returned providers up to requested count
  const topFacilities = isEmergency
    ? facilities.slice(0, turn.escalationState === 'facility_unreachable' ? 5 : 3)
    : facilities;
  const emergencyNum = country.emergencyNumber || '112';

  return (
    <div className="space-y-4 my-6 sm:my-8 animate-in fade-in duration-300">
      {/* 1. User Message (clean speech bubble) */}
      <div className="flex justify-end">
        <div className="max-w-xl bg-zinc-800/90 text-zinc-100 rounded-2xl rounded-tr-sm px-4 py-3 border border-white/[0.08] shadow-sm">
          <p className="text-sm sm:text-base leading-relaxed">{turn.query}</p>
          <span className="block text-[10px] text-zinc-500 mt-1 text-right">
            {turn.timestamp}
          </span>
        </div>
      </div>

      {/* 2. CareBridge Response */}
      <div className="flex justify-start">
        <div
          className={`w-full max-w-3xl rounded-2xl p-5 sm:p-6 transition-all ${
            isEmergency
              ? 'bg-zinc-950 border border-rose-600/40 shadow-xl shadow-rose-950/20'
              : 'bg-zinc-900/40 border border-white/[0.08]'
          }`}
        >
          {/* Header indicator */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              {isEmergency ? (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    {isCritical ? '🔴 EMERGENCY' : '⚠️ URGENT MEDICAL ATTENTION'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-300">
                    CareBridge Navigator
                  </span>
                </div>
              )}
            </div>

            {/* Audio Read-out (reads ONLY the short spoken response) */}
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isPlayingAudio
                  ? 'bg-rose-600 text-white'
                  : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-white/[0.06]'
              }`}
              title="Listen to concise guidance"
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </>
              )}
            </button>
          </div>

          {/* Response Visual Text */}
          <div className="space-y-2">
            <p
              className={`leading-relaxed whitespace-pre-line ${
                isEmergency
                  ? 'text-base sm:text-lg font-medium text-white'
                  : 'text-sm sm:text-base text-zinc-200'
              }`}
            >
              {visualText}
            </p>

            {/* Emergency specific direct instructions */}
            {isEmergency && immediateGuidanceText && (
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                {immediateGuidanceText}
              </p>
            )}
          </div>

          {/* Emergency Action Buttons */}
          {isEmergency && (
            <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-3 border-t border-white/[0.06]">
              {/* Call Emergency Number (Country-Aware) */}
              <a
                href={`tel:${emergencyNum}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-950/40 transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>CALL {emergencyNum} NOW</span>
              </a>

              {/* Call 108 Ambulance (verified for India) */}
              {country.countryCode === 'IN' && (
                <a
                  href="tel:108"
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs sm:text-sm border border-white/10 transition-colors"
                >
                  <Ambulance className="w-4 h-4 text-amber-400" />
                  <span>108 Ambulance</span>
                </a>
              )}

              {/* Share Location */}
              <button
                onClick={() => onShareLocation(topFacilities[0])}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm border border-white/10 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Share Location</span>
              </button>
            </div>
          )}

          {/* Normal Care Header Prompt */}
          {!isEmergency && (
            <div className="pt-2 text-xs font-medium flex items-center gap-1 text-zinc-400">
              <span>{actionPromptText}</span>
            </div>
          )}

          {/* 3. Automatic Relevant Facility Results (Never requires extra clicks) */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300 tracking-wide uppercase text-[11px]">
                {isEmergency ? 'Nearby Emergency Care' : 'Relevant Options Near You'}
              </span>
              {isLoadingFacilities ? (
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                  <span>Querying live facilities...</span>
                </div>
              ) : (
                <span className="text-[11px] text-zinc-500">
                  {topFacilities.length} {isEmergency ? 'emergency facilities' : 'providers'} near {userLocation.label}
                </span>
              )}
            </div>

            {topFacilities.length === 0 && !isLoadingFacilities ? (
              <div className="p-4 rounded-xl bg-zinc-900/40 text-center text-xs text-zinc-400 border border-white/[0.05]">
                <p>No immediate facilities found within local radius (~50 km).</p>
                {isEmergency && (
                  <a href={`tel:${emergencyNum}`} className="text-rose-400 font-semibold underline mt-1 inline-block">
                    Dial {emergencyNum} for emergency dispatch
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {topFacilities.map((facility) => (
                  <CompactFacilityCard
                    key={facility.id}
                    facility={facility}
                    language={activeLang}
                    isEmergency={isEmergency}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
