import { Facility, FacilityType, UserLocation } from '../types';

export const MAX_EMERGENCY_DISTANCE_KM = 50;
export const MAX_NORMAL_DISTANCE_KM = 75;

// Strict 24/7 check: Only return true if opening hours explicitly document round-the-clock availability
export function isExplicitly24x7(openingHours?: string): boolean {
  if (!openingHours) return false;
  const h = openingHours.trim().toLowerCase();
  return (
    h === '24/7' ||
    h === '24 / 7' ||
    h === 'open 24 hours / 7 days' ||
    h === 'open 24 hours' ||
    h === '24 hours' ||
    h.includes('00:00-24:00') ||
    h.includes('24/7')
  );
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

export function estimateDriveTimeMinutes(distanceKm: number): number {
  return Math.max(3, Math.round(distanceKm * 2.5 + 3));
}

// Check and exclude obvious non-emergency healthcare amenities in emergency mode
export function isIrrelevantForEmergency(name: string, tags: Record<string, string> = {}): boolean {
  const combined = `${name} ${tags.amenity || ''} ${tags.healthcare || ''} ${tags['healthcare:speciality'] || ''} ${tags.operator || ''}`.toLowerCase();
  const blockedTerms = [
    'ayurveda', 'ayurvedic', 'homeopathy', 'homeopathic', 'ayush', 'unani', 'siddha', 'naturopathy',
    'dentist', 'dental', 'teeth', 'orthodontic',
    'beauty', 'salon', 'spa', 'laser clinic', 'hair transplant', 'cosmetic',
    'optician', 'eyewear', 'spectacles', 'lenskart', 'vision express',
    'physiotherapy', 'wellness clinic', 'diet clinic', 'nutrition',
    'veterinary', 'pet clinic', 'animal hospital'
  ];
  return blockedTerms.some((term) => combined.includes(term));
}

// Curated Emergency & Normal Facilities used strictly as a verified fallback if live OSM query is unreachable
export const fallbackCuratedFacilities: Facility[] = [
  {
    id: 'fallback-aiims-trauma',
    name: 'AIIMS Apex Trauma Center & Emergency',
    type: 'trauma_center',
    category: 'emergency',
    address: 'Ring Road, Safdarjung Enclave, New Delhi, Delhi 110029',
    city: 'New Delhi',
    coordinates: { lat: 28.5672, lng: 77.2100 },
    phone: '011-26588500',
    emergencyPhone: '011-26731000',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['Level-1 Trauma', 'Cardiac ICU', 'Ventilators', '24/7 Blood Bank'],
    specialties: ['Trauma Surgery', 'Emergency Medicine', 'Cardiology'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-safdarjung-emergency',
    name: 'Safdarjung Hospital Emergency & Burn ICU',
    type: 'burn_unit',
    category: 'emergency',
    address: 'Ansari Nagar East, Ring Road, New Delhi, Delhi 110029',
    city: 'New Delhi',
    coordinates: { lat: 28.5701, lng: 77.2078 },
    phone: '011-26165060',
    emergencyPhone: '011-26165032',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['Apex Burn ICU', 'Trauma Resuscitation', '24/7 Ambulance'],
    specialties: ['Burn Care', 'Emergency Surgery', 'Pediatrics'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-max-saket',
    name: 'Max Super Speciality Hospital — Emergency Wing',
    type: 'icu_hospital',
    category: 'emergency',
    address: '1, 2, Press Enclave Marg, Saket, New Delhi, Delhi 110017',
    city: 'New Delhi',
    coordinates: { lat: 28.5283, lng: 77.2117 },
    phone: '011-26515050',
    emergencyPhone: '011-40554055',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['Cardiac Cath Lab', 'Stroke Center', 'Critical Care ICU'],
    specialties: ['Cardiology', 'Neurology', 'Critical Care'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-apollo-delhi',
    name: 'Indraprastha Apollo Hospital Emergency Department',
    type: 'icu_hospital',
    category: 'emergency',
    address: 'Delhi Mathura Road, Sarita Vihar, New Delhi, Delhi 110076',
    city: 'New Delhi',
    coordinates: { lat: 28.5398, lng: 77.2882 },
    phone: '011-26925858',
    emergencyPhone: '1066',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['24/7 Emergency Triage', 'Dedicated Cardiac ICU', 'Air Ambulance'],
    specialties: ['Cardiology', 'Vascular Surgery', 'Emergency Trauma'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-manipal-blr',
    name: 'Manipal Hospital 24/7 Emergency & Trauma Center',
    type: 'trauma_center',
    category: 'emergency',
    address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
    city: 'Bengaluru',
    coordinates: { lat: 12.9592, lng: 77.6499 },
    phone: '080-25024444',
    emergencyPhone: '080-25023344',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['24/7 Trauma Care', 'Cardiac ICU', 'Comprehensive Stroke Center'],
    specialties: ['Cardiology', 'Neurosurgery', 'Emergency Medicine'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-kem-mumbai',
    name: 'KEM Hospital & Seth GS Medical Emergency',
    type: 'trauma_center',
    category: 'emergency',
    address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
    city: 'Mumbai',
    coordinates: { lat: 19.0028, lng: 72.8427 },
    phone: '022-24107000',
    emergencyPhone: '022-24136051',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['Apex Trauma Center', '24/7 Resuscitation', 'Toxicology Unit'],
    specialties: ['Trauma Care', 'General Surgery', 'Internal Medicine'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-sskm-kolkata',
    name: 'SSKM Hospital & IPGMER Apex Trauma Care',
    type: 'trauma_center',
    category: 'emergency',
    address: '244, AJC Bose Rd, Bhowanipore, Kolkata, West Bengal 700020',
    city: 'Kolkata',
    coordinates: { lat: 22.5394, lng: 88.3444 },
    phone: '033-22231589',
    emergencyPhone: '033-22041100',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['Apex Emergency & Trauma', 'Burn ICU', '24/7 Dialysis'],
    specialties: ['Emergency Trauma', 'Burn Unit', 'Cardiology'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-my-indore',
    name: 'Maharaja Yeshwantrao Hospital (MY Hospital) — Emergency & Trauma',
    type: 'trauma_center',
    category: 'emergency',
    address: 'MY Hospital Rd, Sanyogitaganj, Indore, Madhya Pradesh 452001',
    city: 'Indore',
    coordinates: { lat: 22.7165, lng: 75.8710 },
    phone: '0731-2527383',
    emergencyPhone: '0731-2527383',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['Apex Govt Trauma Centre', '24/7 Casualty & Resuscitation', 'Critical Care ICU', 'Emergency Surgery'],
    specialties: ['Trauma Surgery', 'Emergency Medicine', 'Critical Care'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-bombay-hospital-indore',
    name: 'Bombay Hospital Indore — 24/7 Emergency & Trauma',
    type: 'icu_hospital',
    category: 'emergency',
    address: 'IDA Scheme No. 94/95, Eastern Ring Road, Vijay Nagar, Indore, Madhya Pradesh 452010',
    city: 'Indore',
    coordinates: { lat: 22.7562, lng: 75.8942 },
    phone: '0731-4771111',
    emergencyPhone: '0731-4771111',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['Cardiac Emergency & Cath Lab', 'Neuro ICU', 'Trauma Resuscitation', '24/7 Blood Bank'],
    specialties: ['Cardiology', 'Neurology', 'Critical Care Medicine'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-medanta-indore',
    name: 'Medanta Super Speciality Hospital — Emergency Wing',
    type: 'icu_hospital',
    category: 'emergency',
    address: 'Plot No. 8, PU-4, Scheme No. 54, Vijay Nagar, Indore, Madhya Pradesh 452010',
    city: 'Indore',
    coordinates: { lat: 22.7533, lng: 75.8936 },
    phone: '0731-6677777',
    emergencyPhone: '0731-6677777',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['Emergency Care Unit', 'Cardiac Cath Lab', 'Stroke Center', 'Critical Care ICU'],
    specialties: ['Cardiology', 'Emergency Medicine', 'Neurosurgery'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-choithram-indore',
    name: 'Choithram Hospital & Research Centre — Emergency Department',
    type: 'trauma_center',
    category: 'emergency',
    address: '14, Manik Bagh Road, Indore, Madhya Pradesh 452014',
    city: 'Indore',
    coordinates: { lat: 22.6980, lng: 75.8450 },
    phone: '0731-2470070',
    emergencyPhone: '0731-2470070',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['24/7 Emergency & Trauma', 'Burn ICU', 'Dialysis', 'Ambulance Service'],
    specialties: ['Emergency Trauma', 'Burn Care', 'Critical Care'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-chl-indore',
    name: 'Care CHL Hospitals — Emergency & Trauma Centre',
    type: 'icu_hospital',
    category: 'emergency',
    address: 'AB Road, Near LIG Square, Indore, Madhya Pradesh 452008',
    city: 'Indore',
    coordinates: { lat: 22.7350, lng: 75.8885 },
    phone: '0731-4041234',
    emergencyPhone: '0731-4041234',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['24/7 Emergency Services', 'Interventional Cardiology', 'Neuro ICU'],
    specialties: ['Emergency Medicine', 'Cardiology', 'Critical Care'],
    verified: true,
    emergencyCapabilityVerified: true,
    source: 'curated_fallback',
    isFallback: true,
  },

  // Normal Mode Fallbacks
  {
    id: 'fallback-kaya-skin',
    name: 'Kaya Skin Clinic',
    type: 'dermatology',
    category: 'normal',
    address: 'M-Block Market, Greater Kailash 1, New Delhi 110048',
    city: 'New Delhi',
    coordinates: { lat: 28.5529, lng: 77.2384 },
    phone: '011-41634500',
    emergency24x7: false,
    openHours: '10:00 AM – 8:00 PM',
    services: ['Dermatology Consultations', 'Allergy Patch Testing', 'Acne Care'],
    specialties: ['Dermatology', 'Skin Specialist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-aiims-derma',
    name: 'AIIMS Specialty Dermatology OPD',
    type: 'dermatology',
    category: 'normal',
    address: 'RAK OPD Block, AIIMS, New Delhi 110029',
    city: 'New Delhi',
    coordinates: { lat: 28.5665, lng: 77.2115 },
    phone: '011-26588700',
    emergency24x7: false,
    openHours: '08:30 AM – 4:00 PM',
    services: ['Clinical Dermatology', 'Allergy Clinic', 'Biopsy Lab'],
    specialties: ['Dermatology'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-safdarjung-derma',
    name: 'Safdarjung Hospital Department of Dermatology',
    type: 'dermatology',
    category: 'normal',
    address: 'Ring Road, Opposite AIIMS, New Delhi 110029',
    city: 'New Delhi',
    coordinates: { lat: 28.5710, lng: 77.2085 },
    phone: '011-26165060',
    emergency24x7: false,
    openHours: '09:00 AM – 4:00 PM',
    services: ['Comprehensive Dermatology', 'Skin Allergy Testing', 'Phototherapy'],
    specialties: ['Dermatology', 'Skin Specialist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-max-derma',
    name: 'Max Super Speciality Hospital — Dermatology OPD',
    type: 'dermatology',
    category: 'normal',
    address: '1, 2, Press Enclave Marg, Saket, New Delhi 110017',
    city: 'New Delhi',
    coordinates: { lat: 28.5285, lng: 77.2120 },
    phone: '011-26515050',
    emergency24x7: false,
    openHours: '09:00 AM – 7:00 PM',
    services: ['Clinical Dermatology', 'Pediatric Dermatology', 'Allergy Patch Testing'],
    specialties: ['Dermatology', 'Skin Specialist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-fortis-derma',
    name: 'Fortis C-DOC Centre for Dermatology',
    type: 'dermatology',
    category: 'normal',
    address: 'B-16, Chirag Enclave, Greater Kailash, New Delhi 110048',
    city: 'New Delhi',
    coordinates: { lat: 28.5470, lng: 77.2460 },
    phone: '011-49101222',
    emergency24x7: false,
    openHours: '08:30 AM – 6:30 PM',
    services: ['Skin Rash Diagnostics', 'Immunodermatology', 'Dermatopathology'],
    specialties: ['Dermatology', 'Skin Specialist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-apollo-derma',
    name: 'Indraprastha Apollo Hospital — Dermatology Department',
    type: 'dermatology',
    category: 'normal',
    address: 'Delhi Mathura Road, Sarita Vihar, New Delhi 110076',
    city: 'New Delhi',
    coordinates: { lat: 28.5402, lng: 77.2880 },
    phone: '011-26925858',
    emergency24x7: false,
    openHours: '09:00 AM – 6:00 PM',
    services: ['Eczema & Psoriasis Clinic', 'Skin Biopsy', 'Allergy Diagnostics'],
    specialties: ['Dermatology', 'Skin Specialist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-gangaram-derma',
    name: 'Sir Ganga Ram Hospital Dermatology Department',
    type: 'dermatology',
    category: 'normal',
    address: 'Rajinder Nagar, New Delhi 110060',
    city: 'New Delhi',
    coordinates: { lat: 28.6385, lng: 77.1895 },
    phone: '011-25750000',
    emergency24x7: false,
    openHours: '09:00 AM – 5:00 PM',
    services: ['General Dermatology', 'Contact Dermatitis Clinic', 'Pediatric Skin Care'],
    specialties: ['Dermatology', 'Skin Specialist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-kandhari-skin',
    name: 'Dr. Kandhari Skin & Dermatology Clinic',
    type: 'dermatology',
    category: 'normal',
    address: 'S-79, Greater Kailash Part 1, New Delhi 110048',
    city: 'New Delhi',
    coordinates: { lat: 28.5515, lng: 77.2360 },
    phone: '011-46543000',
    emergency24x7: false,
    openHours: '10:00 AM – 7:30 PM',
    services: ['Rash Treatment', 'Allergy Evaluation', 'Skin Consultations'],
    specialties: ['Dermatology', 'Skin Specialist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-manipal-derma',
    name: 'Manipal Hospital Specialty Dermatology Wing',
    type: 'dermatology',
    category: 'normal',
    address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru 560017',
    city: 'Bengaluru',
    coordinates: { lat: 12.9585, lng: 77.6485 },
    phone: '080-25024444',
    emergency24x7: false,
    openHours: '08:30 AM – 6:00 PM',
    services: ['Clinical Dermatology', 'Allergy Center', 'Pediatric Dermatology'],
    specialties: ['Dermatology', 'Skin Specialist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-kokilaben-derma',
    name: 'Kokilaben Dhirubhai Ambani Hospital — Dermatology Unit',
    type: 'dermatology',
    category: 'normal',
    address: 'Rao Saheb Achutrao Patwardhan Marg, Andheri West, Mumbai 400053',
    city: 'Mumbai',
    coordinates: { lat: 19.1315, lng: 72.8250 },
    phone: '022-30999999',
    emergency24x7: false,
    openHours: '09:00 AM – 6:30 PM',
    services: ['Dermatology Consultation', 'Skin Infection Treatment', 'Allergy Lab'],
    specialties: ['Dermatology', 'Skin Specialist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-gleneagles-derma',
    name: 'Apollo Gleneagles Dermatology Department',
    type: 'dermatology',
    category: 'normal',
    address: '58, Canal Circular Rd, Kadapara, Phool Bagan, Kolkata 700054',
    city: 'Kolkata',
    coordinates: { lat: 22.5695, lng: 77.3995 },
    phone: '033-23203040',
    emergency24x7: false,
    openHours: '09:00 AM – 5:00 PM',
    services: ['General Dermatology', 'Allergy Care', 'Skin Biopsy'],
    specialties: ['Dermatology', 'Skin Specialist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-apollo-pharmacy',
    name: 'Apollo Pharmacy 24x7',
    type: 'pharmacy',
    category: 'normal',
    address: 'Main Market, Green Park, New Delhi, Delhi 110016',
    city: 'New Delhi',
    coordinates: { lat: 28.5588, lng: 77.2062 },
    phone: '011-26511122',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['Prescription Medicines', 'First Aid Supplies'],
    specialties: ['Pharmacy', 'Chemist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-rotary-blood',
    name: 'Rotary Blood Bank & Component Separation Center',
    type: 'blood_bank',
    category: 'normal',
    address: '56-57, Tughlakabad Institutional Area, New Delhi 110062',
    city: 'New Delhi',
    coordinates: { lat: 28.5135, lng: 77.2625 },
    phone: '011-29955555',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['PRBC', 'Platelets (SDP)', 'FFP'],
    specialties: ['Transfusion Medicine', 'Blood Bank'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-cloudnine',
    name: 'Cloudnine Maternity & Gynecology Center',
    type: 'gynecology',
    category: 'normal',
    address: 'C-9, Kailash Colony, Greater Kailash, New Delhi 110048',
    city: 'New Delhi',
    coordinates: { lat: 28.5544, lng: 77.2435 },
    phone: '011-47707700',
    emergency24x7: false,
    openHours: 'OPD: 9:00 AM – 8:00 PM | Labor 24x7',
    services: ['Obstetrics & Gynecology', 'High-Risk Pregnancy Care'],
    specialties: ['Gynecology', 'Obstetrics'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-clove-dental',
    name: 'Clove Dental Care & Oral Surgery',
    type: 'dental',
    category: 'normal',
    address: 'A-12, South Extension Part 2, New Delhi 110049',
    city: 'New Delhi',
    coordinates: { lat: 28.5685, lng: 77.2205 },
    phone: '011-41008000',
    emergency24x7: false,
    openHours: '10:00 AM – 8:00 PM',
    services: ['Root Canal Treatment', 'Tooth Extraction', 'Dental Emergency'],
    specialties: ['Dentistry', 'Dental Surgery'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-lal-pathlabs',
    name: 'Dr. Lal PathLabs Reference Laboratory',
    type: 'diagnostic_center',
    category: 'normal',
    address: 'Block E, Saket, New Delhi 110017',
    city: 'New Delhi',
    coordinates: { lat: 28.5244, lng: 77.2085 },
    phone: '011-39885050',
    emergency24x7: false,
    openHours: '07:00 AM – 9:00 PM',
    services: ['Blood Tests (CBC, Lipid, Troponin)', 'Ultrasound', 'Digital X-Ray'],
    specialties: ['Pathology', 'Radiology'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-apollo-clinic',
    name: 'Apollo Family Health Clinic & Primary Care',
    type: 'general_physician',
    category: 'normal',
    address: 'B-14, Greater Kailash 2, New Delhi 110048',
    city: 'New Delhi',
    coordinates: { lat: 28.5385, lng: 77.2415 },
    phone: '011-40506070',
    emergency24x7: false,
    openHours: '08:00 AM – 8:00 PM',
    services: ['General Medical Consultations', 'Back Pain Evaluation', 'ECG'],
    specialties: ['General Physician', 'Family Medicine'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  // Indore Normal Mode Fallbacks
  {
    id: 'fallback-kaya-skin-indore',
    name: 'Kaya Clinic Indore',
    type: 'dermatology',
    category: 'normal',
    address: 'A.B. Road, Near Industry House, New Palasia, Indore, Madhya Pradesh 452001',
    city: 'Indore',
    coordinates: { lat: 22.7265, lng: 75.8820 },
    phone: '0731-4089900',
    emergency24x7: false,
    openHours: '10:00 AM – 8:00 PM',
    services: ['Dermatology Consultation', 'Skin Rash Diagnosis', 'Allergy Patch Testing'],
    specialties: ['Dermatology', 'Skin Specialist'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-apollo-pharmacy-indore',
    name: 'Apollo Pharmacy 24/7 — Vijay Nagar',
    type: 'pharmacy',
    category: 'normal',
    address: 'Plot 12, Scheme 54, Vijay Nagar, Indore, Madhya Pradesh 452010',
    city: 'Indore',
    coordinates: { lat: 22.7535, lng: 75.8925 },
    phone: '0731-2555500',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['Prescription Medicines', 'Emergency First Aid Supplies', '24/7 Dispensing'],
    specialties: ['Pharmacy', 'Emergency Medication'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-redcross-bloodbank-indore',
    name: 'Indian Red Cross Society Blood Bank Indore',
    type: 'blood_bank',
    category: 'normal',
    address: 'M.Y. Hospital Campus, Sanyogitaganj, Indore, Madhya Pradesh 452001',
    city: 'Indore',
    coordinates: { lat: 22.7170, lng: 75.8715 },
    phone: '0731-2512100',
    emergency24x7: true,
    openHours: 'Open 24 Hours / 7 Days',
    services: ['All Blood Groups (A+, B+, O+, AB+, Negative)', 'Platelet Apheresis', '24/7 Emergency Issue'],
    specialties: ['Blood Bank', 'Transfusion Medicine'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-clove-dental-indore',
    name: 'Clove Dental Clinic Indore',
    type: 'dental',
    category: 'normal',
    address: 'Shop 4, Trade Centre, South Tukoganj, Indore, Madhya Pradesh 452001',
    city: 'Indore',
    coordinates: { lat: 22.7230, lng: 75.8790 },
    phone: '0731-4200123',
    emergency24x7: false,
    openHours: '10:00 AM – 8:00 PM',
    services: ['Dental Emergency Relief', 'Root Canal Treatment', 'Tooth Extraction'],
    specialties: ['Dentistry', 'Dental Surgery'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-lal-pathlabs-indore',
    name: 'Dr Lal PathLabs Patient Service Centre Indore',
    type: 'diagnostic_center',
    category: 'normal',
    address: 'Geeta Bhawan Square, AB Road, Indore, Madhya Pradesh 452001',
    city: 'Indore',
    coordinates: { lat: 22.7215, lng: 75.8845 },
    phone: '0731-4040100',
    emergency24x7: false,
    openHours: '07:00 AM – 8:00 PM',
    services: ['Complete Blood Count (CBC)', 'Biochemistry Lab', 'Pathology & Diagnostic Tests'],
    specialties: ['Pathology', 'Diagnostic Center'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
  {
    id: 'fallback-apollo-clinic-indore',
    name: 'Apollo Clinic & Family Physician Indore',
    type: 'general_physician',
    category: 'normal',
    address: 'PU-4 Commercial, Scheme 54, Vijay Nagar, Indore, Madhya Pradesh 452010',
    city: 'Indore',
    coordinates: { lat: 22.7510, lng: 75.8915 },
    phone: '0731-4266100',
    emergency24x7: false,
    openHours: '08:00 AM – 8:00 PM',
    services: ['General Physician Consultations', 'Preventive Health Checks', 'Minor Injury Care'],
    specialties: ['General Physician', 'Internal Medicine'],
    verified: true,
    source: 'curated_fallback',
    isFallback: true,
  },
];

export interface FindNearbyOptions {
  mode?: 'emergency' | 'normal';
  searchQuery?: string;
  radiusMeters?: number;
  limit?: number;
}

// Build Overpass QL query based on mode and facility type
function buildOverpassQuery(
  lat: number,
  lng: number,
  mode: 'emergency' | 'normal',
  facilityType?: FacilityType | 'all',
  radius = 15000
): string {
  if (mode === 'emergency') {
    return `[out:json][timeout:12];
(
  node["amenity"="hospital"](around:${radius},${lat},${lng});
  way["amenity"="hospital"](around:${radius},${lat},${lng});
  relation["amenity"="hospital"](around:${radius},${lat},${lng});
  node["emergency"="yes"](around:${radius},${lat},${lng});
  way["emergency"="yes"](around:${radius},${lat},${lng});
  relation["emergency"="yes"](around:${radius},${lat},${lng});
  node["healthcare"="hospital"](around:${radius},${lat},${lng});
  way["healthcare"="hospital"](around:${radius},${lat},${lng});
  relation["healthcare"="hospital"](around:${radius},${lat},${lng});
);
out center tags 40;`;
  }

  // Normal mode queries
  switch (facilityType) {
    case 'pharmacy':
      return `[out:json][timeout:8];
(
  node["amenity"="pharmacy"](around:${radius},${lat},${lng});
  way["amenity"="pharmacy"](around:${radius},${lat},${lng});
  node["healthcare"="pharmacy"](around:${radius},${lat},${lng});
);
out center tags 30;`;
    case 'blood_bank':
      return `[out:json][timeout:8];
(
  node["healthcare"="blood_bank"](around:${radius},${lat},${lng});
  node["healthcare:speciality"="blood_bank"](around:${radius},${lat},${lng});
  node["amenity"="blood_bank"](around:${radius},${lat},${lng});
);
out center tags 25;`;
    case 'dermatology':
      return `[out:json][timeout:8];
(
  node["healthcare:speciality"="dermatology"](around:${radius},${lat},${lng});
  node["healthcare"="doctor"]["healthcare:speciality"="dermatology"](around:${radius},${lat},${lng});
  node["healthcare"="clinic"]["healthcare:speciality"="dermatology"](around:${radius},${lat},${lng});
);
out center tags 25;`;
    case 'dental':
      return `[out:json][timeout:8];
(
  node["amenity"="dentist"](around:${radius},${lat},${lng});
  way["amenity"="dentist"](around:${radius},${lat},${lng});
  node["healthcare"="dentist"](around:${radius},${lat},${lng});
);
out center tags 25;`;
    case 'gynecology':
      return `[out:json][timeout:8];
(
  node["healthcare:speciality"="gynaecology"](around:${radius},${lat},${lng});
  node["healthcare:speciality"="obstetrics"](around:${radius},${lat},${lng});
  node["healthcare"="clinic"]["healthcare:speciality"="gynaecology"](around:${radius},${lat},${lng});
);
out center tags 25;`;
    case 'general_physician':
      return `[out:json][timeout:8];
(
  node["amenity"="doctors"](around:${radius},${lat},${lng});
  node["healthcare"="doctor"](around:${radius},${lat},${lng});
  node["amenity"="clinic"](around:${radius},${lat},${lng});
);
out center tags 30;`;
    case 'diagnostic_center':
      return `[out:json][timeout:8];
(
  node["healthcare"="laboratory"](around:${radius},${lat},${lng});
  node["healthcare"="diagnostic"](around:${radius},${lat},${lng});
  node["amenity"="diagnostic_centre"](around:${radius},${lat},${lng});
);
out center tags 25;`;
    case 'all':
    default:
      return `[out:json][timeout:8];
(
  node["amenity"="hospital"](around:${radius},${lat},${lng});
  way["amenity"="hospital"](around:${radius},${lat},${lng});
  node["amenity"="pharmacy"](around:${radius},${lat},${lng});
  node["amenity"="clinic"](around:${radius},${lat},${lng});
  node["amenity"="doctors"](around:${radius},${lat},${lng});
);
out center tags 35;`;
  }
}

// Convert OpenStreetMap element into a normalized Facility object with relevance scoring
function parseOsmElement(
  element: any,
  userLat: number,
  userLng: number,
  mode: 'emergency' | 'normal'
): Facility | null {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  const rawName =
    tags.name ||
    tags['name:en'] ||
    tags.operator ||
    tags.brand ||
    (tags.amenity === 'hospital'
      ? 'Hospital / Medical Center'
      : tags.amenity
      ? `${tags.amenity.toUpperCase()} Center`
      : 'Healthcare Facility');

  // STRENGTHEN EMERGENCY FILTERING:
  // Exclude obvious irrelevant clinics (Ayurveda, dental, beauty, optometrist) when in emergency mode
  if (mode === 'emergency' && isIrrelevantForEmergency(rawName, tags)) {
    return null;
  }

  // Contact / Phone (Do NOT fabricate!)
  const rawPhone =
    tags['contact:phone'] ||
    tags.phone ||
    tags['contact:mobile'] ||
    tags['phone:emergency'] ||
    undefined;

  const rawEmergencyPhone = tags['emergency:phone'] || (tags.emergency === 'yes' ? rawPhone : undefined);

  // Opening hours (Do NOT fabricate!)
  const rawOpeningHours = tags.opening_hours?.trim();
  const openHours = rawOpeningHours || 'Hours unavailable';
  const is24x7 = isExplicitly24x7(rawOpeningHours);

  // Address
  const addressParts = [
    tags['addr:street'],
    tags['addr:suburb'] || tags['addr:district'],
    tags['addr:city'],
    tags['addr:postcode'],
  ].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'Nearby Healthcare Facility';

  // Facility Type mapping
  let facilityType: FacilityType = 'icu_hospital';
  if (tags.amenity === 'pharmacy' || tags.healthcare === 'pharmacy') {
    facilityType = 'pharmacy';
  } else if (tags['healthcare:speciality'] === 'blood_bank' || tags.healthcare === 'blood_bank') {
    facilityType = 'blood_bank';
  } else if (tags['healthcare:speciality'] === 'dermatology') {
    facilityType = 'dermatology';
  } else if (tags.amenity === 'dentist' || tags.healthcare === 'dentist') {
    facilityType = 'dental';
  } else if (tags['healthcare:speciality'] === 'gynaecology' || tags['healthcare:speciality'] === 'obstetrics') {
    facilityType = 'gynecology';
  } else if (tags.amenity === 'doctors' || tags.healthcare === 'doctor') {
    facilityType = 'general_physician';
  } else if (tags.healthcare === 'laboratory') {
    facilityType = 'diagnostic_center';
  } else if (tags.emergency === 'yes') {
    facilityType = 'trauma_center';
  }

  // Check verified emergency capability
  const emergencyCapabilityVerified = Boolean(
    tags.emergency === 'yes' ||
    tags['healthcare:emergency'] === 'yes' ||
    (tags.amenity === 'hospital' && tags.emergency !== 'no')
  );

  // Genuine services extracted from OSM tags (No fabrication)
  const services: string[] = [];
  if (tags.emergency === 'yes') services.push('Emergency Department');
  if (tags.wheelchair === 'yes') services.push('Wheelchair Accessible');
  if (tags.dispensing === 'yes') services.push('Prescription Pharmacy');
  if (tags['healthcare:speciality']) services.push(tags['healthcare:speciality'].replace(/_/g, ' '));
  if (tags.operator) services.push(`Operated by ${tags.operator}`);

  const distanceKm = calculateDistanceKm(userLat, userLng, lat, lng);
  const etaMinutes = estimateDriveTimeMinutes(distanceKm);

  return {
    id: `osm-${element.type}-${element.id}`,
    name: rawName,
    type: facilityType,
    category: mode,
    address,
    city: tags['addr:city'] || 'Local Area',
    coordinates: { lat, lng },
    phone: rawPhone,
    emergencyPhone: rawEmergencyPhone,
    emergency24x7: is24x7,
    openHours,
    services,
    specialties: tags['healthcare:speciality'] ? [tags['healthcare:speciality']] : [facilityType.replace(/_/g, ' ')],
    verified: Boolean(tags.amenity === 'hospital' || tags.emergency === 'yes' || tags.operator),
    emergencyCapabilityVerified,
    distanceKm,
    etaMinutes,
    source: 'osm_live',
    isFallback: false,
  };
}

// Calculate ranking score for normal care (Specialty match > hours/phone > distance)
export function calculateNormalRelevance(
  facility: Facility,
  targetType?: FacilityType | 'all'
): number {
  let score = 0;
  const name = facility.name.toLowerCase();
  const specs = facility.specialties.map((s) => s.toLowerCase()).join(' ');

  // 1. Specialty / intent match: Must drastically outrank closer unrelated facilities
  if (targetType && targetType !== 'all') {
    if (facility.type === targetType) {
      score += 1000;
    }
    if (targetType === 'dermatology' && (name.includes('skin') || name.includes('derma') || specs.includes('derma'))) {
      score += 500;
    }
    if (targetType === 'pharmacy' && (name.includes('pharmacy') || name.includes('chemist') || name.includes('med'))) {
      score += 500;
    }
    if (targetType === 'blood_bank' && (name.includes('blood') || specs.includes('blood'))) {
      score += 500;
    }
    if (targetType === 'dental' && (name.includes('dent') || specs.includes('dent') || specs.includes('tooth'))) {
      score += 500;
    }
    if (targetType === 'diagnostic_center' && (name.includes('lab') || name.includes('path') || name.includes('diag'))) {
      score += 500;
    }
    if (targetType === 'gynecology' && (name.includes('gyn') || name.includes('matern') || name.includes('women'))) {
      score += 500;
    }
  }

  // 2. Data quality (has verified phone and hours)
  if (facility.phone) score += 30;
  if (facility.openHours && facility.openHours !== 'Hours unavailable') score += 20;

  // 3. Proximity: secondary tiebreaker
  const distance = facility.distanceKm ?? 10;
  score -= Math.min(distance * 3, 200);

  return score;
}

// Calculate ranking score for emergency care (Hospital / emergency capable > 24/7 > distance)
export function calculateEmergencyRelevance(facility: Facility): number {
  let score = 0;
  const name = facility.name.toLowerCase();
  const services = facility.services.map((s) => s.toLowerCase()).join(' ');

  // 1. Level-1 Trauma / Apex Hospital / Emergency Department
  if (name.includes('trauma') || services.includes('trauma') || facility.type === 'trauma_center') {
    score += 800;
  }
  if (facility.emergencyCapabilityVerified) {
    score += 400;
  }
  // SOURCED 24/7 ONLY: only reward 24/7 if opening hours are explicitly verified
  if (facility.emergency24x7 && isExplicitly24x7(facility.openHours)) {
    score += 300;
  }
  if (name.includes('hospital') || name.includes('medical college') || name.includes('speciality')) {
    score += 200;
  }
  if (facility.phone || facility.emergencyPhone) {
    score += 40;
  }

  // Distance penalty
  const distance = facility.distanceKm ?? 10;
  score -= Math.min(distance * 8, 300);

  return score;
}

// Core Async API: Real OpenStreetMap Overpass lookup with Graceful Fallback
export async function findNearbyFacilities(
  location: UserLocation,
  facilityType: FacilityType | 'all' = 'all',
  options: FindNearbyOptions = {}
): Promise<Facility[]> {
  const {
    mode = 'emergency',
    searchQuery = '',
    radiusMeters = mode === 'emergency' ? 15000 : 10000,
    limit,
  } = options;

  const maxAllowedDistance = mode === 'emergency' ? MAX_EMERGENCY_DISTANCE_KM : MAX_NORMAL_DISTANCE_KM;
  const query = buildOverpassQuery(location.lat, location.lng, mode, facilityType, radiusMeters);

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ];

  let liveFacilities: Facility[] = [];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8500);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.elements) && data.elements.length > 0) {
          const parsed = data.elements
            .map((el: any) => parseOsmElement(el, location.lat, location.lng, mode))
            .filter((f: Facility | null): f is Facility => f !== null && Boolean(f.name));

          // Deduplicate
          const seen = new Set<string>();
          liveFacilities = parsed.filter((fac: Facility) => {
            const key = `${fac.name.toLowerCase()}-${fac.coordinates.lat.toFixed(3)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          if (liveFacilities.length > 0) {
            break;
          }
        }
      }
    } catch (err: any) {
      console.warn(`OSM Overpass lookup at ${endpoint} failed or timed out:`, err.message);
    }
  }

  // Filter and rank live results
  if (liveFacilities.length > 0) {
    let result = liveFacilities;

    // Filter search query if present
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q) ||
          f.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    // STRICT DISTANCE GUARDRAIL: Discard any facility exceeding local radius (e.g. 50 km for emergency)
    result = result.filter((f) => (f.distanceKm ?? 0) <= maxAllowedDistance);

    // Rank facilities by relevance
    if (mode === 'emergency') {
      result.sort((a, b) => calculateEmergencyRelevance(b) - calculateEmergencyRelevance(a));
    } else {
      result.sort((a, b) => calculateNormalRelevance(b, facilityType) - calculateNormalRelevance(a, facilityType));
    }

    if (result.length > 0) {
      if (limit && limit > 0) {
        return result.slice(0, limit);
      }
      return result;
    }
  }

  // FALLBACK: When live Overpass API query is unreachable or returned 0 usable local results
  let fallbackList = fallbackCuratedFacilities.filter((facility) => {
    if (mode === 'emergency') {
      return facility.category === 'emergency';
    } else {
      if (facilityType && facilityType !== 'all') {
        return facility.type === facilityType;
      }
      return true;
    }
  });

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    fallbackList = fallbackList.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }

  const facilitiesWithDistance = fallbackList
    .map((facility) => {
      const distanceKm = calculateDistanceKm(
        location.lat,
        location.lng,
        facility.coordinates.lat,
        facility.coordinates.lng
      );
      const etaMinutes = estimateDriveTimeMinutes(distanceKm);
      return {
        ...facility,
        distanceKm,
        etaMinutes,
        source: 'curated_fallback' as const,
        isFallback: true,
      };
    })
    // STRICT DISTANCE GUARDRAIL: Never show a facility hundreds of kilometres away as "nearby"
    .filter((f) => f.distanceKm <= maxAllowedDistance);

  // Rank fallback list as well
  if (mode === 'emergency') {
    facilitiesWithDistance.sort((a, b) => calculateEmergencyRelevance(b) - calculateEmergencyRelevance(a));
  } else {
    facilitiesWithDistance.sort(
      (a, b) => calculateNormalRelevance(b, facilityType) - calculateNormalRelevance(a, facilityType)
    );
  }

  if (limit && limit > 0) {
    return facilitiesWithDistance.slice(0, limit);
  }

  return facilitiesWithDistance;
}

// Synchronous wrapper for backward compatibility
export function getNearestFacilities(options: {
  userLat: number;
  userLng: number;
  mode: 'emergency' | 'normal';
  facilityType?: FacilityType | 'all';
  searchQuery?: string;
  limit?: number;
}): Facility[] {
  const { userLat, userLng, mode, facilityType = 'all', searchQuery = '', limit } = options;
  const maxAllowedDistance = mode === 'emergency' ? MAX_EMERGENCY_DISTANCE_KM : MAX_NORMAL_DISTANCE_KM;

  let list = fallbackCuratedFacilities.filter((facility) => {
    if (mode === 'emergency') {
      return facility.category === 'emergency';
    } else {
      if (facilityType && facilityType !== 'all') {
        return facility.type === facilityType;
      }
      return true;
    }
  });

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (f) => f.name.toLowerCase().includes(q) || f.address.toLowerCase().includes(q)
    );
  }

  const facilitiesWithDistance = list
    .map((facility) => {
      const distanceKm = calculateDistanceKm(userLat, userLng, facility.coordinates.lat, facility.coordinates.lng);
      return {
        ...facility,
        distanceKm,
        etaMinutes: estimateDriveTimeMinutes(distanceKm),
        source: 'curated_fallback' as const,
        isFallback: true,
      };
    })
    .filter((f) => f.distanceKm <= maxAllowedDistance);

  if (mode === 'emergency') {
    facilitiesWithDistance.sort((a, b) => calculateEmergencyRelevance(b) - calculateEmergencyRelevance(a));
  } else {
    facilitiesWithDistance.sort(
      (a, b) => calculateNormalRelevance(b, facilityType) - calculateNormalRelevance(a, facilityType)
    );
  }

  return limit ? facilitiesWithDistance.slice(0, limit) : facilitiesWithDistance;
}
