import { Facility, UserLocation } from '../types';

export function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function formatEmergencySosMessage(
  userLocation: UserLocation,
  conditionText: string,
  facility?: Facility
): string {
  const mapsPin = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
  const facilityDetails = facility
    ? `\n🏥 Nearest Hospital: ${facility.name} (${facility.phone})\n📍 Hospital Map: ${getDirectionsUrl(facility.coordinates.lat, facility.coordinates.lng)}`
    : '';

  return (
    `🚨 *CAREBRIDGE EMERGENCY MEDICAL SOS* 🚨\n` +
    `I urgently need medical assistance!\n\n` +
    `📍 *My Live GPS Location*: ${mapsPin} (${userLocation.label})\n` +
    `⚠️ *Patient Situation*: ${conditionText || 'Critical Medical Emergency'}` +
    facilityDetails +
    `\n\n_If you cannot reach me, please immediately dial 112 or dispatch an ambulance to this location._`
  );
}

export async function shareEmergencyLocation(
  userLocation: UserLocation,
  conditionText: string,
  facility?: Facility
): Promise<'shared' | 'whatsapp' | 'copied'> {
  const text = formatEmergencySosMessage(userLocation, conditionText, facility);
  const shareTitle = 'CareBridge Medical Emergency SOS';

  // 1. Try Web Share API (native on iOS/Android browsers)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: text
      });
      return 'shared';
    } catch (err: any) {
      // User cancelled or share failed, fallback to whatsapp
      if (err.name === 'AbortError') {
        return 'shared';
      }
    }
  }

  // 2. WhatsApp Direct Link
  if (typeof window !== 'undefined') {
    const encoded = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
    return 'whatsapp';
  }

  return 'copied';
}
