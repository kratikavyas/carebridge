import { Language } from '../types';

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindow;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

const LANGUAGE_LOCALE_MAP: Record<Language, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  hinglish: 'hi-IN',
  zh: 'zh-CN',
  es: 'es-ES',
  ar: 'ar-SA',
  fr: 'fr-FR',
  pt: 'pt-BR',
  bn: 'bn-IN',
};

export function createSpeechRecognizer(
  language: Language,
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
) {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as IWindow;
  const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    onError('Speech recognition is not supported in this browser.');
    return null;
  }

  const recognizer = new SpeechRecognitionClass();
  recognizer.continuous = false;
  recognizer.interimResults = true;
  recognizer.lang = LANGUAGE_LOCALE_MAP[language] || 'en-US';

  recognizer.onresult = (event: any) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    const current = final || interim;
    if (current) {
      onResult(current);
    }
  };

  recognizer.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    onError(event.error || 'Speech recognition error');
  };

  recognizer.onend = () => {
    onEnd();
  };

  return recognizer;
}

export function speakText(
  text: string,
  language: Language,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for emergency comprehension
    utterance.pitch = 1.0;
    utterance.lang = LANGUAGE_LOCALE_MAP[language] || 'en-US';

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const targetPrefix = utterance.lang.toLowerCase().split('-')[0];
      const matchedVoice = voices.find((v) =>
        v.lang.toLowerCase().replace('_', '-').startsWith(targetPrefix)
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error or aborted:', e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Browser TTS unavailable:', err);
    if (onEnd) onEnd();
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
