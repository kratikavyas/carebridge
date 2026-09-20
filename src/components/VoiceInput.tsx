'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations, samplePrompts } from '../i18n/translations';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from '../services/speechService';
import { Mic, MicOff, Send, Volume2, Sparkles, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  language: Language;
  inputText: string;
  onInputChange: (text: string) => void;
  onSubmit: (text: string) => void;
  isProcessing?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  language,
  inputText,
  onInputChange,
  onSubmit,
  isProcessing = false,
}) => {
  const t = translations[language];
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    setVoiceSupported(isSpeechRecognitionSupported());
  }, []);

  const startListening = () => {
    setSpeechError(null);
    if (!voiceSupported) {
      setSpeechError('Speech recognition is not supported in this browser. Please use the text input below.');
      return;
    }

    try {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }

      const recognizer = createSpeechRecognizer(
        language,
        (transcript) => {
          onInputChange(transcript);
          onSubmit(transcript);
        },
        (error) => {
          setSpeechError(`Voice Error: ${error}`);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
      }
    } catch (err: any) {
      setSpeechError('Could not access microphone. Please check browser permissions.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSubmit(inputText);
    }
  };

  const handleChipClick = (text: string) => {
    onInputChange(text);
    onSubmit(text);
  };

  const activePrompts = samplePrompts[language] || samplePrompts.en;

  return (
    <div className="w-full bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label htmlFor="emergency-input" className="text-sm sm:text-base font-bold text-slate-200 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-rose-500" />
          <span>{t.describeEmergency}</span>
        </label>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 w-fit">
          Speaking Language: <span className="text-rose-400 uppercase font-black">{language}</span>
        </span>
      </div>

      {/* Hero Voice Button */}
      <div className="flex flex-col items-center justify-center py-2 sm:py-4">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`relative group flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full transition-all cursor-pointer select-none ${
            isListening
              ? 'bg-rose-600 text-white shadow-2xl emergency-pulse scale-105'
              : 'bg-gradient-to-br from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-xl shadow-rose-950/60 hover:scale-105 active:scale-95'
          }`}
          aria-label={isListening ? t.listening : t.tapToSpeak}
        >
          {isListening ? (
            <div className="flex flex-col items-center">
              <MicOff className="w-9 h-9 sm:w-11 sm:h-11 animate-pulse" />
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-4 bg-white rounded animate-wave-1"></span>
                <span className="w-1.5 h-6 bg-white rounded animate-wave-2"></span>
                <span className="w-1.5 h-4 bg-white rounded animate-wave-3"></span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow" />
            </div>
          )}
        </button>

        <p className={`mt-3 text-sm sm:text-base font-black tracking-wide ${isListening ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
          {isListening ? t.listening : t.tapToSpeak}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Accessible for voice-first triage in English, हिन्दी, Hinglish & বাংলা
        </p>

        {speechError && (
          <div className="mt-2 text-xs text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}
      </div>

      {/* Manual Text Input & Submit Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <input
          id="emergency-input"
          type="text"
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t.typeOrSpeakPlaceholder}
          className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm sm:text-base px-4 py-3.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className="px-5 py-3.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Triage</span>
        </button>
      </form>

      {/* 1-Tap Quick Voice Scenario Chips */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.quickPromptsTitle}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {activePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(prompt.text)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-rose-950 hover:text-rose-200 hover:border-rose-700 text-slate-300 text-xs font-medium border border-slate-700/70 transition-all active:scale-95 text-left"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
