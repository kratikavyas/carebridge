import {
  SessionContext,
  TriageResult,
  UserLocation,
  Language,
  CountryConfig,
  EscalationState,
} from '../types';
import { classifyTriage } from './triageClassifier';
import { detectCountryFromLocation } from './countryService';

export function createInitialContext(
  location?: UserLocation,
  language: Language = 'en'
): SessionContext {
  const country = detectCountryFromLocation(location);
  return {
    mode: 'normal',
    urgency: 'ROUTINE',
    situation: 'none',
    facilityType: 'general_physician',
    userLocation: location,
    country,
    language,
    previousUserMessages: [],
    previousAssistantActions: [],
    actionsAlreadyAttempted: [],
    escalationState: 'none',
  };
}

// Check if message is an emergency escalation failure ("no one is picking up")
function isEscalationFailure(query: string): boolean {
  const q = query.toLowerCase().trim();
  const escalationKeywords = [
    'no one is picking up',
    'nobody is picking up',
    'not picking up',
    'not answering',
    'nobody answering',
    'no answer',
    'phone nahi utha rahe',
    'call nahi utha rahe',
    'koi nahi utha raha',
    'phone cut gaya',
    'hospital is not picking up',
    'ambulance nahi aa rahi',
    'call busy',
    'not responding on call',
    'ring ho raha hai koi nahi utha raha',
    'কেউ ফোন তুলছে না',
    'ফোন ধরছে না',
    'না কেউ তুলছে না',
    'nadie contesta',
    'no contesta nadie',
    'personne ne répond',
    'ninguém atende',
    'لا أحد يرد',
    '没人接',
  ];
  return escalationKeywords.some((k) => q.includes(k));
}

// Check if message is a first aid / immediate action inquiry ("anything I can do?")
function isFirstAidInquiry(query: string): boolean {
  const q = query.toLowerCase().trim();
  const inquiryKeywords = [
    'anything i can do',
    'anything we can do',
    'what can i do',
    'what should i do',
    'how can i help',
    'kya karu',
    'kya kar sakte hain',
    'main kya karu',
    'first aid kya hai',
    'kya karna chahiye',
    'how to help',
    'what to do now',
    'কী করব',
    'কী করা উচিত',
    'আমি কী করতে পারি',
    'qué puedo hacer',
    'que puis-je faire',
    'o que posso fazer',
    'ماذا يمكنني أن أفعل',
    '我能做什么',
  ];
  return inquiryKeywords.some((k) => q.includes(k));
}

// Check if user explicitly indicates resolution
function isResolutionMessage(query: string): boolean {
  const q = query.toLowerCase().trim();
  const resolutionKeywords = [
    'ambulance arrived',
    'help has arrived',
    'doctor is here',
    'they are okay now',
    'problem solved',
    'all good now',
    'situation resolved',
    'madad aa gayi',
    'theek ho gaye',
  ];
  return resolutionKeywords.some((k) => q.includes(k));
}

// Check if message is a home remedy / self-care inquiry
function isHomeRemedyInquiry(query: string): boolean {
  const q = query.toLowerCase().trim();
  const remedyKeywords = [
    'home remedy', 'home remedies', 'remedy', 'remedies', 'gharelu upay', 'gharelu nuskhe', 'gharelu',
    'what can i do at home', 'anything i can do at home', 'treat at home', 'relief at home',
    'soothe', 'cure at home', 'any home remedy', 'home treatment', 'safe remedy', 'home care',
    'self care', 'self-care', 'natural remedy', 'natural relief', 'at home', 'ghar par',
    'ghar me', 'kya lagayein', 'kya lagau', 'kya karein',
    'remedios caseros', 'remède maison', 'remédio caseiro', 'علاج منزلي', '偏方', '居家',
    'ঘরোয়া প্রতিকার', 'ঘরোয়া চিকিৎসা'
  ];
  return remedyKeywords.some((k) => q.includes(k));
}

// Extract requested number of doctors/clinics (e.g. "suggest 10 doctors")
function extractRequestedCount(query: string): number | null {
  const q = query.toLowerCase();
  const digitMatch = q.match(/\b(\d+)\b/);
  if (digitMatch) {
    const num = parseInt(digitMatch[1], 10);
    if (num > 0 && num <= 50) return num;
  }
  const words: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    das: 10, paanch: 5, tin: 3, char: 4
  };
  for (const [w, val] of Object.entries(words)) {
    if (new RegExp(`\\b${w}\\b`).test(q)) return val;
  }
  return null;
}

// Check if message is asking for provider/doctor recommendations
function isProviderListRequest(query: string): boolean {
  const q = query.toLowerCase();
  const listKeywords = [
    'doctor', 'doctors', 'clinic', 'clinics', 'specialist', 'specialists', 'hospital', 'hospitals',
    'provider', 'providers', 'suggest', 'recommend', 'options', 'list', 'show me', 'find me',
    'dermatologist', 'dermatologists', 'pharmacy', 'pharmacies', 'dikhao', 'batao', 'dhoondo'
  ];
  return listKeywords.some((k) => q.includes(k));
}

// Check if message is asking about opening hours or "open right now"
function isOpenNowInquiry(query: string): boolean {
  const q = query.toLowerCase();
  const openKeywords = [
    'open right now', 'open now', 'are any open', 'is any open', 'any open', 'which one is open',
    'open today', 'currently open', 'khula hai', 'abhi khula', 'khula milega', 'open',
    'está abierto', 'ouvert maintenant', 'está aberto', 'مفتوح الآن', '现在开着吗', '开着吗', 'খোলা আছে কি'
  ];
  return openKeywords.some((k) => q.includes(k));
}

// Check if message is asking about cause or nature of condition ("what causes it?", "is it contagious?")
function isConditionInfoInquiry(query: string): boolean {
  const q = query.toLowerCase().trim();
  const infoKeywords = [
    'what causes', 'what is the cause', 'causes', 'cause', 'why does it happen', 'why do i have',
    'why is it', 'how long', 'how long does it last', 'is it contagious', 'will it spread',
    'is it serious', 'what to avoid', 'karan', 'kyun hota hai', 'kya wajah hai', 'faelta hai kya'
  ];
  return infoKeywords.some((k) => q.includes(k));
}

export function processConversationTurn(
  userQuery: string,
  currentContext: SessionContext | null,
  location?: UserLocation,
  language: Language = 'en'
): {
  triage: TriageResult;
  updatedContext: SessionContext;
  escalationState: EscalationState;
} {
  const country = detectCountryFromLocation(location);
  const emergencyNumber = country.emergencyNumber;
  const activeLang: Language = language || 'en';

  let ctx: SessionContext = currentContext || createInitialContext(location, activeLang);
  ctx.country = country;
  ctx.language = activeLang;
  if (location) ctx.userLocation = location;

  const normalized = userQuery.toLowerCase().trim();

  // 1. CHECK IF SITUATION IS RESOLVED
  if (isResolutionMessage(normalized)) {
    const resolvedTriage: TriageResult = {
      urgencyLevel: 'ROUTINE',
      intentCode: 'emergency_resolved',
      detectedCategory: 'Situation Resolved',
      detectedKeywords: [],
      conversationalResponse: {
        en: 'Glad to hear help has arrived or the situation is stable. CareBridge remains here if you need post-emergency care or follow-up clinics.',
        hi: 'यह सुनकर राहत मिली कि सहायता पहुँच गई है। आगे किसी भी क्लिनिक या दवा की आवश्यकता हो तो बताएं।',
        hinglish: 'Glad to know help aa gayi hai. Follow-up clinic ya medical care ke liye CareBridge hamesha available hai.',
        zh: '很高兴得知救援已到达。如需后续医疗或诊所，CareBridge 随时在此为您提供帮助。',
        es: 'Me alegra saber que la ayuda ha llegado. CareBridge sigue aquí si necesita atención médica de seguimiento.',
        fr: 'Ravi d\'apprendre que les secours sont arrivés. CareBridge reste à votre disposition.',
        pt: 'Fico feliz que a ajuda tenha chegado. O CareBridge continua à disposição se precisar de acompanhamento.',
        ar: 'يسعدني سماع وصول المساعدة. CareBridge متاح دائمًا إذا كنت بحاجة إلى رعاية لاحقة.',
        bn: 'সাহায্য পৌঁছে গেছে জেনে স্বস্তি পেলাম। পরবর্তীতে ডাক্তার বা ক্লিনিকের প্রয়োজন হলে কেয়ারব্রিজ রয়েছে।',
      },
      spokenResponse: {
        en: 'Glad to hear help has arrived. CareBridge remains available if you need follow-up care.',
        hi: 'सहायता पहुँच गई है, यह अच्छी बात है। CareBridge आपकी सेवा में उपलब्ध है।',
        hinglish: 'Glad help has arrived. CareBridge follow-up care ke liye available hai.',
      },
      immediateGuidance: {
        en: 'Cooperate with the medical team and provide them any relevant patient medical history.',
        hi: 'चिकित्सा दल को मरीज़ का पिछला मेडिकल इतिहास बताएं।',
        hinglish: 'Medical team ke sath cooperate karein.',
        bn: 'চিকিৎসা দলকে রোগীর পূর্ব ইতিহাস জানান।',
      },
      doNots: {
        en: 'Do not interrupt emergency medical staff while they administer critical care.',
        hi: 'इलाज के दौरान मेडिकल स्टाफ को न टोकें।',
        hinglish: 'Emergency staff ko unke kaam ke dauran interrupt na karein.',
        bn: 'চিকিৎসক ও স্বাস্থ্যকর্মীদের কাজে ব্যাঘাত ঘটাবেন না।',
      },
      recommendedFacilityType: 'general_physician',
      suggestSwitchToNormal: true,
      confidenceScore: 0.95,
    };

    const updatedContext: SessionContext = {
      ...ctx,
      mode: 'normal',
      urgency: 'ROUTINE',
      situation: 'resolved',
      escalationState: 'resolved',
      previousUserMessages: [...ctx.previousUserMessages, userQuery],
      previousAssistantActions: [...ctx.previousAssistantActions, 'resolved_notice'],
    };

    return { triage: resolvedTriage, updatedContext, escalationState: 'resolved' };
  }

  // 2. ACTIVE EMERGENCY CONTEXT PERSISTENCE:
  // If we are currently in an active emergency state (e.g. unresponsive person, cardiac, trauma)
  if (ctx.mode === 'emergency' && (ctx.urgency === 'CRITICAL' || ctx.urgency === 'URGENT')) {
    // 2A. ESCALATION FAILURE ("No one is picking up")
    if (isEscalationFailure(normalized)) {
      const escalationTriage: TriageResult = {
        urgencyLevel: 'CRITICAL',
        intentCode: 'emergency_unanswered_escalation',
        detectedCategory: 'Emergency Escalation — Facility Unreachable',
        detectedKeywords: ['no one is picking up'],
        conversationalResponse: {
          en: `DO NOT WAIT ON THE PHONE. Dial ${emergencyNumber} immediately for emergency dispatch, or start direct transport to the nearest emergency hospital below.`,
          hi: `फोन पर बिल्कुल प्रतीक्षा न करें! सीधे ${emergencyNumber} पर कॉल करें, या नीचे दिए गए सबसे नजदीकी अस्पताल ले जाने की व्यवस्था करें।`,
          hinglish: `Phone ring hone ka wait bilkul mat kijiye! Turant ${emergencyNumber} emergency dial karein ya patient ko direct pass ke emergency hospital le jayein.`,
          zh: `不要继续等电话。请立即拨打 ${emergencyNumber} 呼叫紧急救援，或直接前往下方最近的急救医院。`,
          es: `NO ESPERE AL TELÉFONO. Llame al ${emergencyNumber} de inmediato para emergencias, o traslade a la persona al hospital más cercano.`,
          fr: `N'ATTENDEZ PAS AU TÉLÉPHONE. Composez immédiatement le ${emergencyNumber} ou partez vers l'hôpital d'urgence le plus proche.`,
          pt: `NÃO ESPERE NO TELEFONE. Ligue imediatamente para ${emergencyNumber} ou inicie o transporte para o hospital de emergência mais próximo.`,
          ar: `لا تنتظر على الهاتف. اتصل برقم ${emergencyNumber} فورًا لطلب الإسعاف أو توجه فورًا إلى أقرب مستشفى طوارئ.`,
          bn: `ফোনের অপেক্ষায় সময় নষ্ট করবেন না! অবিলম্বে ${emergencyNumber}-এ কল করুন অথবা সরাসরি নিচের নিকটতম হাসপাতালে রওনা হন।`,
        },
        spokenResponse: {
          en: `Do not wait on the phone. Dial ${emergencyNumber} now, or start transport directly to the nearest hospital.`,
          hi: `फोन पर प्रतीक्षा न करें। तुरंत ${emergencyNumber} मिलाएं या नजदीकी अस्पताल ले जाएं।`,
          hinglish: `Phone par wait mat kijiye. Turant ${emergencyNumber} milayein ya pass ke hospital le jayein.`,
          zh: `不要等电话。立即拨打 ${emergencyNumber} 或前往最近的医院。`,
          es: `No espere al teléfono. Llame al ${emergencyNumber} ahora o traslade al hospital más cercano.`,
          fr: `N'attendez pas au téléphone. Composez le ${emergencyNumber} maintenant.`,
          pt: `Não espere no telefone. Ligue para ${emergencyNumber} agora.`,
          ar: `لا تنتظر على الهاتف. اتصل برقم ${emergencyNumber} فورًا.`,
          bn: `ফোনে অপেক্ষা করবেন না। অবিলম্বে ${emergencyNumber}-এ কল করুন।`,
        },
        immediateGuidance: {
          en: '1. Dial emergency dispatch immediately. 2. Keep airway clear in recovery position if breathing. 3. Begin CPR if not breathing. 4. Navigate directly to the nearest emergency facility.',
          hi: '1. तुरंत आपातकालीन नंबर मिलाएं। 2. सांस चल रही है तो करवट दिलाकर रखें। 3. सांस बंद होने पर तुरंत सीपीआर शुरू करें। 4. सीधे नजदीकी अस्पताल चलें।',
          hinglish: '1. Turant emergency number dial karein. 2. Saans chal rahi hai toh side par litayein. 3. Saans band hai toh CPR shuru karein. 4. Pass ke hospital pahuchein.',
          bn: '১. অবিলম্বে জরুরী নম্বরে কল করুন। ২. শ্বাস চললে একপাশে কাত করে রাখুন। ৩. শ্বাস বন্ধ হলে সিপিআর শুরু করুন। ৪. দ্রুত হাসপাতালে রওনা হন।',
        },
        doNots: {
          en: 'DO NOT keep waiting on ringing local hospital lines. DO NOT give water or liquids to an unconscious person.',
          hi: 'फोन बजने के इंतजार में समय न गवाएं। बेहोश व्यक्ति को पानी न दें।',
          hinglish: 'Phone bajne ka wait na karein. Behosh insaan ko paani na dein.',
          bn: 'ফোনের অপেক্ষায় সময় নষ্ট করবেন না। অজ্ঞান ব্যক্তিকে জল দেবেন না।',
        },
        recommendedFacilityType: ctx.facilityType || 'icu_hospital',
        suggestSwitchToNormal: false,
        confidenceScore: 0.98,
      };

      const updatedContext: SessionContext = {
        ...ctx,
        escalationState: 'facility_unreachable',
        previousUserMessages: [...ctx.previousUserMessages, userQuery],
        previousAssistantActions: [...ctx.previousAssistantActions, 'escalate_112_and_direct_transport'],
        actionsAlreadyAttempted: [...ctx.actionsAlreadyAttempted, 'call_hospital_unanswered'],
      };

      return { triage: escalationTriage, updatedContext, escalationState: 'facility_unreachable' };
    }

    // 2B. FIRST AID / IMMEDIATE GUIDANCE INQUIRY ("Anything I can do?")
    if (isFirstAidInquiry(normalized)) {
      const isUnresponsive = ctx.situation === 'unresponsive_person' || ctx.situation === 'neurological_emergency';

      const guidanceTriage: TriageResult = {
        urgencyLevel: 'CRITICAL',
        intentCode: 'emergency_firstaid_inquiry',
        detectedCategory: 'Immediate First-Aid Guidance',
        detectedKeywords: ['first aid inquiry', 'active emergency context'],
        conversationalResponse: {
          en: isUnresponsive
            ? `Immediate life-saving actions while waiting for emergency dispatch (${emergencyNumber}):\n1. Check whether they are breathing normally.\n2. If breathing normally: place them safely on their side (recovery position) to keep the airway open.\n3. If NOT breathing normally: begin CPR chest compressions immediately (push hard and fast in the center of the chest).\n4. Do not give water, food, or medicine. Do not leave them alone.`
            : `Immediate actions while emergency help is en route:\n1. Keep the person completely still and calm.\n2. Loosen any tight clothing around their neck or chest.\n3. Keep them in a comfortable seated position with support.\n4. Call ${emergencyNumber} if you have not already done so.`,
          hi: isUnresponsive
            ? `आपातकालीन सहायता (${emergencyNumber}) आने तक तुरंत यह करें:\n1. देखें कि क्या मरीज़ सामान्य रूप से सांस ले रहा है।\n2. यदि सांस चल रही है: उन्हें करवट दिलाकर (रिकवरी पोज़ीशन) लिटाएं ताकि सांस की नली खुली रहे।\n3. यदि सांस नहीं चल रही: तुरंत सीपीआर (छाती के बीच में तेज और गहरा दबाव) शुरू करें।\n4. बेहोश व्यक्ति के मुंह में कभी पानी या दवा न डालें। उन्हें अकेला न छोड़ें।`
            : `मदद आने तक तुरंत यह करें:\n1. मरीज़ को शांत और स्थिर रखें।\n2. कपड़े ढीले करें।\n3. यदि सीने में दर्द है तो सीधा बैठाकर रखें।\n4. यदि 112 पर कॉल नहीं किया है तो तुरंत करें।`,
          hinglish: isUnresponsive
            ? `Emergency dispatch (${emergencyNumber}) aane tak ye steps follow karein:\n1. Check karein ki saans theek se chal rahi hai ya nahi.\n2. Saans chal rahi hai toh side (karwat) par litayein taaki airway clear rahe.\n3. Saans nahi chal rahi toh turant CPR compressions shuru karein.\n4. Paani ya dawai bilkul na dein. Unhe akela na chhodein.`
            : `Help aane tak patient ko shant rakhein, tight kapde loose karein aur sidha baithayein. ${emergencyNumber} par call zaroor karein.`,
          zh: isUnresponsive
            ? `在等待救援 (${emergencyNumber}) 时的紧急第一响应：\n1. 检查患者是否正常呼吸。\n2. 若正常呼吸：将其侧卧（复原体位）以保持呼吸道通畅。\n3. 若无呼吸或仅有喘息：立即开始胸外按压 (CPR)。\n4. 切勿喂水、食物或药物。不要离开患者。`
            : `在救援到达前：保持患者安静平躺，解开衣领，立即拨打 ${emergencyNumber}。`,
          es: isUnresponsive
            ? `Medidas inmediatas mientras llega la ayuda (${emergencyNumber}):\n1. Compruebe si respira con normalidad.\n2. Si respira: colóquelo de lado (posición de recuperación) para mantener la vía aérea despejada.\n3. Si NO respira: inicie reanimación cardiopulmonar (RCP) de inmediato.\n4. No le dé agua ni medicamentos. No lo deje solo.`
            : `Mantenga a la persona en reposo y calmada. Llame al ${emergencyNumber} de inmediato.`,
          fr: isUnresponsive
            ? `Gestes d'urgence en attendant les secours (${emergencyNumber}) :\n1. Vérifiez s'il respire normalement.\n2. Si oui : placez-le en position latérale de sécurité (PLS).\n3. Si non : commencez immédiatement le massage cardiaque (RCP).\n4. Ne donnez ni eau ni médicament. Ne le laissez pas seul.`
            : `Gardez la personne calme et au repos. Appelez le ${emergencyNumber}.`,
          pt: isUnresponsive
            ? `Ações imediatas enquanto aguarda o socorro (${emergencyNumber}):\n1. Verifique se a pessoa respira normalmente.\n2. Se respirar: coloque-a de lado (posição lateral de segurança).\n3. Se NÃO respirar: inicie RCP imediatamente.\n4. Não dê água nem remédios. Não a deixe sozinha.`
            : `Mantenha a pessoa calma e estável. Ligue para o ${emergencyNumber}.`,
          ar: isUnresponsive
            ? `الإسعافات الأولية الفورية أثناء انتظار الإسعاف (${emergencyNumber}):\n1. تحقق مما إذا كان يتنفس بشكل طبيعي.\n2. إذا كان يتنفس: ضعه على جانبه (وضعية الإفاقة) لإبقاء مجرى التنفس مفتوحًا.\n3. إذا كان لا يتنفس: ابدأ فورًا بالضغطات الصدرية (الإنعاش القلبي الرئوي).\n4. لا تعطه ماءً أو دواءً. لا تتركه بمفرده.`
            : `حافظ على هدوء المريض واستقراره، واتصل برقم ${emergencyNumber}.`,
          bn: isUnresponsive
            ? `জরুরী সাহায্য (${emergencyNumber}) আসার পূর্বে করণীয়:\n১. স্বাভাবিকভাবে শ্বাস নিচ্ছে কিনা দেখুন।\n২. শ্বাস চললে: একপাশে কাত করে রাখুন যাতে শ্বাসপথ পরিষ্কার থাকে।\n৩. শ্বাস না চললে: অবিলম্বে সিপিআর (বুকে চাপ) শুরু করুন।\n৪. মুখে জল বা ওষুধ দেবেন না। রোগীকে একা রাখবেন না।`
            : `রোগীকে শান্ত ও স্থির রাখুন। অবিলম্বে ${emergencyNumber}-এ কল করুন।`,
        },
        spokenResponse: {
          en: isUnresponsive
            ? 'Check whether they are breathing normally. If breathing, place them on their side. If not breathing, begin CPR chest compressions immediately. Do not give water or medicine.'
            : 'Keep the person completely still and calm. Loosen tight clothing and stay with them.',
          hi: isUnresponsive
            ? 'सांस जांचें। यदि सांस चल रही है तो करवट दिलाकर रखें। यदि सांस नहीं चल रही तो तुरंत सीपीआर शुरू करें। पानी बिल्कुल न दें।'
            : 'मरीज़ को शांत और स्थिर रखें। कपड़े ढीले करें और साथ रहें।',
          hinglish: isUnresponsive
            ? 'Saans check karein. Saans chal rahi hai toh side par litayein, nahi chal rahi toh turant CPR shuru karein. Paani bilkul na dein.'
            : 'Patient ko shant rakhein aur sath bane rahein.',
          zh: isUnresponsive ? '检查呼吸。若有呼吸请侧卧；若无呼吸请立即进行心肺复苏。切勿喂水。' : '保持患者平静，解开衣物。',
          es: isUnresponsive ? 'Compruebe si respira. Si respira colóquelo de lado; si no, inicie RCP de inmediato. No dé agua.' : 'Mantenga a la persona calmada.',
          fr: isUnresponsive ? 'Vérifiez la respiration. Si oui, placez en PLS. Si non, massez immédiatement. Pas d\'eau.' : 'Gardez la personne calme.',
          pt: isUnresponsive ? 'Verifique a respiração. Se respirar, vire de lado; se não, inicie RCP. Não dê água.' : 'Mantenha a pessoa calma.',
          ar: isUnresponsive ? 'تحقق من التنفس. إذا كان يتنفس ضعه على جانبه، وإلا ابدأ الإنعاش فورًا. لا تعطه ماء.' : 'حافظ على هدوء المريض.',
          bn: isUnresponsive ? 'শ্বাস চলছে কিনা দেখুন। শ্বাস চললে কাত করে রাখুন, না চললে অবিলম্বে সিপিআর শুরু করুন। জল দেবেন না।' : 'রোগীকে শান্ত রাখুন।',
        },
        immediateGuidance: {
          en: 'Follow the 4 life-saving actions above. Keep emergency dispatch on speaker phone if connected.',
          hi: 'ऊपर दिए गए 4 चरणों का पालन करें। फोन को स्पीकर पर रखें।',
          hinglish: 'Upar bataye 4 steps follow karein. Phone speaker par rakhein.',
          bn: 'উপরের ৪টি জীবনরক্ষাকারী পদক্ষেপ অনুসরণ করুন।',
        },
        doNots: {
          en: 'DO NOT leave the person unattended. DO NOT shake violently.',
          hi: 'मरीज़ को अकेला न छोड़ें। जोर से न झकझोरें।',
          hinglish: 'Patient ko akela na chhodein.',
          bn: 'রোগীকে একা রাখবেন না।',
        },
        recommendedFacilityType: ctx.facilityType || 'icu_hospital',
        suggestSwitchToNormal: false,
        confidenceScore: 0.99,
      };

      const updatedContext: SessionContext = {
        ...ctx,
        escalationState: 'guidance_requested',
        previousUserMessages: [...ctx.previousUserMessages, userQuery],
        previousAssistantActions: [...ctx.previousAssistantActions, 'provided_immediate_firstaid'],
      };

      return { triage: guidanceTriage, updatedContext, escalationState: 'guidance_requested' };
    }
  }

  // 3. EMERGENCY EVALUATION:
  // If fresh triage triggers an emergency (even if previously in normal mode), emergency takes precedence!
  const freshTriage = classifyTriage(userQuery);
  const isEmergency = freshTriage.urgencyLevel === 'CRITICAL' || freshTriage.urgencyLevel === 'URGENT';

  if (isEmergency) {
    const updatedContext: SessionContext = {
      ...ctx,
      mode: 'emergency',
      urgency: freshTriage.urgencyLevel,
      situation: freshTriage.intentCode || 'general_concern',
      facilityType: freshTriage.recommendedFacilityType,
      escalationState: 'none',
      previousUserMessages: [...ctx.previousUserMessages, userQuery],
      previousAssistantActions: [...ctx.previousAssistantActions, `classified_${freshTriage.urgencyLevel}`],
    };
    return { triage: freshTriage, updatedContext, escalationState: 'none' };
  }

  // 4. NORMAL-CARE FOLLOW-UP CONTEXT PERSISTENCE
  // If we have an active non-emergency concern or specialty (e.g. dermatology / skin rash, gynecology, pharmacy):
  const hasActiveNormalContext =
    ctx.mode === 'normal' &&
    ctx.facilityType &&
    ctx.situation &&
    ctx.situation !== 'none' &&
    ctx.situation !== 'resolved';

  if (hasActiveNormalContext) {
    const isSkinRash = ctx.situation === 'skin_rash' || ctx.facilityType === 'dermatology';
    const specLabel = ctx.facilityType === 'dermatology' ? 'dermatology' : ctx.facilityType.replace(/_/g, ' ');

    // 4A. HOME REMEDY / SELF-CARE INQUIRY ("Any home remedy?", "anything i can do at home", etc.)
    if (isHomeRemedyInquiry(normalized)) {
      const remedyTriage: TriageResult = {
        urgencyLevel: 'ROUTINE',
        intentCode: ctx.situation || 'skin_rash',
        detectedCategory: isSkinRash ? 'Dermatology / Home Comfort Guidance' : 'General Self-Care & Relief Advice',
        detectedKeywords: ['home remedy', 'active concern context'],
        conversationalResponse: {
          en: isSkinRash
            ? 'For an itchy skin rash, gentle self-care measures include keeping the area clean and dry, applying a cool damp cloth to soothe itching, wearing loose breathable cotton clothing, and avoiding scratching to prevent secondary bacterial infection. Avoid unverified steroid ointments or harsh soaps. If the rash spreads rapidly, blisters, or is accompanied by fever, consult a dermatologist promptly.'
            : 'For non-emergency symptom relief, rest, stay well-hydrated, and avoid self-medicating with unprescribed drugs. If symptoms persist or worsen, consult the appropriate healthcare provider.',
          hi: isSkinRash
            ? 'त्वचा के रैश और खुजली के लिए सुरक्षित घरेलू राहत: प्रभावित हिस्से को साफ और सूखा रखें, जलन कम करने के लिए ठंडे पानी की पट्टी लगाएं, ढीले सूती कपड़े पहनें और खुजलाने से बचें ताकि संक्रमण न फैले। तेज साबुन या बिना डॉक्टरी सलाह वाली क्रीम न लगाएं। यदि रैश तेजी से बढ़े, तो चर्म रोग विशेषज्ञ को दिखाएं।'
            : 'लक्षणों में राहत के लिए पर्याप्त आराम करें, खूब पानी पिएं और बिना डॉक्टर की सलाह दवा न लें। समस्या जारी रहने पर विशेषज्ञ से परामर्श करें।',
          hinglish: isSkinRash
            ? 'Skin rash aur itching ke liye safe home remedies: Area ko clean aur dry rakhein, khujli kam karne ke liye cool damp cloth (thandi patti) lagayein, loose cotton kapde pehnein aur scratch bilkul na karein. Bina doctor prescription koi steroid cream na lagayein. Rash badhne par dermatologist ko consult karein.'
            : 'Symptom relief ke liye rest karein aur hydrated rahein. Doctor consultation ke liye verified clinics niche listed hain.',
          zh: isSkinRash
            ? '对于发痒的皮疹，安全的居家舒缓措施包括：使用冷湿毛巾冷敷缓解瘙痒，保持皮肤清洁干燥，穿着宽松透气纯棉衣物，避免抓挠以防继发感染。切勿滥用激素软膏。如皮疹加重请及时就诊皮肤科。'
            : '请多休息、补充水分，避免自行服用未经医嘱的药物。如症状持续，请咨询专科医生。',
          es: isSkinRash
            ? 'Para una erupción cutánea con picazón, las medidas de alivio en el hogar incluyen aplicar compresas frías y húmedas, mantener la piel limpia y seca, usar ropa holgada de algodón y evitar rascarse para prevenir infecciones. No aplique cremas sin prescripción médica. Si empeora, consulte a un dermatólogo.'
            : 'Para alivio de síntomas, descanse, manténgase hidratado y evite automedicarse. Consulte a un médico si los síntomas persisten.',
          fr: isSkinRash
            ? 'Pour une éruption cutanée avec démangeaisons, appliquez des compresses fraîches, portez des vêtements amples en coton et évitez de vous gratter. N\'appliquez pas de crème sans avis médical. Si les symptômes s\'étendent, consultez un dermatologue.'
            : 'Reposez-vous, hydratez-vous et évitez l\'automédication. Consultez un praticien si besoin.',
          pt: isSkinRash
            ? 'Para erupções cutâneas com coceira, mantenha a pele limpa, aplique compressas frias e evite coçar. Não use pomadas sem receita médica. Consulte um dermatologista se piorar.'
            : 'Descanse, beba bastante água e evite automedicação. Consulte um especialista se persistir.',
          ar: isSkinRash
            ? 'لتخفيف حكة الطفح الجلدي: ضع كمادات ماء بارد، حافظ على نظافة الجلد وتجنب الحك منعاً للعدوى. لا تستخدم مراهم بدون استشارة الطبيب. استشر طبيب جلدية إذا زادت الأعراض.'
            : 'للتخفيف من الأعراض: التزم بالراحة واشرب سوائل كافية، واستشر الطبيب المختص.',
          bn: isSkinRash
            ? 'চুলকানিযুক্ত র‍্যাশের জন্য ঘরোয়া আরামদায়ক যত্ন: ত্বক পরিষ্কার ও শুকনো রাখুন, ঠান্ডা সেঁক দিন এবং নখ দিয়ে চুলকাবেন না যাতে ইনফেকশন না হয়। ডাক্তারের পরামর্শ ছাড়া মলম লাগাবেন না। সমস্যা বাড়লে চর্মরোগ বিশেষজ্ঞ দেখান।'
            : 'পর্যাপ্ত বিশ্রাম নিন এবং পানি পান করুন। প্রয়োজন হলে চিকিৎসকের পরামর্শ নিন।',
        },
        spokenResponse: {
          en: isSkinRash
            ? 'Keep the rash clean and dry, apply a cool damp cloth to relieve itching, and avoid scratching. Consult a dermatologist if symptoms worsen.'
            : 'Rest and stay hydrated. Consult a doctor if symptoms persist or worsen.',
          hi: isSkinRash
            ? 'रैश को साफ रखें, ठंडे पानी की पट्टी लगाएं और खुजलाने से बचें। लक्षण बढ़ने पर चर्म रोग विशेषज्ञ को दिखाएं।'
            : 'आराम करें और पानी पिएं। समस्या जारी रहने पर डॉक्टर को दिखाएं।',
          hinglish: isSkinRash
            ? 'Rash par thandi patti lagayein aur scratch na karein. Problem badhne par dermatologist ko dikhayein.'
            : 'Rest karein aur hydrated rahein. Doctor ko dikhana behtar hai.',
          zh: isSkinRash
            ? '保持皮疹清洁干燥，冷敷缓解瘙痒，避免抓挠。如加重请就诊皮肤科。'
            : '请多休息，症状持续请咨询医生。',
          es: isSkinRash
            ? 'Mantenga la piel limpia y use compresas frías. Evite rascarse y consulte a un dermatólogo si empeora.'
            : 'Descanse y consulte a un médico si los síntomas persisten.',
          fr: isSkinRash
            ? 'Gardez la peau propre et appliquez du frais. Consultez un dermatologue si cela persiste.'
            : 'Reposez-vous et consultez un médecin si besoin.',
          pt: isSkinRash
            ? 'Mantenha a pele limpa e use compressas frias. Consulte um dermatologista se piorar.'
            : 'Descanse e consulte um médico se persistir.',
          ar: isSkinRash
            ? 'حافظ على نظافة الجلد وضع كمادات باردة وتجنب الحك. استشر طبيب جلدية إذا زادت الأعراض.'
            : 'التزم بالراحة واستشر الطبيب إذا لزم الأمر.',
          bn: isSkinRash
            ? 'র‍্যাশ পরিষ্কার রাখুন, ঠান্ডা সেঁক দিন এবং চুলকাবেন না। সমস্যা বাড়লে চর্মরোগ বিশেষজ্ঞ দেখান।'
            : 'বিশ্রাম নিন এবং প্রয়োজনে ডাক্তারের পরামর্শ নিন।',
        },
        actionPrompt: {
          en: isSkinRash ? 'Nearby Dermatology Providers' : 'Nearby Healthcare Providers',
          hi: isSkinRash ? 'नजदीकी त्वचा विशेषज्ञ' : 'नजदीकी चिकित्सक',
          hinglish: isSkinRash ? 'Pass ke skin clinics' : 'Pass ke clinics',
          bn: isSkinRash ? 'নিকটবর্তী চর্মরোগ ক্লিনিক' : 'নিকটবর্তী ক্লিনিক',
        },
        immediateGuidance: {
          en: isSkinRash
            ? 'Cool compress, loose cotton clothing, avoid scratching or unverified ointments.'
            : 'Rest, hydration, and medical consultation if symptoms persist.',
          hi: isSkinRash
            ? 'ठंडी पट्टी, ढीले सूती कपड़े, खुजलाने से बचें।'
            : 'आराम करें और तरल पदार्थ लें।',
          hinglish: 'Cool compress, loose cotton clothes, no scratching.',
          bn: 'ঠান্ডা সেঁক, সুতির পোশাক, চুলকানো পরিহার করুন।',
        },
        doNots: {
          en: isSkinRash
            ? 'DO NOT scratch vigorously, use scalding hot water, or apply strong topical steroids without doctor prescription.'
            : 'DO NOT ignore worsening symptoms or take unprescribed antibiotics.',
          hi: isSkinRash
            ? 'तेज न खुजलाएं, बहुत गर्म पानी न डालें और बिना सलाह स्टेरॉयड क्रीम न लगाएं।'
            : 'दवाइयां खुद से न लें।',
          hinglish: 'Scratch na karein, hot water avoid karein aur steroid cream na lagayein.',
          bn: 'নখ দিয়ে চুলকাবেন না এবং না জেনে কোনো মলম লাগাবেন না।',
        },
        recommendedFacilityType: ctx.facilityType,
        suggestSwitchToNormal: false,
        confidenceScore: 0.95,
      };

      const updatedContext: SessionContext = {
        ...ctx,
        previousUserMessages: [...ctx.previousUserMessages, userQuery],
        previousAssistantActions: [...ctx.previousAssistantActions, 'provided_home_remedy_guidance'],
      };

      return { triage: remedyTriage, updatedContext, escalationState: 'none' };
    }

    // 4B. PROVIDER LIST / COUNT REQUEST ("Suggest 10 doctors", "show 10 clinics", etc.)
    if (isProviderListRequest(normalized)) {
      const requestedCount = extractRequestedCount(normalized) || 10;

      const listTriage: TriageResult = {
        urgencyLevel: 'ROUTINE',
        intentCode: ctx.situation || 'specialty_provider_list',
        detectedCategory: `${specLabel.toUpperCase()} Providers (Up to ${requestedCount})`,
        detectedKeywords: ['provider list request', 'active specialty context'],
        conversationalResponse: {
          en: `Here are verified ${specLabel} providers located near you (displaying up to ${requestedCount}):`,
          hi: `यहाँ आपके नजदीकी सत्यापित ${specLabel === 'dermatology' ? 'चर्म रोग विशेषज्ञ (Dermatologist)' : specLabel} उपलब्ध हैं (अधिकतम ${requestedCount}):`,
          hinglish: `Ye rahe aapke paas ke verified ${specLabel} providers (up to ${requestedCount}):`,
          zh: `以下是您附近的专业${specLabel === 'dermatology' ? '皮肤科' : specLabel}医生与诊所（最多显示 ${requestedCount} 家）：`,
          es: `Aquí tiene especialistas en ${specLabel === 'dermatology' ? 'dermatología' : specLabel} verificados cerca de usted (hasta ${requestedCount}):`,
          fr: `Voici les spécialistes en ${specLabel === 'dermatology' ? 'dermatologie' : specLabel} proches de vous (jusqu'à ${requestedCount}) :`,
          pt: `Aqui estão especialistas em ${specLabel === 'dermatology' ? 'dermatologia' : specLabel} verificados perto de você (até ${requestedCount}):`,
          ar: `إليك أطباء ${specLabel === 'dermatology' ? 'الجلدية' : specLabel} المعتمدين بالقرب منك (حتى ${requestedCount}):`,
          bn: `এখানে আপনার নিকটবর্তী যাচাইকৃত ${specLabel === 'dermatology' ? 'চর্মরোগ বিশেষজ্ঞ' : specLabel} তালিকাভুক্ত করা হলো (সর্বোচ্চ ${requestedCount}টি):`,
        },
        spokenResponse: {
          en: `Displaying verified ${specLabel} providers near your location.`,
          hi: `नजदीकी सत्यापित विशेषज्ञ स्क्रीन पर दिखाए जा रहे हैं।`,
          hinglish: `Pass ke verified doctors screen par display ho rahe hain.`,
          zh: `已为您显示附近的专业诊所。`,
          es: `Mostrando especialistas verificados cerca de su ubicación.`,
          fr: `Affichage des praticiens vérifiés près de chez vous.`,
          pt: `Exibindo especialistas verificados perto de você.`,
          ar: `عرض الأطباء المعتمدين بالقرب من موقعك.`,
          bn: `নিকটস্থ যাচাইকৃত চিকিৎসকদের তালিকা প্রদর্শিত হচ্ছে।`,
        },
        actionPrompt: {
          en: `Verified ${specLabel} Providers`,
          hi: `सत्यापित विशेषज्ञ`,
          hinglish: `Verified ${specLabel} clinics`,
          bn: `যাচাইকৃত ক্লিনিকসমূহ`,
        },
        immediateGuidance: {
          en: `Select a verified ${specLabel} clinic above for contact details and navigation.`,
          hi: `उपरोक्त सूची में से किसी भी विशेषज्ञ का संपर्क या रास्ता देखें।`,
          hinglish: `Upar di gayi list me se doctor choose karein.`,
          bn: `যোগাযোগ বা দিকনির্দেশের জন্য উপরের তালিকা দেখুন।`,
        },
        doNots: {
          en: 'DO NOT visit unverified practitioners for specialized medical care.',
          hi: 'बिना योग्यता वाले झोलाछाप डॉक्टरों से बचें।',
          hinglish: 'Unverified doctors ke pass na jayein.',
          bn: 'অনিবন্ধিত ব্যক্তিদের থেকে চিকিৎসা নেবেন না।',
        },
        recommendedFacilityType: ctx.facilityType,
        suggestSwitchToNormal: false,
        confidenceScore: 0.98,
      };

      const updatedContext: SessionContext = {
        ...ctx,
        requestedLimit: requestedCount,
        previousUserMessages: [...ctx.previousUserMessages, userQuery],
        previousAssistantActions: [...ctx.previousAssistantActions, `requested_${requestedCount}_providers`],
      };

      return { triage: listTriage, updatedContext, escalationState: 'none' };
    }

    // 4C. OPENING HOURS FILTER ("Are any open right now?", "open now", etc.)
    if (isOpenNowInquiry(normalized)) {
      const openNowTriage: TriageResult = {
        urgencyLevel: 'ROUTINE',
        intentCode: ctx.situation || 'open_now_query',
        detectedCategory: `${specLabel.toUpperCase()} Availability & Hours`,
        detectedKeywords: ['open now inquiry', 'active specialty context'],
        conversationalResponse: {
          en: `Checking verified opening hours for nearby ${specLabel} clinics. Currently open and 24/7 providers are prioritized below:`,
          hi: `नजदीकी ${specLabel === 'dermatology' ? 'त्वचा विशेषज्ञों' : specLabel} के खुलने का समय जांचा जा रहा है। वर्तमान में खुले केंद्र नीचे प्राथमिकता से सूचीबद्ध हैं:`,
          hinglish: `Pass ke ${specLabel} clinics ke opening hours check ho rahe hain. Jo abhi open hain unhe upar rakha gaya hai:`,
          zh: `正在核对附近${specLabel === 'dermatology' ? '皮肤科' : specLabel}诊所的营业时间。当前营业及24小时机构已优先排在前方：`,
          es: `Comprobando horarios de atención de clínicas de ${specLabel === 'dermatology' ? 'dermatología' : specLabel} cercanas. Los centros abiertos se muestran primero:`,
          fr: `Vérification des horaires d'ouverture des praticiens en ${specLabel === 'dermatology' ? 'dermatologie' : specLabel}. Les centres ouverts sont priorisés :`,
          pt: `Verificando horários de funcionamento das clínicas de ${specLabel === 'dermatology' ? 'dermatologia' : specLabel}. Locais abertos agora estão em destaque:`,
          ar: `جارٍ التحقق من ساعات العمل لعيادات ${specLabel === 'dermatology' ? 'الجلدية' : specLabel} القريبة. العيادات المفتوحة حالياً مُرتبة أولاً:`,
          bn: `নিকটবর্তী ${specLabel === 'dermatology' ? 'চর্মরোগ ক্লিনিকসমূহের' : specLabel} খোলার সময় যাচাই করা হচ্ছে। বর্তমানে খোলা কেন্দ্রসমূহ উপরে দেখানো হলো:`,
        },
        spokenResponse: {
          en: `Checking verified opening hours for nearby ${specLabel} clinics.`,
          hi: `नजदीकी क्लीनिकों के खुलने का समय जांचा जा रहा है।`,
          hinglish: `Clinics ke opening hours check ho rahe hain.`,
          zh: `正在核对附近诊所的营业时间。`,
          es: `Comprobando horarios de atención de clínicas cercanas.`,
          fr: `Vérification des horaires d'ouverture des cliniques proches.`,
          pt: `Verificando horários de funcionamento das clínicas próximas.`,
          ar: `جارٍ التحقق من ساعات العمل للعيادات القريبة.`,
          bn: `নিকটবর্তী ক্লিনিকসমূহের খোলার সময় যাচাই করা হচ্ছে।`,
        },
        actionPrompt: {
          en: `Open ${specLabel} Clinics`,
          hi: `खुले हुए केंद्र`,
          hinglish: `Open clinics`,
          bn: `খোলা ক্লিনিক`,
        },
        immediateGuidance: {
          en: 'Please call ahead to confirm walk-in appointments before traveling.',
          hi: 'जाने से पहले फोन करके डॉक्टर की उपलब्धता की पुष्टि कर लें।',
          hinglish: 'Jaane se pehle phone karke confirm kar lein.',
          bn: 'যাওয়ার আগে ফোনে নিশ্চিত হয়ে নিন।',
        },
        doNots: {
          en: 'DO NOT rely on unverified opening hours without calling ahead.',
          hi: 'बिना फोन किए बंद क्लीनिक पर न जाएं।',
          hinglish: 'Bina confirm kare direct na jayein.',
          bn: 'ফোনে কথা না বলে সরাসরি যাবেন না।',
        },
        recommendedFacilityType: ctx.facilityType,
        suggestSwitchToNormal: false,
        confidenceScore: 0.95,
      };

      const updatedContext: SessionContext = {
        ...ctx,
        language: activeLang,
        filterOpenNow: true,
        previousUserMessages: [...ctx.previousUserMessages, userQuery],
        previousAssistantActions: [...ctx.previousAssistantActions, 'filtered_open_now'],
      };

      return { triage: openNowTriage, updatedContext, escalationState: 'none' };
    }

    // 4D. CONDITION INFO / CAUSES / CONTAGIOUS INQUIRY ("What causes it?", "is it contagious?", etc.)
    if (isConditionInfoInquiry(normalized)) {
      const infoTriage: TriageResult = {
        urgencyLevel: 'ROUTINE',
        intentCode: ctx.situation || 'skin_rash',
        detectedCategory: isSkinRash ? 'Dermatology / Rash Causes & Insights' : 'Healthcare Condition Guidance',
        detectedKeywords: ['condition info inquiry', 'active specialty context'],
        conversationalResponse: {
          en: isSkinRash
            ? 'Skin rashes are commonly triggered by contact allergies (such as soaps, detergents, cosmetics, or fabrics), eczema, heat rash, or mild fungal or viral irritations. To pinpoint the exact cause and receive targeted treatment, an in-person evaluation by a dermatologist is recommended. Avoid scratching and keep the area dry.'
            : 'Symptom causes can vary widely. A consultation with a qualified medical professional is recommended to evaluate the exact cause.',
          hi: isSkinRash
            ? 'त्वचा पर रैश एलर्जी (साबुन, डिटर्जेंट, कपड़े), एक्जिमा, घमौरियों या फंगल संक्रमण के कारण हो सकते हैं। सटीक कारण जानने और सही इलाज के लिए त्वचा विशेषज्ञ को दिखाएं। तब तक खुजलाने से बचें और त्वचा को सूखा रखें।'
            : 'लक्षणों के कई कारण हो सकते हैं। उचित निदान के लिए योग्य डॉक्टर से परामर्श लें।',
          hinglish: isSkinRash
            ? 'Skin rash kisi allergy (soap, clothes, chemicals), eczema ya fungal infection ki wajah se ho sakta hai. Exact reason janne ke liye dermatologist ko consult karein. Tab tak scratch bilkul na karein.'
            : 'Symptom ka exact reason doctor test ke baad pata chalega.',
          zh: isSkinRash
            ? '皮疹常见原因包括接触性过敏（如肥皂、洗涤剂或衣物）、湿疹、痱子或轻度真菌感染。建议面诊皮肤科医生明确病因，期间避免抓挠。'
            : '症状原因多样，建议咨询专科医生进行专业诊断。',
          es: isSkinRash
            ? 'Las erupciones cutáneas suelen deberse a alergias por contacto (jabones, cosméticos, telas), eccema, calor o infecciones leves. Se recomienda consultar a un dermatólogo para determinar la causa exacta. Evite rascarse.'
            : 'Las causas de los síntomas varían. Se recomienda consultar a un médico.',
          fr: isSkinRash
            ? 'Les éruptions cutanées sont souvent causées par des allergies de contact, de l\'eczéma ou des irritations. Consultez un dermatologue pour identifier la cause exacte.'
            : 'Consultez un médecin pour déterminer la cause de vos symptômes.',
          pt: isSkinRash
            ? 'Erupções cutâneas geralmente decorrem de alergias de contato, eczema ou calor. Recomenda-se avaliação com dermatologista.'
            : 'Consulte um profissional de saúde para investigar as causas.',
          ar: isSkinRash
            ? 'غالباً ما ينتج الطفح الجلدي عن حساسية تلامسية أو إكزيما أو عدوى فطرية خفيفة. يُنصح بمراجعة طبيب الجلدية لتحديد السبب الدقيق.'
            : 'يُنصح باستشارة طبيب مختص لتقييم الأعراض ومعرفة السبب.',
          bn: isSkinRash
            ? 'ত্বকে র‍্যাশ সাধারণত কন্টাক্ট অ্যালার্জি, একজিমা বা মৃদু ছত্রাক সংক্রমণের কারণে হতে পারে। সঠিক কারণ জানার জন্য চর্মরোগ বিশেষজ্ঞের পরামর্শ নিন।'
            : 'সঠিক কারণ জানতে চিকিৎসকের পরামর্শ নিন।',
        },
        spokenResponse: {
          en: isSkinRash
            ? 'Skin rashes are often caused by allergies, eczema, or irritants. A dermatologist can determine the exact cause.'
            : 'A certified doctor can determine the cause of your symptoms.',
          hi: isSkinRash
            ? 'रैश एलर्जी या संक्रमण से हो सकते हैं। सही कारण के लिए त्वचा विशेषज्ञ को दिखाएं।'
            : 'सही जांच के लिए डॉक्टर को दिखाएं।',
          hinglish: isSkinRash
            ? 'Rash allergy ya infection ki wajah se ho sakta hai. Dermatologist se consult karein.'
            : 'Doctor se check karwayein.',
          zh: isSkinRash ? '皮疹多由过敏或湿疹引起，建议就诊皮肤科。' : '建议就医诊断。',
          es: isSkinRash ? 'Las erupciones suelen deberse a alergias. Consulte a un dermatólogo.' : 'Consulte a un médico.',
          fr: isSkinRash ? 'Consultez un dermatologue pour déterminer la cause.' : 'Consultez un médecin.',
          pt: isSkinRash ? 'Consulte um dermatologista para identificar a causa.' : 'Consulte um médico.',
          ar: isSkinRash ? 'استشر طبيب جلدية لتحديد السبب.' : 'استشر طبيباً مختصاً.',
          bn: isSkinRash ? 'র‍্যাশ অ্যালার্জি বা ইনফেকশন থেকে হতে পারে। চর্মরোগ বিশেষজ্ঞ দেখান।' : 'ডাক্তার দেখান।',
        },
        actionPrompt: {
          en: isSkinRash ? 'Nearby Dermatology Providers' : 'Nearby Healthcare Providers',
          hi: isSkinRash ? 'नजदीकी त्वचा विशेषज्ञ' : 'नजदीकी चिकित्सक',
          hinglish: isSkinRash ? 'Pass ke skin clinics' : 'Pass ke clinics',
          bn: isSkinRash ? 'নিকটবর্তী চর্মরোগ ক্লিনিক' : 'নিকটবর্তী ক্লিনিক',
        },
        immediateGuidance: {
          en: 'Take note of any new soaps, detergents, or foods you came into contact with recently.',
          hi: 'ध्यान दें कि हाल ही में किसी नए साबुन, डिटर्जेंट या भोजन के संपर्क में तो नहीं आए।',
          hinglish: 'Notice karein ki kisi new product se reaction toh nahi hua.',
          bn: 'সম্প্রতি কোনো নতুন সাবান বা খাবারের সংস্পর্শে এসেছেন কিনা তা মনে রাখুন।',
        },
        doNots: {
          en: 'DO NOT self-prescribe steroid creams or scratch affected areas.',
          hi: 'बिना सलाह स्टेरॉयड क्रीम न लगाएं और प्रभावित जगह न खुजलाएं।',
          hinglish: 'Bina doctor ke koi steroid cream na lagayein.',
          bn: 'ডাক্তারের পরামর্শ ছাড়া স্টেরয়েড মলম ব্যবহার করবেন না।',
        },
        recommendedFacilityType: ctx.facilityType,
        suggestSwitchToNormal: false,
        confidenceScore: 0.95,
      };

      const updatedContext: SessionContext = {
        ...ctx,
        language: activeLang,
        previousUserMessages: [...ctx.previousUserMessages, userQuery],
        previousAssistantActions: [...ctx.previousAssistantActions, 'provided_condition_info'],
      };

      return { triage: infoTriage, updatedContext, escalationState: 'none' };
    }

    // 4E. GENERAL FOLLOW-UP (User asks questions without switching to a different specialty)
    // If freshTriage defaulted to 'general_physician' because no new specialty was specified:
    if (freshTriage.recommendedFacilityType === 'general_physician') {
      const retainedTriage: TriageResult = {
        ...freshTriage,
        recommendedFacilityType: ctx.facilityType,
        intentCode: ctx.situation || freshTriage.intentCode,
      };

      const updatedContext: SessionContext = {
        ...ctx,
        language: activeLang,
        previousUserMessages: [...ctx.previousUserMessages, userQuery],
        previousAssistantActions: [...ctx.previousAssistantActions, 'continued_normal_context'],
      };

      return { triage: retainedTriage, updatedContext, escalationState: 'none' };
    }
  }

  // 5. FRESH ROUTINE TRIAGE EVALUATION (New topic or new specialist requested)
  const updatedContext: SessionContext = {
    ...ctx,
    mode: 'normal',
    urgency: freshTriage.urgencyLevel,
    situation: freshTriage.intentCode || 'general_concern',
    facilityType: freshTriage.recommendedFacilityType,
    escalationState: 'none',
    requestedLimit: undefined,
    filterOpenNow: undefined,
    previousUserMessages: [...ctx.previousUserMessages, userQuery],
    previousAssistantActions: [...ctx.previousAssistantActions, `classified_${freshTriage.urgencyLevel}`],
  };

  return { triage: freshTriage, updatedContext, escalationState: 'none' };
}
