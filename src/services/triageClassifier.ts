import { TriageResult, FacilityType, MultilingualText } from '../types';

interface EmergencyRule {
  id: string;
  intentCode: string; // Language-independent intent representation
  category: string;
  level: 'CRITICAL' | 'URGENT' | 'ROUTINE';
  facilityType: FacilityType;
  keywords: string[];
  conversationalResponse: MultilingualText;
  spokenResponse: MultilingualText;
  actionPrompt?: MultilingualText;
  guidance: MultilingualText;
  doNots: MultilingualText;
}

const emergencyRules: EmergencyRule[] = [
  // 0. EMERGENCY ESCALATION / UNANSWERED CALL / NO ONE PICKING UP (CRITICAL)
  {
    id: 'emergency_unanswered_escalation',
    intentCode: 'emergency_unanswered_escalation',
    category: 'Emergency Dispatch Escalation / Call Unanswered',
    level: 'CRITICAL',
    facilityType: 'icu_hospital',
    keywords: [
      'no one is picking up', 'nobody is picking up', 'not picking up', 'not answering', 'nobody answering',
      'no answer', 'phone nahi utha rahe', 'call nahi utha rahe', 'koi nahi utha raha', 'phone cut gaya',
      'hospital is not picking up', 'ambulance nahi aa rahi', 'call busy', 'not responding on call',
      'কেউ ফোন তুলছে না', 'ফোন ধরছে না', 'উত্তর দিচ্ছে না',
      'nadie contesta', 'no contesta nadie', 'personne ne répond', 'ninguém atende', 'لا أحد يرد', '没人接'
    ],
    conversationalResponse: {
      en: 'DO NOT WAIT ON THE PHONE. Dial 112 immediately for emergency dispatch, or start direct transport to the nearest emergency hospital below.',
      hi: 'फोन पर इंतजार बिल्कुल न करें! तुरंत राष्ट्रीय आपातकालीन नंबर 112 मिलाएं, या सीधे निकटतम आपातकालीन अस्पताल ले जाने की व्यवस्था करें।',
      hinglish: 'Phone par wait mat kijiye! Turant 112 national emergency milayein, ya patient ko direct pass ke emergency hospital le jayein.',
      zh: '不要等待电话接通。请立即拨打当地急救电话，或直接前往下方最近的急救医院。',
      es: 'NO ESPERE AL TELÉFONO. Llame a emergencias de inmediato o traslade a la persona al hospital de urgencias más cercano.',
      fr: 'N\'ATTENDEZ PAS AU TÉLÉPHONE. Composez immédiatement les urgences ou dirigez-vous vers l\'hôpital le plus proche.',
      pt: 'NÃO ESPERE NO TELEFONE. Ligue para a emergência imediatamente ou transporte a pessoa para o hospital mais próximo.',
      ar: 'لا تنتظر على الهاتف. اتصل برقم الطوارئ فورًا أو توجه إلى أقرب مستشفى طوارئ.',
      bn: 'ফোনের অপেক্ষায় সময় নষ্ট করবেন না! অবিলম্বে ১১২-তে কল করুন অথবা সরাসরি নিকটস্থ হাসপাতালে রওনা হন।',
    },
    spokenResponse: {
      en: 'Do not wait on the phone. Dial 112 now or begin transport directly to the nearest emergency hospital.',
      hi: 'फोन पर प्रतीक्षा न करें। तुरंत 112 मिलाएं या नजदीकी अस्पताल ले जाएं।',
      hinglish: 'Phone par wait mat kijiye. Turant 112 milayein ya pass ke hospital le jayein.',
      zh: '不要等待。立即拨打急救电话或前往最近的医院。',
      es: 'No espere al teléfono. Llame a emergencias ahora o traslade al hospital.',
      fr: 'N\'attendez pas. Composez les urgences maintenant.',
      pt: 'Não espere. Ligue para a emergência agora.',
      ar: 'لا تنتظر على الهاتف. اتصل بالطوارئ فورًا.',
      bn: 'ফোনে অপেক্ষা করবেন না। অবিলম্বে ১১২-তে কল করুন।',
    },
    actionPrompt: {
      en: 'Immediate 112 Dispatch & Direct Transport',
      hi: 'तुरंत 112 कॉल व सीधा अस्पताल प्रस्थान',
      hinglish: 'Immediate 112 Dispatch & Transport',
      bn: 'অবিলম্বে ১১২ ডায়াল ও হাসপাতালে স্থানান্তর',
    },
    guidance: {
      en: '1. Dial 112 immediately. 2. If patient is breathing, keep them on their side in recovery position. 3. If NOT breathing, begin CPR chest compressions immediately. 4. Navigate directly to the nearest hospital below.',
      hi: '1. तुरंत 112 मिलाएं। 2. यदि सांस चल रही है तो करवट दिलाकर लिटाएं। 3. यदि सांस नहीं चल रही तो तुरंत सीपीआर शुरू करें। 4. नीचे दिए गए सबसे नजदीकी अस्पताल के लिए रास्ता शुरू करें।',
      hinglish: '1. Turant 112 milayein. 2. Saans chal rahi hai toh side (karwat) par litayein. 3. Saans band hai toh CPR shuru karein. 4. Pass ke hospital ke liye Navigate karein.',
      bn: '১. অবিলম্বে ১১২ ডায়াল করুন। ২. শ্বাস চললে একপাশে কাত করে রাখুন। ৩. শ্বাস বন্ধ হলে সিপিআর শুরু করুন। ৪. দ্রুত হাসপাতালে রওনা হন।',
    },
    doNots: {
      en: 'DO NOT keep waiting on ringing hospital lines. DO NOT give water or liquids to an unconscious person. DO NOT leave them alone.',
      hi: 'फोन बजने के इंतजार में समय न गवाएं। बेहोश व्यक्ति के मुंह में कभी पानी न डालें। उन्हें अकेला न छोड़ें।',
      hinglish: 'Phone ring hone ka wait na karein. Behosh insaan ko paani na dein. Akela na chhodein.',
      bn: 'ফোন বাজার অপেক্ষায় সময় নষ্ট করবেন না। অজ্ঞান ব্যক্তিকে জল দেবেন না। একা রাখবেন না।',
    },
  },

  // 1. UNCONSCIOUSNESS / COLLAPSED / UNRESPONSIVE (CRITICAL)
  {
    id: 'neurological_emergency',
    intentCode: 'unresponsive_person',
    category: 'Unconscious / Collapsed / Unresponsive',
    level: 'CRITICAL',
    facilityType: 'icu_hospital',
    keywords: [
      'collapsed', 'isn\'t responding', 'not responding', 'unconscious', 'fainted', 'unresponsive', 'seizure', 'fit', 'stroke', 'face drooping', 'paralysis', 'slurred speech',
      'behosh', 'behoshi', 'gir gaya', 'daura pad raha', 'mirgi ka daura', 'lakwa', 'awaz ladkhadana', 'hosh kho diya',
      'chal nahi pa raha', 'bol nahi pa raha', 'gira hua hai', 'padosi behosh',
      'অজ্ঞান', 'জ্ঞান হারিয়েছে', 'পড়ে গেছে', 'খিঁচুনি', 'প্যারালাইসিস', 'স্ট্রोक',
      'inconsciente', 'se desmayó', 'no responde', 'colapsó', 'évanoui', 'ne répond pas', 'inconsciente', 'não responde', 'فقد الوعي', 'لا يستجيب', '昏迷', '晕倒', '没有反应'
    ],
    conversationalResponse: {
      en: 'This may require immediate medical attention. Call 112 now and stay with the person. Follow the emergency operator\'s instructions.',
      hi: 'यह एक अत्यंत गंभीर स्थिति है। तुरंत 112 पर कॉल करें और मरीज़ के साथ रहें। आपातकालीन ऑपरेटर के निर्देशों का पालन करें।',
      hinglish: 'Yeh serious emergency hai. Turant 112 par call karein aur patient ke pass rahein. Saans check karte rahein.',
      zh: '这可能需要立即就医。请立即拨打急救电话并陪伴在患者身边。遵循急救调度员的指示。',
      es: 'Esto puede requerir atención médica inmediata. Llame al número de emergencias ahora y quédese con la persona.',
      fr: 'Cela peut nécessiter une attention médicale immédiate. Appelez les urgences maintenant et restez avec la personne.',
      pt: 'Isso pode exigir atenção médica imediata. Ligue para a emergência agora e fique com a pessoa.',
      ar: 'قد يتطلب هذا عناية طبية فورية. اتصل بالطوارئ الآن وابقَ مع المريض.',
      bn: 'এটি একটি মারাত্মক জরুরী অবস্থা। অবিলম্বে ১১২-তে কল করুন এবং রোগীর পাশে থাকুন। জরুরী অপারেটরের নির্দেশ মেনে চলুন।',
    },
    spokenResponse: {
      en: 'Emergency. Call 112 now. Check if they are breathing normally. Stay with the person.',
      hi: 'आपातकाल। तुरंत 112 पर कॉल करें। सांस जांचें और मरीज़ के साथ रहें।',
      hinglish: 'Emergency. Turant 112 call karein. Saans check karein aur patient ke sath rahein.',
      zh: '紧急情况。立即拨打急救电话。检查呼吸，陪伴在患者身边。',
      es: 'Emergencia. Llame a emergencias ahora. Compruebe si respira. Quédese con la persona.',
      fr: 'Urgence. Appelez les secours maintenant. Vérifiez la respiration. Restez avec la personne.',
      pt: 'Emergência. Ligue para o socorro agora. Verifique a respiração. Fique com a pessoa.',
      ar: 'حالة طوارئ. اتصل بالطوارئ الآن. تحقق من التنفس وابقَ مع المريض.',
      bn: 'জরুরী অবস্থা। অবিলম্বে ১১২ ডায়াল করুন। শ্বাস পরীক্ষা করুন এবং রোগীর পাশে থাকুন।',
    },
    actionPrompt: {
      en: 'Emergency Response for Unresponsive Person',
      hi: 'बेहोश व्यक्ति के लिए आपातकालीन सहायता',
      hinglish: 'Unresponsive person emergency response',
      bn: 'অজ্ঞান ব্যক্তির জরুরী চিকিৎসা',
    },
    guidance: {
      en: 'Check breathing. If breathing, place in recovery position on their side to keep airway clear. If not breathing, begin CPR chest compressions immediately.',
      hi: 'सांस जांचें। यदि सांस चल रही है तो करवट दिलाकर लिटाएं ताकि सांस की नली खुली रहे। यदि सांस नहीं चल रही तो तुरंत सीपीआर शुरू करें।',
      hinglish: 'Saans check karein. Karwat (side) dila kar litayein taaki gala saaf rahe. Saans band hone par CPR shuru karein.',
      bn: 'শ্বাস চলছে কিনা দেখুন। শ্বাস চললে একপাশে কাত করে শোয়ান। শ্বাস না চললে সিপিআর শুরু করুন।',
    },
    doNots: {
      en: 'DO NOT put fingers, spoons, or shoes in mouth during seizures. DO NOT give water to an unconscious person.',
      hi: 'दौरे के समय मरीज के मुंह में उंगली, चम्मच या जूता न लगाएं। बेहोश व्यक्ति के मुंह में कभी पानी या दवाई न डालें।',
      hinglish: 'Fit padne par muh me chammach ya ungli na dalein. Behosh insaan ko paani bilkul na pilayein.',
      bn: 'খিঁচুনির সময় মুখে চামচ বা আঙুল দেবেন না। অজ্ঞান ব্যক্তির মুখে জল দেবেন না।',
    },
  },

  // 2. CARDIAC & CHEST PAIN (CRITICAL)
  {
    id: 'cardiac_emergency',
    intentCode: 'possible_emergency_chest_pain',
    category: 'Cardiac / Severe Chest Pain',
    level: 'CRITICAL',
    facilityType: 'icu_hospital',
    keywords: [
      'chest pain', 'chest hurts', 'heart attack', 'cardiac', 'left arm pain', 'crushing chest', 'heart pain',
      'seene me dard', 'seene mein dard', 'chhati me dard', 'dil ka daura', 'dil me dard', 'mere chest me pain',
      'paseena aur chest', 'chati dard', 'sine me dard', 'chest heaviness',
      'বুকে ব্যথা', 'হার্ট অ্যাটাক', 'বুকে চাপ', 'বুকে প্রচণ্ড ব্যথা',
      'dolor de pecho', 'dolor en el pecho', 'ataque cardíaco', 'douleur thoracique', 'douleur à la poitrine', 'dor no peito', 'ألم في الصدر', '胸痛', '心脏病发作'
    ],
    conversationalResponse: {
      en: 'This may require immediate emergency medical attention. Call 112 now and keep the person calm and still. Do not allow them to exert themselves.',
      hi: 'यह एक गंभीर आपातकाल हो सकता है। तुरंत 112 पर कॉल करें, मरीज़ को शांत और स्थिर रखें। उन्हें बिल्कुल चलने या तनाव न लेने दें।',
      hinglish: 'Yeh serious medical emergency ho sakti hai. Turant 112 milayein aur patient ko shant seedha bithayein. Chalne na dein.',
      zh: '这可能需要立即进行急诊医疗救治。请立即拨打急救电话并保持患者平静与静止。切勿让其走动。',
      es: 'Esto puede requerir atención médica de urgencia inmediata. Llame al número de emergencias ahora y mantenga a la persona en reposo absoluto.',
      fr: 'Cela peut nécessiter des soins médicaux d\'urgence immédiats. Appelez les urgences maintenant et gardez la personne calme.',
      pt: 'Isso pode exigir atendimento médico de emergência imediato. Ligue para a emergência agora e mantenha a pessoa calma.',
      ar: 'قد يتطلب هذا رعاية طبية طارئة وفورية. اتصل بالطوارئ الآن وحافظ على هدوء المريض.',
      bn: 'এটি একটি মারাত্মক জরুরী অবস্থা হতে পারে। অবিলম্বে ১১২-তে কল করুন এবং রোগীকে শান্ত ও স্থির রাখুন।',
    },
    spokenResponse: {
      en: 'Emergency. Call 112 now. Sit the person upright and calm. Do not allow them to walk or drive.',
      hi: 'आपातकाल। तुरंत 112 पर कॉल करें। मरीज़ को सीधा बैठाएं। चलने न दें।',
      hinglish: 'Emergency. Turant 112 call karein. Patient ko shant seedha bithayein.',
      zh: '紧急情况。立即拨打急救电话。让患者保持坐姿和平静，切勿走动。',
      es: 'Emergencia. Llame a emergencias ahora. Mantenga a la persona sentada y en reposo.',
      fr: 'Urgence. Appelez les secours. Asseyez la personne calmement.',
      pt: 'Emergência. Ligue para o socorro. Mantenha a pessoa sentada e calma.',
      ar: 'حالة طوارئ. اتصل بالطوارئ الآن. اجعل المريض يجلس بهدوء.',
      bn: 'জরুরী অবস্থা। অবিলম্বে ১১২-তে কল করুন। রোগীকে সোজা বসিয়ে রাখুন।',
    },
    actionPrompt: {
      en: 'Immediate Cardiac Emergency Care',
      hi: 'तुरंत हृदय आपातकालीन सहायता',
      hinglish: 'Emergency cardiac care',
      bn: 'অবিলম্বে হৃদরোগ সংক্রান্ত জরুরী সেবা',
    },
    guidance: {
      en: 'Keep patient sitting upright and calm. Loosen tight collar and clothes. Call 112 or dispatch ambulance immediately.',
      hi: 'मरीज को आराम से सीधा बैठाएं। कपड़े ढीले करें और शांत रखें। तुरंत 112 या एम्बुलेंस को कॉल करें।',
      hinglish: 'Patient ko sidha bithayein, tight kapde loose karein. Ghabrayein nahi aur turant 112 ambulance ko call karein.',
      bn: 'রোগীকে সোজা বসিয়ে রাখুন এবং শান্ত রাখুন। পোশাক ঢিলে করুন। অবিলম্বে ১১২ ডাকুন।',
    },
    doNots: {
      en: 'DO NOT allow patient to walk, exert, or drive. DO NOT give heavy food or ignore symptoms.',
      hi: 'मरीज को पैदल न चलने दें, कोई भारी काम या गाड़ी न चलाने दें। भारी भोजन न दें।',
      hinglish: 'Patient ko chalne ya drive karne na dein. Khana ya pani forceful na pilayein.',
      bn: 'রোগীকে হাঁটাহাঁটি বা পরিশ্রম করতে দেবেন না। জোর করে খাবার বা জল খাওয়াবেন না।',
    },
  },

  // 3. SEVERE TRAUMA & ARTERIAL BLEEDING (CRITICAL)
  {
    id: 'trauma_bleeding',
    intentCode: 'severe_trauma_bleeding',
    category: 'Severe Trauma / Massive Bleeding',
    level: 'CRITICAL',
    facilityType: 'trauma_center',
    keywords: [
      'accident', 'bleeding heavily', 'head injury', 'deep cut', 'stab', 'blood flowing', 'hemorrhage', 'hit by car', 'bike fall',
      'accident ho gaya', 'khoon beh raha', 'khoon nikal raha', 'sir phat gaya', 'bahut khoon', 'chot lagi',
      'blood loss', 'haath kat gaya', 'taang toot gayi',
      'দুর্ঘটনা', 'রক্ত পড়ছে', 'মাথা ফেটে গেছে', 'প্রচুর রক্তপাত',
      'sangrado severo', 'accidente', 'saignement abondant', 'sangramento grave', 'نزيف حاد', '大出血', '车祸'
    ],
    conversationalResponse: {
      en: 'Severe trauma and bleeding require immediate emergency care. Call 112 right away. Apply continuous firm pressure on bleeding wounds.',
      hi: 'गंभीर चोट व रक्तस्राव के लिए तुरंत आपातकालीन देखभाल की आवश्यकता है। 112 डायल करें और बहते खून पर लगातार दबाव बनाए रखें।',
      hinglish: 'Severe trauma case hai, turant 112 ambulance call karein. Ghaav par saaf kapde se continuously dabav banaye rakhein.',
      zh: '严重外伤与出血需要立即进行急救。请立即拨打急救电话并用力按压出血伤口止血。',
      es: 'El traumatismo grave y la hemorragia requieren atención médica inmediata. Llame al número de emergencias ahora.',
      fr: 'Un traumatisme grave et des saignements abondants nécessitent une prise en charge urgente. Appelez les secours.',
      pt: 'Trauma grave e hemorragia exigem atendimento de emergência imediato. Ligue para o socorro agora.',
      ar: 'تتطلب الإصابات الشديدة والنزيف الحاد رعاية طارئة فورية. اتصل بالطوارئ الآن.',
      bn: 'মারাত্মক আঘাত ও রক্তক্ষরণের ক্ষেত্রে অবিলম্বে জরুরী চিকিৎসা প্রয়োজন। ১১২-তে কল করুন।',
    },
    spokenResponse: {
      en: 'Emergency. Call 112 now. Apply firm direct pressure to the wound with a clean cloth.',
      hi: 'आपातकाल। तुरंत 112 मिलाएं। साफ कपड़े से बहते खून पर लगातार दबाव बनाए रखें।',
      hinglish: 'Emergency. Turant 112 call karein aur ghaav par saaf kapde se dabav banayein.',
      zh: '紧急情况。立即拨打急救电话。用干净布料持续用力按压伤口止血。',
      es: 'Emergencia. Llame a emergencias. Aplique presión firme y directa sobre la herida.',
      fr: 'Urgence. Appelez les secours. Appliquez une pression ferme sur la plaie.',
      pt: 'Emergência. Ligue para o socorro. Aplique pressão direta e firme no ferimento.',
      ar: 'حالة طوارئ. اتصل بالطوارئ فورًا واضغط بقوة على الجرح.',
      bn: 'জরুরী অবস্থা। অবিলম্বে ১১২-তে কল করুন এবং ক্ষতে শক্ত করে চেপে ধরে রাখুন।',
    },
    actionPrompt: {
      en: 'Locate nearest Trauma Center',
      hi: 'निकटतम ट्रॉमा सेंटर खोजें',
      hinglish: 'Pass ka Trauma Center search karein',
      bn: 'নিকটতম ট্রমা সেন্টার খুঁজুন',
    },
    guidance: {
      en: 'Apply firm, direct pressure on the bleeding wound with a clean cloth. Elevate injured limb if no bone is broken.',
      hi: 'साफ कपड़े से बहते खून वाली जगह पर लगातार सीधा दबाव बनाएं। यदि हड्डी नहीं टूटी है तो घायल हिस्से को थोड़ा ऊपर रखें।',
      hinglish: 'Saaf kapde se ghaav par lagatar dabav banaye rakhein.',
      bn: 'পরিষ্কার কাপড় দিয়ে রক্তক্ষরণের জায়গায় একটানা শক্ত করে চেপে ধরুন।',
    },
    doNots: {
      en: 'DO NOT remove deeply embedded foreign objects. DO NOT release pressure to check the wound.',
      hi: 'घाव में घुसी हुई किसी चीज को खुद बाहर न निकालें। बार-बार कपड़ा हटाकर घाव न देखें।',
      hinglish: 'Ghaav me ghusa kaanch ya loha khud na nikalein.',
      bn: 'ক্ষতস্থানে ঢুকে থাকা কোনো বস্তু নিজে বের করবেন না।',
    },
  },

  // 4. RESPIRATORY ARREST / CHOKING (CRITICAL)
  {
    id: 'respiratory_emergency',
    intentCode: 'severe_respiratory_distress',
    category: 'Severe Respiratory Distress / Choking',
    level: 'CRITICAL',
    facilityType: 'icu_hospital',
    keywords: [
      'breathing trouble', 'cannot breathe', 'choking', 'gasping', 'asthma attack', 'suffocating', 'turning blue', 'shortness of breath',
      'saans nahi aa rahi', 'saans fulna', 'dam ghut raha', 'gala ghutna', 'saans lene me dikkat', 'saans lene mein dikkat',
      'sans ruk gayi', 'hawa nahi mil rahi', 'bhaiya ko saans',
      'শ্বাসকষ্ট', 'শ্বাস বন্ধ', 'দম আটকে যাওয়া', 'শ্বাস নিতে পারছে না',
      'dificultad para respirar', 'no puede respirar', 'étouffement', 'ne peut pas respirer', 'falta de ar', 'ضيق في التنفس', '呼吸困难', '窒息'
    ],
    conversationalResponse: {
      en: 'Severe breathing difficulty requires immediate emergency intervention. Dial 112 and keep the patient upright.',
      hi: 'सांस लेने में अत्यधिक कठिनाई के लिए तत्काल आपातकालीन सहायता चाहिए। 112 मिलाएं और मरीज़ को सीधा बैठाएं।',
      hinglish: 'Saans lene me dikkat emergency hai. Turant 112 call karein aur patient ko aage jhuka kar seedha bithayein.',
      zh: '严重的呼吸困难需要立即进行急救。请拨打急救电话并让患者坐直。',
      es: 'La dificultad respiratoria grave requiere atención de urgencia inmediata. Llame a emergencias y mantenga a la persona erguida.',
      fr: 'Une détresse respiratoire aiguë nécessite une intervention urgente. Appelez les secours et asseyez la personne.',
      pt: 'Dificuldade respiratória grave requer intervenção de emergência imediata. Ligue para o socorro e mantenha a pessoa ereta.',
      ar: 'يتطلب ضيق التنفس الحاد تدخلاً طارئاً وفورياً. اتصل بالطوارئ واجعل المريض يجلس منتصباً.',
      bn: 'তীব্র শ্বাসকষ্টের জন্য অবিলম্বে জরুরী সহায়তা প্রয়োজন। ১১২ ডায়াল করুন এবং রোগীকে সোजा বসিয়ে রাখুন।',
    },
    spokenResponse: {
      en: 'Emergency. Call 112 now. Sit the person upright leaning slightly forward. Do not lay them flat.',
      hi: 'आपातकाल। तुरंत 112 मिलाएं। मरीज़ को आगे झुकाकर सीधा बैठाएं। लेटने न दें।',
      hinglish: 'Emergency. Turant 112 call karein aur patient ko aage jhuka kar seedha bithayein.',
      zh: '紧急情况。立即拨打急救电话。让患者上身微前倾坐直，切勿平躺。',
      es: 'Emergencia. Llame a emergencias. Mantenga a la persona sentada erguida. No la acueste.',
      fr: 'Urgence. Appelez les secours. Asseyez la personne penchée en avant. Ne l\'allongez pas.',
      pt: 'Emergência. Ligue para o socorro. Mantenha a pessoa sentada. Não a deite.',
      ar: 'حالة طوارئ. اتصل بالطوارئ فورًا واجعل المريض يجلس منتصبًا.',
      bn: 'জরুরী অবস্থা। অবিলম্বে ১১২ ডায়াল করুন। রোগীকে সোজা বসিয়ে রাখুন।',
    },
    actionPrompt: {
      en: 'Find ICU hospitals with Oxygen',
      hi: 'ऑक्सीजन युक्त आईसीयू अस्पताल खोजें',
      hinglish: 'Oxygen wale ICU hospitals dhoondhein',
      bn: 'অক্সিজেন সমৃদ্ধ আইসিইউ হাসপাতাল খুঁজুন',
    },
    guidance: {
      en: 'Keep airway open. Sit patient upright leaning slightly forward. If choking and conscious, administer back blows.',
      hi: 'सांस की नली खुली रखें। मरीज को थोड़ा आगे की ओर झुकाकर सीधा बैठाएं। खिड़कियां खोलें।',
      hinglish: 'Patient ko thoda aage jhuka kar seedha bithayein. Taza hawa aane dein.',
      bn: 'রোগীকে কিছুটা সামনের দিকে ঝুঁকে সোজা বসান। তাজা বাতাসের ব্যবস্থা করুন।',
    },
    doNots: {
      en: 'DO NOT lay the patient flat on their back. DO NOT force oral liquids.',
      hi: 'मरीज को पीठ के बल सीधा न लिटाएं। जबरन पानी न पिलाएं।',
      hinglish: 'Peeth ke bal seedha mat litayein. Pani zabardasti na pilayein.',
      bn: 'রোগীকে চিত করে শোয়াবেন না। মুখে জোর করে জল দেবেন না।',
    },
  },

  // 5. ROUTINE / DERMATOLOGY (ROUTINE)
  {
    id: 'routine_dermatology',
    intentCode: 'skin_rash',
    category: 'Dermatology / Skin Care',
    level: 'ROUTINE',
    facilityType: 'dermatology',
    keywords: [
      'skin rash', 'rash', 'itching', 'skin allergy', 'pimples', 'acne', 'eczema', 'hair fall', 'skin doctor',
      'skin specialist', 'dermatologist', 'dermatology', 'skin concern', 'itchy red rash', 'itchy skin rash',
      'who should i see for a skin rash', 'who should i consult',
      'khujli', 'chakatte', 'chehre par daane', 'twacha rog', 'charm rog', 'skin rash ke liye',
      'ত্বকের সমস্যা', 'চর্মরোগ', 'চুলকানি', 'ব্রণ',
      'erupción cutánea', 'dermatólogo', 'dermatologue', 'éruption', 'dermatologista', 'طبيب جلدية', 'طفح جلدي', '皮肤科', '皮疹'
    ],
    conversationalResponse: {
      en: 'A dermatologist is the appropriate specialist for skin concerns. Here are relevant options near you.',
      hi: 'त्वचा और रैश से जुड़ी समस्याओं के लिए डर्मेटोलॉजिस्ट (त्वचा विशेषज्ञ) से संपर्क करना सही रहेगा। यहाँ आपके नजदीकी विकल्प हैं।',
      hinglish: 'Skin concerns aur rashes ke liye dermatologist sahi specialist hain. Ye rahe aapke pass ke verified doctors.',
      zh: '皮肤科医生是处理皮肤问题的合适专科医生。以下是您附近的专业诊所。',
      es: 'Un dermatólogo es el especialista adecuado para problemas de la piel. Aquí tiene opciones relevantes cerca de usted.',
      fr: 'Un dermatologue est le spécialiste approprié pour les problèmes de peau. Voici des praticiens proches de vous.',
      pt: 'Um dermatologista é o especialista indicado para questões de pele. Aqui estão opções perto de você.',
      ar: 'طبيب الأمراض الجلدية هو الأخصائي المناسب لمشاكل الجلد. إليك خيارات قريبة منك.',
      bn: 'ত্বকের যেকোনো সমস্যার জন্য চর্মরোগ বিশেষজ্ঞ (Dermatologist) দেখানো সবচেয়ে উপযুক্ত। এখানে আপনার নিকটস্থ ক্লিনিকসমূহ রয়েছে।',
    },
    spokenResponse: {
      en: 'A dermatologist is the appropriate specialist for skin concerns. Here are verified options near you.',
      hi: 'त्वचा से जुड़ी समस्याओं के लिए त्वचा विशेषज्ञ से परामर्श लें। नजदीकी विकल्प स्क्रीन पर हैं।',
      hinglish: 'Skin concerns ke liye dermatologist sahi doctor hain. Pass ke clinics screen par hain.',
      zh: '皮肤科医生是处理皮肤问题的合适专科医生。附近诊所已为您列出。',
      es: 'Un dermatólogo es el especialista adecuado para problemas de piel.',
      fr: 'Un dermatologue est le spécialiste approprié pour vos soins de peau.',
      pt: 'Um dermatologista é o especialista adequado para problemas de pele.',
      ar: 'طبيب الأمراض الجلدية هو الأخصائي المناسب لمشاكل الجلد.',
      bn: 'ত্বকের সমস্যার জন্য চর্মরোগ বিশেষজ্ঞ দেখানো সবচেয়ে উপযুক্ত।',
    },
    actionPrompt: {
      en: 'Nearby Dermatology Clinics',
      hi: 'नजदीकी त्वचा विशेषज्ञ',
      hinglish: 'Pass ke skin clinics',
      bn: 'নিকটবর্তী চর্মরোগ ক্লিনিক',
    },
    guidance: {
      en: 'Avoid scratching to prevent secondary infection. Keep skin clean and dry.',
      hi: 'संक्रमण से बचने के लिए खुजलाएं नहीं। त्वचा को साफ रखें।',
      hinglish: 'Infection se bachne ke liye scratch na karein.',
      bn: 'সংক্রমণ এড়াতে চুলকাবেন না।',
    },
    doNots: {
      en: 'DO NOT apply harsh unprescribed steroid creams.',
      hi: 'बिना डॉक्टर की सलाह कोई तेज क्रीम न लगाएं।',
      hinglish: 'Bina doctor ke koi harsh cream na lagayein.',
      bn: 'ডাক্তারের পরামর্শ ছাড়া কড়া মলম লাগাবেন না।',
    },
  },

  // 6. ROUTINE / PHARMACY (ROUTINE)
  {
    id: 'routine_pharmacy',
    intentCode: 'pharmacy_search',
    category: 'Pharmacy / Chemist',
    level: 'ROUTINE',
    facilityType: 'pharmacy',
    keywords: [
      'pharmacy', 'chemist', 'medicine store', 'medical store', 'pharmacy near me', 'pharmacy open now', 'medicines',
      'find a pharmacy near me', 'need a pharmacy', 'buy medicines',
      'dawai', 'dawa', 'dawai ki dukan', 'dawa chahiye', 'medical store pass me',
      'ওষুধের দোকান', 'ওষুধ চাই', 'ফার্মেসি',
      'farmacia', 'pharmacie', 'صيدلية', '药房', '药店'
    ],
    conversationalResponse: {
      en: 'Here are verified pharmacies and medical stores located near you.',
      hi: 'यहाँ आपके नजदीकी सत्यापित मेडिकल स्टोर और दवा दुकानें हैं।',
      hinglish: 'Ye rahe aapke pass ke verified medical stores aur pharmacies.',
      zh: '以下是您附近的认证药房和药店。',
      es: 'Aquí tiene farmacias verificadas ubicadas cerca de usted.',
      fr: 'Voici des pharmacies vérifiées situées près de chez vous.',
      pt: 'Aqui estão farmácias verificadas localizadas perto de você.',
      ar: 'إليك صيدليات معتمدة تقع بالقرب منك.',
      bn: 'এখানে আপনার কাছাকাছি যাচাইকৃত ওষুধের দোকানসমূহ রয়েছে।',
    },
    spokenResponse: {
      en: 'Here are verified pharmacies and medical stores located near you.',
      hi: 'यहाँ आपके नजदीकी मेडिकल स्टोर और दवा दुकानें हैं।',
      hinglish: 'Pass ke verified pharmacies screen par hain.',
      zh: '已为您找到附近的药店。',
      es: 'Aquí tiene farmacias cercanas verificadas.',
      fr: 'Voici les pharmacies vérifiées près de chez vous.',
      pt: 'Aqui estão farmácias verificadas perto de você.',
      ar: 'إليك الصيدليات المعتمدة القريبة منك.',
      bn: 'এখানে আপনার কাছাকাছি ওষুধের দোকানসমূহ রয়েছে।',
    },
    actionPrompt: {
      en: 'Nearby Pharmacies',
      hi: 'नजदीकी दवा दुकानें',
      hinglish: 'Pass ke medical stores',
      bn: 'নিকটবর্তী ওষুধের দোকান',
    },
    guidance: {
      en: 'Carry a valid prescription for scheduled medications.',
      hi: 'जरूरी दवाओं के लिए डॉक्टर का पर्चा साथ रखें।',
      hinglish: 'Prescription medicines ke liye doctor ka parcha sath rakhein.',
      bn: 'প্রেসক্রিপশন সাথে রাখুন।',
    },
    doNots: {
      en: 'DO NOT take unprescribed antibiotics or heavy sedatives.',
      hi: 'बिना पर्चे के एंटीबायोटिक दवाएं न लें।',
      hinglish: 'Bina doctor ke antibiotics na lein.',
      bn: 'ডাক্তার ছাড়া অ্যান্টিবায়োটিক খাবেন না।',
    },
  },

  // 7. ROUTINE / BLOOD BANK (ROUTINE)
  {
    id: 'routine_blood_bank',
    intentCode: 'blood_bank_search',
    category: 'Blood Bank / Transfusion',
    level: 'ROUTINE',
    facilityType: 'blood_bank',
    keywords: [
      'blood bank', 'blood donor', 'platelets', 'need blood', 'blood group', 'i need a blood bank',
      'blood chahiye', 'khoon chahiye', 'platelet chahiye', 'blood donation',
      'ব্লাড ব্যাংক', 'রক্ত দরকার',
      'banco de sangre', 'banque de sang', 'banco de sangue', 'بنك الدم', '血库'
    ],
    conversationalResponse: {
      en: 'Connecting you with certified blood banks and component separation centers nearby.',
      hi: 'आपके नजदीकी अधिकृत ब्लड बैंक और रक्त घटक केंद्रों की सूची यहाँ है।',
      hinglish: 'Aapke pass ke certified blood banks aur component centers ye rahe.',
      zh: '正在为您连接附近的认证血库与成分血中心。',
      es: 'Conectándole con bancos de sangre certificados cercanos.',
      fr: 'Voici les banques de sang certifiées situées près de chez vous.',
      pt: 'Conectando você a bancos de sangue certificados próximos.',
      ar: 'إليك بنوك الدم المعتمدة القريبة منك.',
      bn: 'আপনার কাছাকাছি অনুমোদিত ব্লাড ব্যাংকসমূহের তালিকা নিচে দেওয়া হলো।',
    },
    spokenResponse: {
      en: 'Here are certified blood banks located near you.',
      hi: 'नजदीकी अधिकृत ब्लड बैंक की सूची स्क्रीन पर है।',
      hinglish: 'Pass ke certified blood banks screen par hain.',
      zh: '已为您找到附近的认证血库。',
      es: 'Aquí tiene bancos de sangre certificados cercanos.',
      fr: 'Voici les banques de sang proches de vous.',
      pt: 'Aqui estão bancos de sangue próximos.',
      ar: 'إليك بنوك الدم القريبة منك.',
      bn: 'কাছাকাছি অনুমোদিত ব্লাড ব্যাংকসমূহ দেখানো হলো।',
    },
    actionPrompt: {
      en: 'Nearby Blood Banks',
      hi: 'नजदीकी ब्लड बैंक',
      hinglish: 'Pass ke blood banks',
      bn: 'নিকটবর্তী ব্লাড ব্যাংক',
    },
    guidance: {
      en: 'Call ahead to confirm availability of specific blood groups and components.',
      hi: 'विशिष्ट रक्त समूह की उपलब्धता की पुष्टि के लिए पहले फोन करें।',
      hinglish: 'Specific blood group check karne ke liye pehle phone kar lein.',
      bn: 'নির্দিষ্ট রক্তের গ্রুপের জন্য আগে ফোন করে নিন।',
    },
    doNots: {
      en: 'DO NOT accept unverified or unauthorized private blood trade.',
      hi: 'अनधिकृत स्रोतों से रक्त न लें।',
      hinglish: 'Unauthorized sources se blood na lein.',
      bn: 'অননুমোদিত কোনো মাধ্যম থেকে রক্ত নেবেন না।',
    },
  },

  // 8. ROUTINE / DENTIST (ROUTINE)
  {
    id: 'routine_dental',
    intentCode: 'dental_search',
    category: 'Dentistry / Dental Care',
    level: 'ROUTINE',
    facilityType: 'dental',
    keywords: [
      'dentist', 'dental', 'toothache', 'teeth pain', 'tooth pain', 'broken tooth', 'cavity', 'i need a dentist',
      'daant me dard', 'dant doctor', 'dentist chahiye',
      'দাঁতের ডাক্তার', 'দাঁতে ব্যথা',
      'dentista', 'dentiste', 'طبيب أسنان', '牙医', '牙科'
    ],
    conversationalResponse: {
      en: 'A dentist or oral healthcare professional can evaluate tooth and gum concerns. Here are nearby dental clinics.',
      hi: 'दांत व मसूड़ों की समस्या के लिए डेंटिस्ट (दंत चिकित्सक) से संपर्क करें। यहाँ नजदीकी डेंटल क्लिनिक हैं।',
      hinglish: 'Dant ya gums ki problem ke liye Dentist sahi doctor hain. Pass ke dental clinics ye rahe.',
      zh: '牙医可以评估牙齿和牙龈问题。以下是附近的牙科诊所。',
      es: 'Un dentista es el profesional adecuado para problemas dentales. Aquí tiene clínicas dentales cercanas.',
      fr: 'Un dentiste peut évaluer vos problèmes dentaires. Voici des cabinets dentaires proches.',
      pt: 'Um dentista é o profissional indicado para problemas bucais. Aqui estão clínicas odontológicas próximas.',
      ar: 'طبيب الأسنان هو المختص المناسب لمشاكل الأسنان واللثة. إليك عيادات أسنان قريبة.',
      bn: 'দাঁতের সমস্যার জন্য একজন দন্তচিকিৎসক (Dentist) দেখানো উচিত। এখানে নিকটস্থ ডেন্টাল ক্লিনিকসমূহ রয়েছে।',
    },
    spokenResponse: {
      en: 'A dentist is the appropriate specialist for tooth concerns. Here are nearby clinics.',
      hi: 'दांतों की समस्या के लिए डेंटिस्ट से परामर्श लें। नजदीकी क्लिनिक स्क्रीन पर हैं।',
      hinglish: 'Dant ki problem ke liye dentist se consult karein.',
      zh: '牙医是处理牙齿问题的合适专科医生。附近诊所已列出。',
      es: 'Un dentista es el especialista adecuado para problemas dentales.',
      fr: 'Un dentiste est le spécialiste approprié pour vos soins dentaires.',
      pt: 'Um dentista é o profissional indicado para problemas dentários.',
      ar: 'طبيب الأسنان هو المختص المناسب لمشاكل الأسنان.',
      bn: 'দাঁতের চিকিৎসার জন্য দন্তচিকিৎসক দেখানো উচিত।',
    },
    actionPrompt: {
      en: 'Nearby Dental Clinics',
      hi: 'नजदीकी दंत चिकित्सालय',
      hinglish: 'Pass ke dental clinics',
      bn: 'নিকটবর্তী ডেন্টাল ক্লিনিক',
    },
    guidance: {
      en: 'Rinse with warm salt water and avoid chewing hard foods on the painful side.',
      hi: 'हल्के गुनगुने नमक पानी से कुल्ला करें और दर्द वाली तरफ कठोर भोजन न चबाएं।',
      hinglish: 'Gungune namak pani se kulla karein.',
      bn: 'হালকা গরম নুন জলে কুলকুচি করুন।',
    },
    doNots: {
      en: 'DO NOT place aspirin directly against gums, which causes chemical burns.',
      hi: 'दर्द वाली जगह मसूड़ों पर सीधे एस्पिरिन की गोली न रखें।',
      hinglish: 'Masudo par direct aspirin na dabayein.',
      bn: 'মাড়ির ওপর সরাসরি কোনো কড়া ব্যথানাশক ওষুধ চেপে রাখবেন না।',
    },
  },

  // 9. ROUTINE / GENERAL PHYSICIAN / BACK PAIN (ROUTINE)
  {
    id: 'routine_physician',
    intentCode: 'general_physician_search',
    category: 'General Physician / Primary Care',
    level: 'ROUTINE',
    facilityType: 'general_physician',
    keywords: [
      'back pain', 'who should i see for back pain', 'general doctor', 'family doctor', 'physician', 'body ache', 'mild fever', 'cough and cold',
      'kamar dard', 'peeth me dard', 'doctor dikhana hai', 'general physician', 'sardi jukham',
      'পিঠে ব্যথা', 'কোমরে ব্যথা', 'সাধারণ চিকিৎসক',
      'médico general', 'dolor de espalda', 'médecin généraliste', 'mal de dos', 'médico de família', 'dor nas costas', 'طبيب عام', 'ألم الظهر', '全科医生', '背痛'
    ],
    conversationalResponse: {
      en: 'A general physician is the best primary specialist to evaluate back pain or general symptoms, and recommend physical therapy or orthopedics if needed.',
      hi: 'पीठ दर्द या सामान्य लक्षणों के मूल्यांकन के लिए जनरल फिजिशियन (सामान्य चिकित्सक) सबसे सही पहला कदम है। यहाँ नजदीकी डॉक्टर हैं।',
      hinglish: 'Back pain ya common symptoms ke liye General Physician pehle dekhna sahi rehta hai. Pass ke doctors ye rahe.',
      zh: '全科医生是初步评估背痛或常规症状的最佳专科医生。以下是附近的医疗诊所。',
      es: 'Un médico general es el especialista adecuado para evaluar el dolor de espalda o síntomas generales.',
      fr: 'Un médecin généraliste est le praticien recommandé pour évaluer le mal de dos ou des symptômes généraux.',
      pt: 'Um médico generalista é o mais indicado para avaliar dores nas costas ou sintomas gerais.',
      ar: 'الطبيب العام هو الأنسب لتقييم ألم الظهر أو الأعراض العامة أولاً.',
      bn: 'পিঠে ব্যথা বা সাধারণ লক্ষণের প্রাথমিক মূল্যায়নের জন্য একজন সাধারণ চিকিৎসক (General Physician) দেখানো সবচেয়ে ভালো।',
    },
    spokenResponse: {
      en: 'A general physician is the recommended primary specialist for back pain and general health evaluation.',
      hi: 'पीठ दर्द या सामान्य जांच के लिए जनरल फिजिशियन से परामर्श लें।',
      hinglish: 'Back pain ke liye General Physician se consult karein.',
      zh: '全科医生是评估背痛或常规健康问题的合适首诊医生。',
      es: 'Un médico general es el especialista recomendado para evaluar el dolor de espalda.',
      fr: 'Un médecin généraliste est le spécialiste recommandé.',
      pt: 'Um médico generalista é o profissional recomendado.',
      ar: 'الطبيب العام هو الأنسب لتقييم ألم الظهر.',
      bn: 'পিঠে ব্যথার জন্য সাধারণ চিকিৎসক দেখানো উচিত।',
    },
    actionPrompt: {
      en: 'Nearby Primary Care Physicians',
      hi: 'नजदीकी सामान्य चिकित्सक',
      hinglish: 'Pass ke general physicians',
      bn: 'নিকটবর্তী সাধারণ চিকিৎসক',
    },
    guidance: {
      en: 'Maintain good posture, avoid lifting heavy loads, and rest comfortably.',
      hi: 'उचित मुद्रा में बैठें, भारी वजन न उठाएं और आराम करें।',
      hinglish: 'Heavy weight na uthayein aur aaram karein.',
      bn: 'ভারী জিনিস তুলবেন না এবং বিশ্রাম নিন।',
    },
    doNots: {
      en: 'DO NOT ignore pain accompanied by sudden leg weakness or numbness.',
      hi: 'यदि पैरों में सुन्नपन या कमजोरी आए तो तुरंत आपातकालीन कक्ष जाएं।',
      hinglish: 'Legs me numbness ho toh ignore na karein.',
      bn: 'পায়ে অবশ ভাব হলে অবহেলা করবেন না।',
    },
  },

  // 10. ROUTINE / DIAGNOSTIC LAB (ROUTINE)
  {
    id: 'routine_diagnostics',
    intentCode: 'diagnostic_lab_search',
    category: 'Diagnostic Lab / Pathology',
    level: 'ROUTINE',
    facilityType: 'diagnostic_center',
    keywords: [
      'diagnostic lab', 'blood test', 'lab test', 'x ray', 'ultrasound', 'mri', 'pathology', 'cbc test', 'i need a lab',
      'test karwana hai', 'khoon ki jaanch', 'lab center',
      'ডায়াগনস্টিক', 'রক্ত পরীক্ষা', 'ল্যাব',
      'laboratorio', 'laboratoire', 'مختبر تحاليل', '化验所', '诊断实验室'
    ],
    conversationalResponse: {
      en: 'Here are certified diagnostic laboratories and pathology testing centers in your area.',
      hi: 'यहाँ आपके नजदीकी प्रमाणित डायग्नोस्टिक लैब और जांच केंद्र हैं।',
      hinglish: 'Aapke pass ke verified diagnostic labs aur testing centers ye rahe.',
      zh: '以下是您附近的认证化验所与病理检测中心。',
      es: 'Aquí tiene laboratorios de diagnóstico y análisis clínicos certificados en su área.',
      fr: 'Voici des laboratoires d\'analyses médicales certifiés dans votre région.',
      pt: 'Aqui estão laboratórios de diagnóstico e análises clínicas certificados perto de você.',
      ar: 'إليك مختبرات تحاليل طبية معتمدة في منطقتك.',
      bn: 'এখানে আপনার এলাকার অনুমোদিত ডায়াগনস্টিক ল্যাব ও পরীক্ষা কেন্দ্রসমূহ রয়েছে।',
    },
    spokenResponse: {
      en: 'Here are certified diagnostic laboratories and pathology centers near you.',
      hi: 'प्रमाणित डायग्नोस्टिक लैब की सूची स्क्रीन पर है।',
      hinglish: 'Pass ke diagnostic testing centers screen par hain.',
      zh: '已为您找到附近的检测化验所。',
      es: 'Aquí tiene laboratorios de análisis clínicos cercanos.',
      fr: 'Voici les laboratoires d\'analyses près de chez vous.',
      pt: 'Aqui estão laboratórios de análises próximos.',
      ar: 'إليك مختبرات التحاليل القريبة منك.',
      bn: 'কাছাকাছি ডায়াগনস্টিক ল্যাব দেখানো হলো।',
    },
    actionPrompt: {
      en: 'Nearby Diagnostic Labs',
      hi: 'नजदीकी जांच केंद्र',
      hinglish: 'Pass ke diagnostic labs',
      bn: 'নিকটবর্তী ডায়াগনস্টিক ল্যাব',
    },
    guidance: {
      en: 'Confirm with the facility if fasting is required for your specific test.',
      hi: 'जांच से पहले पुष्टि कर लें कि क्या खाली पेट रहना जरूरी है।',
      hinglish: 'Fasting requirement pehle confirm karein.',
      bn: 'খালি পেটে থাকার প্রয়োজন আছে কিনা নিশ্চিত হন।',
    },
    doNots: {
      en: 'DO NOT self-interpret lab values without a medical doctor consultation.',
      hi: 'बिना डॉक्टर के परामर्श के जांच रिपोर्ट का खुद निर्णय न लें।',
      hinglish: 'Doctor ke bina reports khud interpret na karein.',
      bn: 'ডাক্তারের পরামর্শ ছাড়া রিপোর্টের ভুল ব্যাখ্যা করবেন না।',
    },
  },
];

export function classifyTriage(input: string): TriageResult {
  const normalized = input.toLowerCase().trim();

  if (!normalized) {
    return {
      urgencyLevel: 'CRITICAL',
      intentCode: 'unspecified_emergency',
      detectedCategory: 'Emergency Healthcare Navigation',
      detectedKeywords: [],
      conversationalResponse: {
        en: 'Tell CareBridge what is happening. In a critical medical emergency, immediately call 112.',
        hi: 'बताएं कि क्या हुआ है। किसी भी गंभीर आपातकाल में तुरंत 112 डायल करें।',
        hinglish: 'Bataiye kya takleef hai. Critical emergency me turant 112 milayein.',
        zh: '请告诉 CareBridge 发生了什么。在紧急情况下，请立即拨打急救电话。',
        es: 'Diga a CareBridge qué está sucediendo. En una emergencia, llame de inmediato al número local.',
        fr: 'Dites à CareBridge ce qui se passe. En cas d\'urgence, composez immédiatement les secours.',
        pt: 'Diga ao CareBridge o que está acontecendo. Em caso de emergência, ligue para o socorro.',
        ar: 'أخبر CareBridge بما يحدث. في حالات الطوارئ الحرجة، اتصل برقم الطوارئ فورًا.',
        bn: 'কী সমস্যা হচ্ছে বলুন। যে কোনো মারাত্মক জরুরী অবস্থায় অবিলম্বে ১১২ ডায়াল করুন।',
      },
      spokenResponse: {
        en: 'Tell CareBridge what is happening. In an emergency, call 112 immediately.',
        hi: 'बताएं कि क्या हुआ है। आपातकाल में तुरंत 112 मिलाएं।',
        hinglish: 'Bataiye kya hua hai. Emergency me 112 milayein.',
      },
      actionPrompt: {
        en: 'Emergency Assistance',
        hi: 'आपातकालीन सहायता',
        hinglish: 'Emergency Assistance',
        bn: 'জরুরী সহায়তা',
      },
      immediateGuidance: {
        en: 'Describe symptoms or tap a voice prompt. In an active life emergency, immediately call 112.',
        hi: 'लक्षण बताएं या बोलने के लिए माइक दबाएं। आपातकालीन स्थिति में तुरंत 112 मिलाएं।',
        hinglish: 'Symptoms batayein ya mic dabayein. Emergency me turant 112 milayein.',
        bn: 'লক্ষণ বলুন বা মাইক টিপুন। জরুরী পরিস্থিতিতে অবিলম্বে ১১২ ডায়াল করুন।',
      },
      doNots: {
        en: 'DO NOT delay calling emergency services if the patient is unresponsive or severely injured.',
        hi: 'यदि मरीज बेहोश या गंभीर घायल है तो आपातकालीन सेवा को बुलाने में देरी न करें।',
        hinglish: 'Agar patient unconscious ya severely injured hai toh 112 me deri na karein.',
        bn: 'রোগী অজ্ঞান বা গুরুতর আহত হলে জরুরী সেবায় কল করতে দেরি করবেন না।',
      },
      recommendedFacilityType: 'icu_hospital',
      suggestSwitchToNormal: false,
      confidenceScore: 0.5,
    };
  }

  let bestRule: EmergencyRule | null = null;
  let maxMatchedCount = 0;
  const matchedKeywords: string[] = [];

  for (const rule of emergencyRules) {
    let currentMatchCount = 0;
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        currentMatchCount += 1;
        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }
    }

    if (currentMatchCount > maxMatchedCount) {
      maxMatchedCount = currentMatchCount;
      bestRule = rule;
    }
  }

  if (!bestRule) {
    const criticalWords = [
      'emergency', 'severe', 'critical', 'danger', 'pain', 'bleed', 'help', 'bachao', 'madad', 'dard', 'rokto', 'sahayata',
      'urgente', 'urgencia', 'emergencia', 'secours', 'طوارئ', '紧急', '危险'
    ];
    const hasCriticalTrigger = criticalWords.some((w) => normalized.includes(w));

    if (hasCriticalTrigger) {
      return {
        urgencyLevel: 'CRITICAL',
        intentCode: 'generic_critical_emergency',
        detectedCategory: 'Acute Medical Emergency',
        detectedKeywords: matchedKeywords,
        conversationalResponse: {
          en: 'This may require immediate emergency medical attention. Call 112 and keep the patient calm and supported.',
          hi: 'यह एक गंभीर आपातकाल हो सकता है। तुरंत 112 पर कॉल करें और मरीज़ के साथ रहें।',
          hinglish: 'Yeh serious emergency lag rahi hai. Turant 112 milayein aur patient ke sath rahein.',
          zh: '这可能需要立即进行急诊医疗救治。请拨打急救电话并保持患者平静。',
          es: 'Esto puede requerir atención médica de urgencia. Llame a emergencias y mantenga la calma.',
          fr: 'Cela peut nécessiter des soins d\'urgence immédiats. Appelez les secours.',
          pt: 'Isso pode exigir atendimento de emergência imediato. Ligue para o socorro.',
          ar: 'قد يتطلب هذا عناية طبية طارئة. اتصل بالطوارئ فورًا.',
          bn: 'এটি একটি মারাত্মক জরুরী অবস্থা হতে পারে। অবিলম্বে ১১২-তে কল করুন এবং রোগীর পাশে থাকুন।',
        },
        spokenResponse: {
          en: 'Emergency. Call 112 now. Stay with the person and keep them calm.',
          hi: 'आपातकाल। तुरंत 112 पर कॉल करें। मरीज़ के साथ रहें।',
          hinglish: 'Emergency. Turant 112 call karein.',
          zh: '紧急情况。请立即拨打急救电话。',
          es: 'Emergencia. Llame a emergencias ahora.',
          fr: 'Urgence. Appelez les secours maintenant.',
          pt: 'Emergência. Ligue para a emergência agora.',
          ar: 'حالة طوارئ. اتصل بالطوارئ الآن.',
          bn: 'জরুরী অবস্থা। অবিলম্বে ১১২ ডায়াল করুন।',
        },
        actionPrompt: {
          en: 'Call 112 Immediately',
          hi: 'तुरंत 112 मिलाएं',
          hinglish: 'Turant 112 call karein',
          bn: 'অবিলম্বে ১১২ ডায়াল করুন',
        },
        immediateGuidance: {
          en: 'Keep patient calm and still. Monitor breathing continuously. Call 112 or dispatch immediate transport.',
          hi: 'मरीज को शांत और स्थिर रखें। सांस पर नजर रखें। तुरंत 112 को कॉल करें।',
          hinglish: 'Patient ko shaant aur still rakhein. Saans check karte rahein aur turant 112 milayein.',
          bn: 'রোগীকে শান্ত ও স্থির রাখুন। শ্বাসপ্রশ্বাসের ওপর নজর রাখুন। অবিলম্বে ১১২ ডাকুন।',
        },
        doNots: {
          en: 'DO NOT leave the patient alone. DO NOT give oral sedatives or food without medical direction.',
          hi: 'मरीज को अकेला न छोड़ें। बिना डॉक्टरी सलाह कोई नींद की गोली या भारी भोजन न दें।',
          hinglish: 'Patient ko akela na chhodein. Bina doctor ke koi high medicine na dein.',
          bn: 'রোগীকে একা ফেলে যাবেন না।',
        },
        recommendedFacilityType: 'icu_hospital',
        suggestSwitchToNormal: false,
        confidenceScore: 0.75,
      };
    }

    // Default conversational routine evaluation
    return {
      urgencyLevel: 'ROUTINE',
      intentCode: 'general_physician_search',
      detectedCategory: 'General Healthcare Consultation',
      detectedKeywords: [],
      conversationalResponse: {
        en: 'A general physician or clinic can help evaluate your health concerns. Here are relevant options near you.',
        hi: 'एक सामान्य चिकित्सक या क्लिनिक आपकी समस्या का मूल्यांकन कर सकते हैं। यहाँ नजदीकी स्वास्थ्य केंद्र हैं।',
        hinglish: 'Ek qualified doctor ya clinic aapki problem check kar sakte hain. Pass ke healthcare centers ye rahe.',
        zh: '全科医生或诊所可以帮助评估您的健康问题。以下是您附近的医疗机构。',
        es: 'Un médico general o clínica puede ayudar a evaluar sus inquietudes de salud. Aquí tiene opciones cercanas.',
        fr: 'Un médecin généraliste peut vous aider à évaluer votre situation. Voici des praticiens proches.',
        pt: 'Um médico generalista ou clínica pode ajudar a avaliar suas preocupações de saúde. Aqui estão opções próximas.',
        ar: 'يمكن للطبيب العام أو العيادة المساعدة في تقييم حالتك الصحية. إليك خيارات قريبة منك.',
        bn: 'একজন সাধারণ চিকিৎসক আপনার স্বাস্থ্য সমস্যা মূল্যায়ন করতে পারেন। এখানে নিকটস্থ কেন্দ্রসমূহ রয়েছে।',
      },
      spokenResponse: {
        en: 'A general physician is the recommended primary specialist. Here are options near you.',
        hi: 'सामान्य जांच के लिए नजदीकी विकल्प स्क्रीन पर हैं।',
        hinglish: 'General health check ke liye pass ke clinics screen par hain.',
        zh: '全科医生是建议的首诊专科。附近诊所已列出。',
        es: 'Un médico general es el especialista recomendado.',
        fr: 'Un médecin généraliste est le praticien recommandé.',
        pt: 'Um médico generalista é o profissional recomendado.',
        ar: 'الطبيب العام هو الأنسب لتقييم حالتك.',
        bn: 'সাধারণ স্বাস্থ্য পরীক্ষার জন্য নিকটবর্তী কেন্দ্রসমূহ দেখানো হলো।',
      },
      actionPrompt: {
        en: 'Nearby Healthcare Clinics',
        hi: 'नजदीकी क्लिनिक',
        hinglish: 'Pass ke clinics',
        bn: 'নিকটবর্তী ক্লিনিক',
      },
      immediateGuidance: {
        en: 'Seek non-emergency medical evaluation at a nearby healthcare facility. Keep rest and stay hydrated.',
        hi: 'नजदीकी अस्पताल या क्लिनिक में डॉक्टर को दिखाएं। आराम करें।',
        hinglish: 'Pass ke healthcare center me check karwayein. Aaram karein.',
        bn: 'নিকটস্থ স্বাস্থ্যকেন্দ্রে ডাক্তারের পরামর্শ নিন।',
      },
      doNots: {
        en: 'DO NOT ignore worsening symptoms or sudden severe pain.',
        hi: 'यदि दर्द अचानक बहुत बढ़ जाए तो अनदेखा न करें।',
        hinglish: 'Agar problem achanak badh jaye toh ignore na karein.',
        bn: 'লক্ষণ খারাপের দিকে গেলে অবহেला করবেন না।',
      },
      recommendedFacilityType: 'general_physician',
      suggestSwitchToNormal: true,
      confidenceScore: 0.6,
    };
  }

  return {
    urgencyLevel: bestRule.level,
    intentCode: bestRule.intentCode,
    detectedCategory: bestRule.category,
    detectedKeywords: matchedKeywords,
    conversationalResponse: bestRule.conversationalResponse,
    spokenResponse: bestRule.spokenResponse,
    actionPrompt: bestRule.actionPrompt,
    immediateGuidance: bestRule.guidance,
    doNots: bestRule.doNots,
    recommendedFacilityType: bestRule.facilityType,
    suggestSwitchToNormal: bestRule.level === 'ROUTINE',
    confidenceScore: Math.min(1.0, 0.7 + maxMatchedCount * 0.1),
  };
}
