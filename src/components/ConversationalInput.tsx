'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from '../services/speechService';
import { Mic, MicOff, ArrowUp, Loader2 } from 'lucide-react';

interface ConversationalInputProps {
  language: Language;
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
  isHero?: boolean;
}

export const ConversationalInput: React.FC<ConversationalInputProps> = ({
  language,
  onSendMessage,
  isProcessing = false,
  isHero = false,
}) => {
  const t = translations[language];
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognizerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVoiceSupported(isSpeechRecognitionSupported());
  }, []);

  const handleStartListening = () => {
    if (!voiceSupported) return;

    try {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }

      const recognizer = createSpeechRecognizer(
        language,
        (transcript) => {
          setText(transcript);
          setIsListening(false);
          if (transcript.trim()) {
            onSendMessage(transcript);
            setText('');
          }
        },
        (error) => {
          console.warn('Speech error:', error);
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
    } catch (err) {
      console.warn('Mic access failed:', err);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isProcessing) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full transition-all ${
        isHero ? 'max-w-2xl mx-auto' : 'max-w-3xl mx-auto'
      }`}
    >
      <div
        className={`relative flex items-center bg-zinc-900/90 rounded-2xl border transition-all ${
          isListening
            ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/40'
            : 'border-white/10 hover:border-white/20 focus-within:border-teal-500/80 focus-within:ring-2 focus-within:ring-teal-500/20 shadow-lg shadow-black/30'
        } ${isHero ? 'p-2 sm:p-2.5' : 'p-1.5 sm:p-2'}`}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            isListening
              ? t.listening
              : language === 'hi'
              ? 'केयरब्रिज को बताएं कि क्या हुआ है...'
              : language === 'bn'
              ? 'কেয়ারব্রিজকে বলুন কী সমস্যা হচ্ছে...'
              : language === 'hinglish'
              ? 'Tell CareBridge kya problem hai...'
              : 'Tell us what’s happening or ask a question...'
          }
          className={`w-full bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none px-3.5 sm:px-4 py-2 text-sm sm:text-base font-normal ${
            isListening ? 'animate-pulse text-rose-300' : ''
          }`}
          disabled={isProcessing}
        />

        {/* Action icons: Microphone + Send */}
        <div className="flex items-center gap-1.5 shrink-0 pr-1">
          {/* Microphone */}
          <button
            type="button"
            onClick={isListening ? handleStopListening : handleStartListening}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50 scale-105'
                : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title={isListening ? 'Stop listening' : 'Speak with microphone'}
            aria-label="Voice input"
          >
            {isListening ? (
              <MicOff className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            ) : (
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Send */}
          <button
            type="submit"
            disabled={!text.trim() || isProcessing}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${
              text.trim() && !isProcessing
                ? 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm'
                : 'bg-zinc-800/60 text-zinc-600 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
