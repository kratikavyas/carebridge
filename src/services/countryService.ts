import { CountryConfig, UserLocation } from '../types';

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  IN: {
    countryCode: 'IN',
    countryName: 'India',
    emergencyNumber: '112',
    emergencyLabel: '112 National Emergency',
    ambulanceNumber: '112', // 112 is consolidated national emergency
    supportedHealthcareResources: ['hospital', 'pharmacy', 'blood_bank', 'clinic', 'diagnostic_center', 'doctor', 'dental'],
  },
  US: {
    countryCode: 'US',
    countryName: 'United States',
    emergencyNumber: '911',
    emergencyLabel: '911 Emergency',
    supportedHealthcareResources: ['hospital', 'pharmacy', 'clinic', 'urgent_care', 'doctor', 'dental'],
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    emergencyNumber: '999',
    emergencyLabel: '999 Emergency (or 112)',
    supportedHealthcareResources: ['hospital', 'pharmacy', 'clinic', 'doctor', 'dental'],
  },
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    emergencyNumber: '112',
    emergencyLabel: '112 Urgences',
    supportedHealthcareResources: ['hospital', 'pharmacy', 'clinic', 'doctor'],
  },
  GLOBAL: {
    countryCode: 'GLOBAL',
    countryName: 'International',
    emergencyNumber: '112', // Standard GSM emergency number accepted in most regions
    emergencyLabel: 'Local Emergency',
    supportedHealthcareResources: ['hospital', 'pharmacy', 'clinic', 'doctor'],
  },
};

export const DEFAULT_COUNTRY = COUNTRY_CONFIGS.IN;

export function detectCountryFromLocation(location?: UserLocation): CountryConfig {
  if (!location) return DEFAULT_COUNTRY;

  if (location.countryCode && COUNTRY_CONFIGS[location.countryCode.toUpperCase()]) {
    return COUNTRY_CONFIGS[location.countryCode.toUpperCase()];
  }

  // Geographic bounding box check for India:
  // Lat: ~6.5 to ~37.5, Lng: ~68.0 to ~97.5
  const { lat, lng } = location;
  if (lat >= 6.5 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5) {
    return COUNTRY_CONFIGS.IN;
  }

  // Continental US approximation
  if (lat >= 24.5 && lat <= 49.5 && lng >= -125.0 && lng <= -66.9) {
    return COUNTRY_CONFIGS.US;
  }

  // UK approximation
  if (lat >= 49.8 && lat <= 60.9 && lng >= -8.6 && lng <= 1.8) {
    return COUNTRY_CONFIGS.GB;
  }

  return DEFAULT_COUNTRY;
}
