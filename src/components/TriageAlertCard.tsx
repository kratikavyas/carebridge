'use client';

import React, { useState, useEffect } from 'react';
import { Language, TriageResult, AppMode } from '../types';
import { translations } from '../i18n/translations';
import { speakText, stopSpeaking } from '../services/speechService';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Volume2,
  Square,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';

interface TriageAlertCardProps {
  triageResult: TriageResult;
  language: Language;
  onSwitchToNormalMode: () => void;
}

export const TriageAlertCard: React.FC<TriageAlertCardProps> = ({
  triageResult,
  language,
  onSwitchToNormalMode,
}) => {
  const t = translations[language];
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Stop audio if component unmounts or language changes
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [language]);

  const activeGuidance =
    triageResult.immediateGuidance[language] || triageResult.immediateGuidance.en;
  const activeDoNots =
    triageResult.doNots[language] || triageResult.doNots.en;

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const fullSpeech = `${activeGuidance}. ${activeDoNots}`;
      setIsPlayingAudio(true);
      speakText(
        fullSpeech,
        language,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const isCritical = triageResult.urgencyLevel === 'CRITICAL';
  const isUrgent = triageResult.urgencyLevel === 'URGENT';
  const isRoutine = triageResult.urgencyLevel === 'ROUTINE';

  return (
    <div
      className={`w-full rounded-2xl border-2 p-4 sm:p-6 shadow-2xl transition-all ${
        isCritical
          ? 'bg-rose-950/40 border-rose-600/80 shadow-rose-950/40'
          : isUrgent
          ? 'bg-amber-950/40 border-amber-500/80 shadow-amber-950/40'
          : 'bg-teal-950/40 border-teal-500/80 shadow-teal-950/40'
      }`}
    >
      {/* Header: Urgency Banner & Voice Guidance Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          {isCritical ? (
            <div className="p-2 rounded-xl bg-rose-600 text-white animate-pulse">
              <AlertOctagon className="w-6 h-6" />
            </div>
          ) : isUrgent ? (
            <div className="p-2 rounded-xl bg-amber-500 text-black">
              <AlertTriangle className="w-6 h-6" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-teal-500 text-black">
              <Info className="w-6 h-6" />
            </div>
          )}
          <div>
            <div
              className={`text-xs sm:text-sm font-black tracking-wider uppercase ${
                isCritical
                  ? 'text-rose-400'
                  : isUrgent
                  ? 'text-amber-400'
                  : 'text-teal-400'
              }`}
            >
              {isCritical
                ? t.criticalUrgencyBadge
                : isUrgent
                ? t.urgentBadge
                : t.routineBadge}
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Category: <span className="text-white font-bold">{triageResult.detectedCategory}</span>
            </p>
          </div>
        </div>

        {/* Listen Voice Guidance Button */}
        <button
          type="button"
          onClick={handleToggleAudio}
          className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-rose-600 text-white border-rose-400 shadow-md animate-pulse'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700'
          }`}
          title="Speak guidance instructions in your language"
        >
          {isPlayingAudio ? (
            <>
              <Square className="w-4 h-4 fill-white" />
              <span>{t.stopAudio}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-rose-400" />
              <span>{t.readAloud}</span>
            </>
          )}
        </button>
      </div>

      {/* Non-Diagnostic Guidance Steps */}
      <div className="mt-4 space-y-3">
        {/* DO THIS NOW */}
        <div className="bg-slate-950/70 rounded-xl p-3.5 border border-white/5">
          <div className="flex items-center gap-2 text-xs font-black tracking-wide text-emerald-400 mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.doThisNow}</span>
          </div>
          <p className="text-sm sm:text-base text-slate-100 font-semibold leading-relaxed">
            {activeGuidance}
          </p>
        </div>

        {/* DO NOT DO THIS */}
        <div className="bg-slate-950/70 rounded-xl p-3.5 border border-white/5">
          <div className="flex items-center gap-2 text-xs font-black tracking-wide text-rose-400 mb-1.5">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{t.doNotDoThis}</span>
          </div>
          <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
            {activeDoNots}
          </p>
        </div>
      </div>

      {/* Switch to Normal Mode Suggestion if routine */}
      {triageResult.suggestSwitchToNormal && (
        <div className="mt-4 p-3 rounded-xl bg-teal-950/60 border border-teal-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-teal-200 font-medium">
            {t.switchToNormalModeSuggestion}
          </p>
          <button
            type="button"
            onClick={onSwitchToNormalMode}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shrink-0 shadow-sm transition-all"
          >
            <span>{t.switchToNormalBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
