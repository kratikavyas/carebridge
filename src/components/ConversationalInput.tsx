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
        className={`relative flex items-center bg-white rounded-2xl border transition-all ${
          isListening
            ? 'border-rose-500 ring-4 ring-rose-500/15 shadow-xl shadow-rose-100'
            : 'border-zinc-200/90 hover:border-zinc-300 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-600/10 shadow-xl shadow-zinc-200/40'
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
              : 'Tell us what’s happening...'
          }
          className={`w-full bg-transparent text-zinc-900 placeholder-zinc-400 focus:outline-none px-3.5 sm:px-4 py-2 text-sm sm:text-base font-normal ${
            isListening ? 'animate-pulse text-rose-600' : ''
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
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200 scale-105'
                : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
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
                ? 'bg-zinc-900 hover:bg-teal-700 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
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
