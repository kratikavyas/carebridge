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
  ArrowRight,
  MapPin,
  AlertTriangle,
  Activity,
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

  const homeContent: Record<
    Language,
    {
      heroLine1: string;
      heroLine2: string;
      heroSub: string;
      locationPrefix: string;
      changeLocation: string;
      emergencyTitle: string;
      emergencySub: string;
      emergencySymptomsTitle: string;
      symptomUnconscious: string;
      symptomChestPain: string;
      symptomBreathing: string;
      symptomBleeding: string;
      normalTitle: string;
      normalSub: string;
      quickAccessDoctor: string;
      quickAccessPharmacy: string;
      quickAccessBloodBank: string;
      quickAccessDiagnostics: string;
      orDescribe: string;
    }
  > = {
    en: {
      heroLine1: "CareBridge doesn't give you more information.",
      heroLine2: 'It gives you the next right action.',
      heroSub: "When something goes wrong, you shouldn't have to know what to search for.",
      locationPrefix: 'Active triage location:',
      changeLocation: 'Change',
      emergencyTitle: '🚨 I NEED HELP NOW',
      emergencySub: 'Something is wrong and I need the next step.',
      emergencySymptomsTitle: 'Immediate Emergency Triage — tap if any apply:',
      symptomUnconscious: 'Someone is unconscious',
      symptomChestPain: 'Severe chest pain',
      symptomBreathing: 'Trouble breathing',
      symptomBleeding: 'Someone is bleeding badly',
      normalTitle: 'Routine or Planned Care',
      normalSub: 'Find nearby doctors, pharmacies, blood banks, or lab tests.',
      quickAccessDoctor: 'Doctor',
      quickAccessPharmacy: 'Pharmacy',
      quickAccessBloodBank: 'Blood Bank',
      quickAccessDiagnostics: 'Diagnostics',
      orDescribe: 'Or describe your situation in your own words:',
    },
    hi: {
      heroLine1: 'केयरब्रिज सिर्फ जानकारी नहीं देता।',
      heroLine2: 'यह आपको अगला सही कदम बताता है।',
      heroSub: 'जब कोई आपात स्थिति हो, तो आपको सोचने की ज़रूरत नहीं कि क्या खोजना है।',
      locationPrefix: 'सक्रिय स्थान:',
      changeLocation: 'बदलें',
      emergencyTitle: '🚨 मुझे अभी आपातकालीन मदद चाहिए',
      emergencySub: 'स्थिति गंभीर है और मुझे अगला कदम चाहिए।',
      emergencySymptomsTitle: 'त्वरित आपातकालीन लक्षण:',
      symptomUnconscious: 'कोई बेहोश / अचेत है',
      symptomChestPain: 'सीने में गंभीर दर्द',
      symptomBreathing: 'सांस लेने में भारी तकलीफ',
      symptomBleeding: 'गंभीर रक्तस्राव जो रुक नहीं रहा',
      normalTitle: 'सामान्य या नियोजित स्वास्थ्य सेवा',
      normalSub: 'नजदीकी डॉक्टर, फार्मेसी, ब्लड बैंक या लैब खोजें।',
      quickAccessDoctor: 'डॉक्टर',
      quickAccessPharmacy: 'फार्मेसी',
      quickAccessBloodBank: 'ब्लड बैंक',
      quickAccessDiagnostics: 'जांच केंद्र',
      orDescribe: 'या अपनी समस्या अपने शब्दों में बताएं:',
    },
    hinglish: {
      heroLine1: "CareBridge doesn't give you more information.",
      heroLine2: 'It gives you the next right action.',
      heroSub: "Jab emergency ho, you shouldn't have to figure out what to search.",
      locationPrefix: 'Active triage location:',
      changeLocation: 'Change',
      emergencyTitle: '🚨 I NEED HELP NOW',
      emergencySub: 'Kuch emergency hai aur mujhe agla step chahiye.',
      emergencySymptomsTitle: 'Immediate Emergency Symptoms:',
      symptomUnconscious: 'Someone is unconscious',
      symptomChestPain: 'Severe chest pain',
      symptomBreathing: 'Trouble breathing',
      symptomBleeding: 'Someone is bleeding badly',
      normalTitle: 'Routine or Planned Care',
      normalSub: 'Pass ke doctors, pharmacies, blood banks ya lab tests khojein.',
      quickAccessDoctor: 'Doctor',
      quickAccessPharmacy: 'Pharmacy',
      quickAccessBloodBank: 'Blood Bank',
      quickAccessDiagnostics: 'Diagnostics',
      orDescribe: 'Ya apni problem yahan likhein ya bolein:',
    },
    bn: {
      heroLine1: 'কেয়ারব্রিজ কেবল অতিরিক্ত তথ্য দেয় না।',
      heroLine2: 'এটি আপনার পরবর্তী সঠিক পদক্ষেপ নির্ধারণ করে।',
      heroSub: 'জরুরি পরিস্থিতিতে কী খুঁজতে হবে তা নিয়ে ভাবতে হবে না।',
      locationPrefix: 'বর্তমান অবস্থান:',
      changeLocation: 'পরিবর্তন',
      emergencyTitle: '🚨 আমার এখনই সাহায্য প্রয়োজন',
      emergencySub: 'পরিস্থিতি গুরুতর এবং পরবর্তী পদক্ষেপ প্রয়োজন।',
      emergencySymptomsTitle: 'জরুরি লক্ষণসমূহ:',
      symptomUnconscious: 'কেউ অচেতন বা জ্ঞানহীন',
      symptomChestPain: 'বুকে প্রচণ্ড ব্যথা',
      symptomBreathing: 'শ্বাসকষ্ট হচ্ছে',
      symptomBleeding: 'প্রচণ্ড রক্তপাত হচ্ছে',
      normalTitle: 'নিয়মিত চিকিৎসা সেবা',
      normalSub: 'নিকটবর্তী চিকিৎসক, ফার্মেসি, ব্লাড ব্যাংক বা ল্যাব খুঁজুন।',
      quickAccessDoctor: 'চিকিৎসক',
      quickAccessPharmacy: 'ফার্মেসি',
      quickAccessBloodBank: 'ব্লাড ব্যাংক',
      quickAccessDiagnostics: 'ল্যাব ও টেস্ট',
      orDescribe: 'অথবা আপনার সমস্যা নিজের ভাষায় জানান:',
    },
    zh: {
      heroLine1: 'CareBridge 不仅仅提供信息。',
      heroLine2: '它指引您采取下一个正确的行动。',
      heroSub: '紧急情况下，您不需要费心思考该搜索什么。',
      locationPrefix: '当前位置：',
      changeLocation: '修改',
      emergencyTitle: '🚨 我现在需要紧急帮助',
      emergencySub: '突发紧急情况，需要指引下一步行动。',
      emergencySymptomsTitle: '紧急症状直达：',
      symptomUnconscious: '人员昏迷 / 失去意识',
      symptomChestPain: '剧烈胸痛',
      symptomBreathing: '严重呼吸困难',
      symptomBleeding: '严重大出血',
      normalTitle: '日常就医及医疗服务',
      normalSub: '查找附近的医生、药房、血库或化验所。',
      quickAccessDoctor: '医生门诊',
      quickAccessPharmacy: '药房',
      quickAccessBloodBank: '血库',
      quickAccessDiagnostics: '化验检查',
      orDescribe: '或者用您自己的语言描述当前情况：',
    },
    es: {
      heroLine1: 'CareBridge no le da más información.',
      heroLine2: 'Le da la siguiente acción correcta.',
      heroSub: 'Cuando algo sale mal, no debería tener que adivinar qué buscar.',
      locationPrefix: 'Ubicación actual:',
      changeLocation: 'Cambiar',
      emergencyTitle: '🚨 NECESITO AYUDA AHORA',
      emergencySub: 'Algo ocurre y necesito el siguiente paso.',
      emergencySymptomsTitle: 'Triaje de Emergencia Inmediato:',
      symptomUnconscious: 'Persona inconsciente',
      symptomChestPain: 'Dolor severo en el pecho',
      symptomBreathing: 'Dificultad para respirar',
      symptomBleeding: 'Sangrado abundante',
      normalTitle: 'Atención Médica Rutinaria',
      normalSub: 'Encuentre médicos, farmacias, bancos de sangre o laboratorios.',
      quickAccessDoctor: 'Médico',
      quickAccessPharmacy: 'Farmacia',
      quickAccessBloodBank: 'Banco de Sangre',
      quickAccessDiagnostics: 'Laboratorio',
      orDescribe: 'O describa su situación en sus propias palabras:',
    },
    fr: {
      heroLine1: 'CareBridge ne vous donne pas plus d\'informations.',
      heroLine2: 'Elle vous indique la bonne action suivante.',
      heroSub: 'En cas d\'urgence, vous ne devriez pas avoir à chercher quoi taper.',
      locationPrefix: 'Emplacement actuel :',
      changeLocation: 'Modifier',
      emergencyTitle: '🚨 J\'AI BESOIN D\'AIDE IMMÉDIATE',
      emergencySub: 'Urgence médicale : besoin de l\'étape suivante.',
      emergencySymptomsTitle: 'Triage d\'urgence immédiat :',
      symptomUnconscious: 'Personne inconsciente',
      symptomChestPain: 'Douleur thoracique sévère',
      symptomBreathing: 'Difficultés à respirer',
      symptomBleeding: 'Saignement abondant',
      normalTitle: 'Soins Médicaux Courants',
      normalSub: 'Trouvez médecins, pharmacies, banques de sang ou analyses.',
      quickAccessDoctor: 'Médecin',
      quickAccessPharmacy: 'Pharmacie',
      quickAccessBloodBank: 'Banque de Sang',
      quickAccessDiagnostics: 'Laboratoire',
      orDescribe: 'Ou décrivez votre situation avec vos propres mots :',
    },
    pt: {
      heroLine1: 'O CareBridge não oferece excesso de informação.',
      heroLine2: 'Ele indica a próxima ação correta.',
      heroSub: 'Quando algo dá errado, você não precisa adivinhar o que pesquisar.',
      locationPrefix: 'Localização atual:',
      changeLocation: 'Alterar',
      emergencyTitle: '🚨 PRECISO DE AJUDA AGORA',
      emergencySub: 'Algo aconteceu e preciso do próximo passo.',
      emergencySymptomsTitle: 'Triagem de emergência imediata:',
      symptomUnconscious: 'Pessoa inconsciente',
      symptomChestPain: 'Dor forte no peito',
      symptomBreathing: 'Dificuldade para respirar',
      symptomBleeding: 'Sangramento intenso',
      normalTitle: 'Cuidados Médicos de Rotina',
      normalSub: 'Encontre médicos, farmácias, bancos de sangue ou exames.',
      quickAccessDoctor: 'Médico',
      quickAccessPharmacy: 'Farmácia',
      quickAccessBloodBank: 'Banco de Sangue',
      quickAccessDiagnostics: 'Laboratório',
      orDescribe: 'Ou descreva a situação em suas próprias palavras:',
    },
    ar: {
      heroLine1: 'كيربريدج لا يمنحك معلومات زائدة.',
      heroLine2: 'بل يرشدك للإجراء الصحيح التالي فوراً.',
      heroSub: 'عند حدوث طارئ، لا يجب أن تحتار فيما تبحث عنه.',
      locationPrefix: 'الموقع النشط:',
      changeLocation: 'تغيير',
      emergencyTitle: '🚨 أحتاج إلى مساعدة عاجلة الآن',
      emergencySub: 'حدث طارئ وأحتاج للخطوة التالية فوراً.',
      emergencySymptomsTitle: 'فرز طوارئ مباشر:',
      symptomUnconscious: 'شخص فاقد للوعي',
      symptomChestPain: 'ألم شديد في الصدر',
      symptomBreathing: 'صعوبة شديدة في التنفس',
      symptomBleeding: 'نزيف حاد لا يتوقف',
      normalTitle: 'الرعاية الصحية الروتينية',
      normalSub: 'ابحث عن أطباء أو صيدليات أو بنوك دم أو مختبرات قريبة.',
      quickAccessDoctor: 'طبيب',
      quickAccessPharmacy: 'صيدلية',
      quickAccessBloodBank: 'بنك الدم',
      quickAccessDiagnostics: 'مختبر تحاليل',
      orDescribe: 'أو صِف حالتك بكلماتك الخاصة:',
    },
  };

  const activeExamples = examplePrompts[language] || examplePrompts.en;
  const activeHome = homeContent[language] || homeContent.en;

  return (
    <div className="min-h-screen flex flex-col bg-[#090B10] text-zinc-100 selection:bg-rose-600 selection:text-white">
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
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-between">
        {/* VIEW A: HOME / DEFAULT STATE (When no messages yet) */}
        {turns.length === 0 ? (
          <div className="flex-1 flex flex-col space-y-6 my-auto py-4 sm:py-6 animate-in fade-in duration-300">
            {/* 1. Brand Title & Subtitle */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/[0.08] text-zinc-400 text-xs font-medium">
                <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
                <span>Healthcare Navigation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                {activeHome.heroLine1}{' '}
                <span className="text-teal-400">{activeHome.heroLine2}</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
                {activeHome.heroSub}
              </p>
            </div>

            {/* 2. Location Status Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/[0.08] text-xs text-zinc-300 shadow-xs">
              <div className="flex items-center gap-2 truncate">
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${userLocation.isLive ? 'text-teal-400' : 'text-zinc-400'}`} />
                <span className="truncate">
                  {activeHome.locationPrefix} <strong className="font-semibold text-zinc-100">{userLocation.label}</strong>
                </span>
                {userLocation.isLive && (
                  <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[10px] bg-teal-950/90 text-teal-300 border border-teal-800/60 font-medium shrink-0">
                    GPS Live
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer shrink-0 ml-3 underline underline-offset-2 transition-colors"
              >
                {activeHome.changeLocation}
              </button>
            </div>

            {/* 3. PRIMARY ENTRY POINT: Emergency CTA Card */}
            <div className="rounded-2xl bg-gradient-to-b from-[#1c080b] to-[#120507] border-2 border-rose-600/70 p-5 sm:p-6 shadow-xl shadow-rose-950/30 space-y-4">
              <button
                type="button"
                onClick={() => handleSendMessage('I need emergency medical help right now')}
                className="w-full group flex items-center justify-between p-4 sm:p-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-950/50 cursor-pointer text-left"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black tracking-wide">
                      {activeHome.emergencyTitle}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-100 font-medium">
                    {activeHome.emergencySub}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </button>

              {/* Direct Emergency Symptoms Triage */}
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  {activeHome.emergencySymptomsTitle}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendMessage('Someone is unconscious')}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/90 hover:bg-rose-950/40 text-zinc-200 hover:text-white border border-white/10 hover:border-rose-500/50 text-xs font-semibold transition-all cursor-pointer text-left"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">{activeHome.symptomUnconscious}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('Severe chest pain')}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/90 hover:bg-rose-950/40 text-zinc-200 hover:text-white border border-white/10 hover:border-rose-500/50 text-xs font-semibold transition-all cursor-pointer text-left"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">{activeHome.symptomChestPain}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('Someone is having trouble breathing')}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/90 hover:bg-rose-950/40 text-zinc-200 hover:text-white border border-white/10 hover:border-rose-500/50 text-xs font-semibold transition-all cursor-pointer text-left"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">{activeHome.symptomBreathing}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage('Someone is bleeding badly')}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/90 hover:bg-rose-950/40 text-zinc-200 hover:text-white border border-white/10 hover:border-rose-500/50 text-xs font-semibold transition-all cursor-pointer text-left"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">{activeHome.symptomBleeding}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. SECONDARY PATH: Normal Healthcare CTA Card */}
            <div className="rounded-2xl bg-zinc-900/70 border border-white/10 p-5 sm:p-6 space-y-3.5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                  {activeHome.normalTitle}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                  {activeHome.normalSub}
                </p>
              </div>

              {/* Quick Access Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSendMessage('Find a general physician or clinic near me')}
                  className="flex flex-col items-center sm:items-start p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.06] hover:border-teal-500/40 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-teal-400 mb-2 group-hover:border-teal-500/40">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">{activeHome.quickAccessDoctor}</span>
                  <span className="text-[10px] text-zinc-500 hidden sm:block mt-0.5">General clinics</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('Find a 24/7 pharmacy near me')}
                  className="flex flex-col items-center sm:items-start p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.06] hover:border-teal-500/40 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-400 mb-2 group-hover:border-teal-500/40">
                    <Pill className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">{activeHome.quickAccessPharmacy}</span>
                  <span className="text-[10px] text-zinc-500 hidden sm:block mt-0.5">24/7 medicines</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('I need a blood bank near me')}
                  className="flex flex-col items-center sm:items-start p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.06] hover:border-teal-500/40 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-rose-400 mb-2 group-hover:border-teal-500/40">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">{activeHome.quickAccessBloodBank}</span>
                  <span className="text-[10px] text-zinc-500 hidden sm:block mt-0.5">Blood donors</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('Find a diagnostic lab for blood test near me')}
                  className="flex flex-col items-center sm:items-start p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.06] hover:border-teal-500/40 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-amber-400 mb-2 group-hover:border-teal-500/40">
                    <TestTubes className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">{activeHome.quickAccessDiagnostics}</span>
                  <span className="text-[10px] text-zinc-500 hidden sm:block mt-0.5">Labs & scans</span>
                </button>
              </div>
            </div>

            {/* 5. Conversational Input as Secondary Interaction */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span>{activeHome.orDescribe}</span>
              </div>

              <ConversationalInput
                language={language}
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
                isHero={false}
              />

              {/* Subtle Example Prompts */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-zinc-500">Examples:</span>
                {activeExamples.map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(promptText)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] border border-white/[0.06] transition-colors cursor-pointer"
                  >
                    &ldquo;{promptText}&rdquo;
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
