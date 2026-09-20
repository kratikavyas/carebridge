export type UrgencyLevel = 'CRITICAL' | 'URGENT' | 'ROUTINE';

export type Language = 'en' | 'hi' | 'hinglish' | 'zh' | 'es' | 'ar' | 'fr' | 'pt' | 'bn';

export type EmergencyFacilityType =
  | 'trauma_center'
  | 'icu_hospital'
  | 'emergency_clinic'
  | 'pediatric_emergency'
  | 'burn_unit';

export type NormalFacilityType =
  | 'dermatology'
  | 'gynecology'
  | 'pharmacy'
  | 'blood_bank'
  | 'general_physician'
  | 'diagnostic_center'
  | 'dental';

export type FacilityType = EmergencyFacilityType | NormalFacilityType;

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  category: 'emergency' | 'normal';
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  emergencyPhone?: string;
  emergency24x7: boolean;
  distanceKm?: number;
  etaMinutes?: number;
  rating?: number;
  reviewCount?: number;
  openHours: string;
  services: string[];
  specialties: string[];
  verified: boolean;
  bedAvailability?: {
    icu: number;
    general: number;
  };
  source?: 'osm_live' | 'curated_fallback';
  isFallback?: boolean;
  emergencyCapabilityVerified?: boolean;
  relevanceScore?: number;
}

export interface MultilingualText {
  en: string;
  hi?: string;
  hinglish?: string;
  zh?: string;
  es?: string;
  ar?: string;
  fr?: string;
  pt?: string;
  bn?: string;
  [key: string]: string | undefined;
}

export interface TriageResult {
  urgencyLevel: UrgencyLevel;
  intentCode: string; // Language-independent intent representation
  detectedCategory: string;
  detectedKeywords: string[];
  immediateGuidance: MultilingualText;
  doNots: MultilingualText;
  recommendedFacilityType: FacilityType;
  suggestSwitchToNormal: boolean;
  confidenceScore: number;
  conversationalResponse?: MultilingualText;
  spokenResponse?: MultilingualText; // Concise two-layer response specifically for TTS
  actionPrompt?: MultilingualText;
}

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
  accuracy?: number;
  isLive: boolean;
  countryCode?: string;
}

export interface CountryConfig {
  countryCode: string;
  countryName: string;
  emergencyNumber: string;
  emergencyLabel: string;
  ambulanceNumber?: string;
  supportedHealthcareResources: string[];
}

export type ConversationMode = 'emergency' | 'normal';
export type EscalationState = 'none' | 'facility_unreachable' | 'guidance_requested' | 'resolved';

export interface SessionContext {
  mode: ConversationMode;
  urgency: UrgencyLevel;
  situation: string; // e.g. 'unresponsive_person', 'possible_emergency_chest_pain', 'skin_rash'
  facilityType: FacilityType;
  userLocation?: UserLocation;
  country: CountryConfig;
  language: Language;
  previousUserMessages: string[];
  previousAssistantActions: string[];
  actionsAlreadyAttempted: string[];
  escalationState: EscalationState;
  requestedLimit?: number;
  filterOpenNow?: boolean;
}

export interface ConversationTurn {
  id: string;
  query: string;
  timestamp: string;
  triage: TriageResult;
  facilities: Facility[];
  isLoadingFacilities: boolean;
  escalationState?: EscalationState;
  language?: Language;
}

export type AppMode = 'emergency' | 'normal';
