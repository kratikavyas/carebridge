'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ConversationTurn, Facility, Language, UserLocation, SessionContext } from '../types';
import { processConversationTurn } from '../services/conversationContext';
import { detectCountryFromLocation } from '../services/countryService';
import {
  findNearbyFacilities,
  fallbackCuratedFacilities,
  calculateDistanceKm,
  estimateDriveTimeMinutes,
  MAX_EMERGENCY_DISTANCE_KM,
  MAX_NORMAL_DISTANCE_KM,
  calculateEmergencyRelevance,
  calculateNormalRelevance,
  isExplicitly24x7,
} from '../services/facilityService';
import { DEFAULT_LOCATION, getLiveBrowserLocation } from '../services/locationService';
import { shareEmergencyLocation } from '../services/shareService';
import { Header } from '../components/Header';
import { ConversationalInput } from '../components/ConversationalInput';
import { ConversationalMessageTurn } from '../components/ConversationalMessageTurn';
import { LocationModal } from '../components/LocationModal';
import {
  HeartPulse,
  Sparkles,
  Stethoscope,
  Pill,
  Droplet,
  TestTubes,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const sessionContextRef = useRef<SessionContext | null>(null);
  sessionContextRef.current = sessionContext;
  const [isProcessing, setIsProcessing] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const country = useMemo(() => detectCountryFromLocation(userLocation), [userLocation]);

  // Auto-detect browser GPS on mount
  useEffect(() => {
    getLiveBrowserLocation()
      .then((loc) => {
        setUserLocation(loc);
      })
      .catch(() => {
        // Quiet fallback to default location without friction
      });
  }, []);

  // Scroll to bottom when new turns appear
  useEffect(() => {
    if (turns.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [turns]);

  // Core handler: User sends text or voice input
  const handleSendMessage = useCallback(
    async (queryText: string) => {
      const trimmed = queryText.trim();
      if (!trimmed) return;

      setIsProcessing(true);
      const { triage, updatedContext, escalationState } = processConversationTurn(
        trimmed,
        sessionContextRef.current,
        userLocation,
        language
      );
      sessionContextRef.current = updatedContext;
      setSessionContext(updatedContext);

      const isEmergency = triage.urgencyLevel === 'CRITICAL' || triage.urgencyLevel === 'URGENT';

      const turnId = `turn-${Date.now()}`;
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Create turn with initial loading state
      const newTurn: ConversationTurn = {
        id: turnId,
        query: trimmed,
        timestamp: timeString,
        triage,
        facilities: [],
        isLoadingFacilities: true,
        language,
        escalationState,
      };

      setTurns((prev) => [...prev, newTurn]);

      const requestedLimit =
        updatedContext.requestedLimit ||
        (isEmergency ? (escalationState === 'facility_unreachable' ? 5 : 3) : 4);

      try {
        // Query live OpenStreetMap Overpass facilities with fallback
        const results = await findNearbyFacilities(userLocation, triage.recommendedFacilityType, {
          mode: isEmergency ? 'emergency' : 'normal',
          limit: requestedLimit,
        });

        // Strict specialty filtering: in normal care mode, NEVER pad with unrelated specialties
        let matchedFacilities = results;
        if (!isEmergency && triage.recommendedFacilityType) {
          matchedFacilities = results.filter((f) => f.type === triage.recommendedFacilityType);
        }

        // If no results match the requested specialty from live search, use curated fallback strictly filtered by specialty and local distance
        if (matchedFacilities.length === 0) {
          const maxAllowedDistance = isEmergency ? MAX_EMERGENCY_DISTANCE_KM : MAX_NORMAL_DISTANCE_KM;
          const fallbackMatches = fallbackCuratedFacilities
            .filter((f) => {
              if (isEmergency) return f.category === 'emergency';
              if (triage.recommendedFacilityType) {
                return f.type === triage.recommendedFacilityType;
              }
              return true;
            })
            .map((f) => {
              const distanceKm = calculateDistanceKm(
                userLocation.lat,
                userLocation.lng,
                f.coordinates.lat,
                f.coordinates.lng
              );
              return {
                ...f,
                distanceKm,
                etaMinutes: estimateDriveTimeMinutes(distanceKm),
              };
            })
            // STRICT DISTANCE GUARDRAIL: Never show a facility hundreds of kilometres away
            .filter((f) => f.distanceKm <= maxAllowedDistance);

          if (isEmergency) {
            fallbackMatches.sort((a, b) => calculateEmergencyRelevance(b) - calculateEmergencyRelevance(a));
          } else {
            fallbackMatches.sort(
              (a, b) =>
                calculateNormalRelevance(b, triage.recommendedFacilityType) -
                calculateNormalRelevance(a, triage.recommendedFacilityType)
            );
          }

          matchedFacilities = fallbackMatches.slice(0, requestedLimit);
        } else {
          matchedFacilities = matchedFacilities.slice(0, requestedLimit);
        }

        // If filterOpenNow is requested, prioritize open and verified 24/7 facilities
        if (updatedContext.filterOpenNow) {
          matchedFacilities.sort((a, b) => {
            const aOpen =
              (a.emergency24x7 && isExplicitly24x7(a.openHours)) ||
              (a.openHours && a.openHours !== 'Hours unavailable' && !a.openHours.toLowerCase().includes('closed'));
            const bOpen =
              (b.emergency24x7 && isExplicitly24x7(b.openHours)) ||
              (b.openHours && b.openHours !== 'Hours unavailable' && !b.openHours.toLowerCase().includes('closed'));
            if (aOpen && !bOpen) return -1;
            if (!aOpen && bOpen) return 1;
            return 0;
          });
        }

        setTurns((prev) =>
          prev.map((t) =>
            t.id === turnId
              ? {
                  ...t,
                  facilities: matchedFacilities,
                  isLoadingFacilities: false,
                }
              : t
          )
        );
      } catch (err) {
        // Graceful fallback with strict specialty filtering
        const fallbackMatches = fallbackCuratedFacilities
          .filter((f) => {
            if (isEmergency) return f.category === 'emergency';
            if (triage.recommendedFacilityType) {
              return f.type === triage.recommendedFacilityType;
            }
            return true;
          })
          .map((f) => {
            const distanceKm = calculateDistanceKm(
              userLocation.lat,
              userLocation.lng,
              f.coordinates.lat,
              f.coordinates.lng
            );
            return {
              ...f,
              distanceKm,
              etaMinutes: estimateDriveTimeMinutes(distanceKm),
            };
          })
          .slice(0, requestedLimit);

        setTurns((prev) =>
          prev.map((t) =>
            t.id === turnId
              ? {
                  ...t,
                  facilities: fallbackMatches,
                  isLoadingFacilities: false,
                }
              : t
          )
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [userLocation, language]
  );

  // Trigger emergency from header button
  const handleTriggerEmergency = () => {
    handleSendMessage('Emergency assistance needed, patient requires urgent care');
  };

  // Reset to clean home
  const handleResetHome = () => {
    setTurns([]);
    sessionContextRef.current = null;
    setSessionContext(null);
  };

  // Share location & condition
  const handleShareLocation = async (facility?: Facility) => {
    const lastTurn = turns[turns.length - 1];
    const condition = lastTurn ? lastTurn.query : 'Medical Emergency';
    await shareEmergencyLocation(userLocation, condition, facility);
  };

  // Editorial example suggestions
  const examplePrompts: Record<Language, string[]> = {
    en: [
      'Who should I see for a skin rash?',
      'Find a pharmacy near me',
      'I need a blood bank',
      'My chest hurts',
    ],
    hi: [
      'त्वचा पर रैश के लिए किस डॉक्टर से मिलें?',
      'मेरे पास 24 घंटे का मेडिकल स्टोर खोजें',
      'मुझे ब्लड बैंक की जरूरत है',
      'मेरे सीने में दर्द हो रहा है',
    ],
    hinglish: [
      'Skin rash ke liye kis doctor ko consult karein?',
      'Pass me 24/7 medical store dhoondhein',
      'Mujhe blood bank chahiye',
      'Mere chest me pain ho raha hai',
    ],
    bn: [
      'ত্বকে র‍্যাশের জন্য কোন ডাক্তার দেখানো উচিত?',
      'কাছের ওষুধের দোকান খুঁজুন',
      'আমার ব্লাড ব্যাংক প্রয়োজন',
      'আমার বুকে ব্যথা করছে',
    ],
    zh: [
      '皮肤起了红疹看什么科？',
      '查找附近的24小时药房',
      '我需要附近的血库',
      '我突发严重胸痛',
    ],
    es: [
      '¿A quién debo acudir por una erupción cutánea?',
      'Buscar una farmacia 24h cercana',
      'Necesito un banco de sangre',
      'Me duele mucho el pecho',
    ],
    fr: [
      'Qui consulter pour une éruption cutanée ?',
      'Trouver une pharmacie de garde',
      'J\'ai besoin d\'une banque de sang',
      'J\'ai une vive douleur à la poitrine',
    ],
    pt: [
      'Quem devo procurar para erupção na pele?',
      'Encontrar farmácia 24h próxima',
      'Preciso de um banco de sangue',
      'Estou com forte dor no peito',
    ],
    ar: [
      'ما الطبيب المناسب لطفح جلدي؟',
      'ابحث عن صيدلية 24 ساعة قريبة',
      'أحتاج إلى بنك دم قريب',
      'أعاني من ألم حاد في صدري',
    ],
  };

  const greetings: Record<Language, { title: string; subtitle: string }> = {
    en: {
      title: 'How can we help?',
      subtitle: "Tell CareBridge what's going on. We'll help you take the next right step.",
    },
    hi: {
      title: 'हम आपकी क्या मदद कर सकते हैं?',
      subtitle: 'बताएं कि क्या हुआ है। हम आपको अगला सही कदम उठाने में मदद करेंगे।',
    },
    hinglish: {
      title: 'How can CareBridge help you?',
      subtitle: 'Tell CareBridge kya problem hai. We will help you take the next right step.',
    },
    bn: {
      title: 'কীভাবে সাহায্য করতে পারি?',
      subtitle: 'কী সমস্যা হচ্ছে বলুন। আমরা আপনাকে সঠিক পদক্ষেপ নিতে সহায়তা করব।',
    },
    zh: {
      title: '需要什么医疗帮助？',
      subtitle: '请描述当前的情况。CareBridge 会指引您采取正确的下一步。',
    },
    es: {
      title: '¿En qué podemos ayudarle?',
      subtitle: 'Díganos qué sucede. Le guiaremos para dar el siguiente paso correcto.',
    },
    fr: {
      title: 'Comment pouvons-nous vous aider ?',
      subtitle: 'Décrivez la situation. Nous vous aiderons à prendre la bonne décision.',
    },
    pt: {
      title: 'Como podemos ajudar?',
      subtitle: 'Conte o que está acontecendo. Vamos ajudar você a dar o próximo passo certo.',
    },
    ar: {
      title: 'كيف يمكننا مساعدتك؟',
      subtitle: 'أخبرنا بما يحدث معك. سنرشدك لاتخاذ الخطوة الصحيحة التالية فوراً.',
    },
  };

  const secondaryCategories = [
    { label: 'Find a doctor', query: 'Find a general physician or clinic near me', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { label: 'Pharmacy', query: 'Find a 24/7 pharmacy near me', icon: <Pill className="w-3.5 h-3.5" /> },
    { label: 'Blood bank', query: 'I need a blood bank near me', icon: <Droplet className="w-3.5 h-3.5" /> },
    { label: 'Diagnostic lab', query: 'Find a diagnostic lab for blood test near me', icon: <TestTubes className="w-3.5 h-3.5" /> },
  ];

  const activeExamples = examplePrompts[language] || examplePrompts.en;
  const activeGreeting = greetings[language] || greetings.en;

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-zinc-100 selection:bg-rose-600 selection:text-white">
      {/* 1. Quiet, Refined Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        userLocation={userLocation}
        country={country}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onTriggerEmergency={handleTriggerEmergency}
        onResetHome={handleResetHome}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-between">
        {/* VIEW A: HOME / DEFAULT STATE (When no messages yet) */}
        {turns.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 my-auto py-10 animate-in fade-in duration-300">
            {/* Editorial Greeting */}
            <div className="space-y-3 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/[0.08] text-zinc-400 text-xs font-medium">
                <Sparkles className="w-3 h-3 text-zinc-300" />
                <span>Conversational Healthcare Navigator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-100">
                {activeGreeting.title}
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed">
                {activeGreeting.subtitle}
              </p>
            </div>

            {/* Large Conversational Input Box */}
            <div className="w-full">
              <ConversationalInput
                language={language}
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
                isHero={true}
              />
            </div>

            {/* Subtle Example Prompts */}
            <div className="space-y-3 w-full max-w-xl">
              <p className="text-xs text-zinc-500 font-medium">Or try an example:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {activeExamples.map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(promptText)}
                    className="px-3 py-1.5 rounded-full bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-normal border border-white/[0.07] transition-colors cursor-pointer"
                  >
                    &ldquo;{promptText}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Healthcare Suggestions */}
            <div className="pt-6 border-t border-white/[0.06] w-full max-w-xl">
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
                {secondaryCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(cat.query)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/40 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-white/[0.05] transition-colors cursor-pointer"
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW B: ACTIVE CONVERSATION THREAD */
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-2 pb-24">
              {/* Reset / New conversation button */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs text-zinc-500 font-medium">
                  {turns.length} {turns.length === 1 ? 'exchange' : 'exchanges'}
                </span>
                <button
                  onClick={handleResetHome}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Start fresh</span>
                </button>
              </div>

              {/* Message Turns */}
              {turns.map((turn) => (
                <ConversationalMessageTurn
                  key={turn.id}
                  turn={turn}
                  language={language}
                  userLocation={userLocation}
                  country={country}
                  onShareLocation={handleShareLocation}
                />
              ))}

              <div ref={chatBottomRef} />
            </div>

            {/* Fixed / Docked Bottom Input for Continuous Dialogue */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#08090d]/95 backdrop-blur-md border-t border-white/[0.07] z-30">
              <div className="max-w-3xl mx-auto">
                <ConversationalInput
                  language={language}
                  onSendMessage={handleSendMessage}
                  isProcessing={isProcessing}
                  isHero={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quiet Non-Diagnostic Safety Footer */}
        <div className="pt-6 pb-2 text-center text-[11px] text-zinc-500 max-w-xl mx-auto leading-relaxed">
          <p>
            CareBridge is a healthcare navigation assistant, not a medical doctor. It does not diagnose or replace professional medical advice. For immediate life-threatening situations, dial <a href={`tel:${country.emergencyNumber}`} className="text-rose-400 font-semibold underline">{country.emergencyNumber}</a>.
          </p>
        </div>
      </main>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={userLocation}
        onSelectLocation={setUserLocation}
      />
    </div>
  );
}
