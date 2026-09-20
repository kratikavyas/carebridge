import { UserLocation } from '../types';

export const PRESET_LOCATIONS: Record<string, UserLocation> = {
  indore: {
    lat: 22.7196,
    lng: 75.8577,
    label: 'Indore (Madhya Pradesh)',
    isLive: false
  },
  delhi: {
    lat: 28.5672,
    lng: 77.2100,
    label: 'New Delhi (AIIMS / South Hub)',
    isLive: false
  },
  bengaluru: {
    lat: 12.9592,
    lng: 77.6499,
    label: 'Bengaluru (Indiranagar / HAL)',
    isLive: false
  },
  mumbai: {
    lat: 19.0028,
    lng: 72.8427,
    label: 'Mumbai (Parel / South Mumbai)',
    isLive: false
  },
  kolkata: {
    lat: 22.5394,
    lng: 88.3444,
    label: 'Kolkata (Bhowanipore / Central)',
    isLive: false
  }
};

export const DEFAULT_LOCATION: UserLocation = PRESET_LOCATIONS.delhi;

export async function getLiveBrowserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          label: `Live GPS (${position.coords.latitude.toFixed(4)}°, ${position.coords.longitude.toFixed(4)}°)`,
          isLive: true
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000
      }
    );
  });
}
