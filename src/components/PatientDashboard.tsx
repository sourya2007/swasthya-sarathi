import React, { useState } from 'react';
import { 
  UserCircle, 
  Activity, 
  Loader2, 
  ArrowRight, 
  Heart, 
  Thermometer, 
  Activity as ActivityIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Languages, 
  Stethoscope,
  Info,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { LiveVoiceAssistant } from './LiveVoiceAssistant';

const PATIENT_TRANSLATIONS = {
  English: {
    welcome: "Welcome to Swasthya Sarathi",
    welcomeDesc: "Please provide your details and symptoms to begin your preliminary clinical triage.",
    fullName: "Full Name",
    placeholderName: "Enter your name",
    age: "Age",
    placeholderAge: "Age",
    gender: "Gender",
    selectGender: "Select...",
    male: "Male",
    female: "Female",
    other: "Other",
    prefLang: "Preferred Consultation Language",
    symptomsTitle: "Identify Your Present Symptoms (Optional)",
    startDiagnosis: "Start Diagnosis",
    preliminaryDiagnosis: "Swasthya Sarathi Preliminary Diagnosis",
    voiceActive: "Live Voice Assistant Active",
    resetIntake: "Reset Intake Details",
    intakeSummary: "Intake Summary",
    nameLabel: "Name",
    ageGenderLabel: "Age / Gender",
    prefLangLabel: "Preferred Language",
    reportedSymptoms: "Reported Symptoms",
    noSymptomsDesc: "No symptoms selected beforehand. Start voice consultation to describe symptoms.",
    firstAidTitle: "Immediate Care & First Aid",
    
    // Symptoms
    symptomFever: "High Fever / Cold",
    symptomCough: "Dry or Wet Cough",
    symptomChestPain: "Chest Pain or Tightness",
    symptomSOB: "Shortness of Breath",
    symptomHeadache: "Severe Headache / Migraine",
    symptomBodyPain: "Severe Muscle or Joint Pain",

    // Categories
    catGeneral: "General",
    catRespiratory: "Respiratory",
    catCardiac: "Cardiac",
    catNeurological: "Neurological",

    // Self Care
    tipCardiacTitle: "Immediate Cardiac Care",
    tipCardiacContent: "Sit upright in a comfortable position. Avoid any physical exertion. Loosen tight clothing. If symptoms persist or radiate to your arm/jaw, request immediate emergency dispatch.",
    tipRespTitle: "Respiratory Management",
    tipRespContent: "Stay calm. Sit upright with your shoulders relaxed. Ensure maximum room ventilation. If you have a prescribed bronchodilator/inhaler, use it now.",
    tipFeverTitle: "Fever & Hydration",
    tipFeverContent: "Rest in a cool room. Apply lukewarm wet compresses to your forehead. Consume oral hydration solutions (ORS), warm broths, or water to avoid dehydration.",
    tipCoughTitle: "Symptomatic Cough Relief",
    tipCoughContent: "Inhale steam or use warm saline gargles. Drink warm water with honey/lemon to soothe the airway. Avoid cold foods/beverages.",
    tipGenTitle: "General Wellness Advice",
    tipGenContent: "Rest adequately, check your temperature if feeling hot, monitor heart rate, and start a live voice assistant consultation below for diagnostic support."
  },
  Hindi: {
    welcome: "स्वास्थ्य सारथी में आपका स्वागत है",
    welcomeDesc: "अपनी प्रारंभिक नैदानिक ​​जांच शुरू करने के लिए कृपया अपना विवरण और लक्षण प्रदान करें।",
    fullName: "पूरा नाम",
    placeholderName: "अपना नाम दर्ज करें",
    age: "उम्र",
    placeholderAge: "उम्र",
    gender: "लिंग",
    selectGender: "चुनें...",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    prefLang: "परामर्श की पसंदीदा भाषा",
    symptomsTitle: "अपने वर्तमान लक्षणों की पहचान करें (वैकल्पिक)",
    startDiagnosis: "निदान शुरू करें",
    preliminaryDiagnosis: "स्वास्थ्य सारथी प्रारंभिक निदान",
    voiceActive: "लाइव वॉयस असिस्टेंट सक्रिय",
    resetIntake: "विवरण रीसेट करें",
    intakeSummary: "विवरण सारांश",
    nameLabel: "नाम",
    ageGenderLabel: "उम्र / लिंग",
    prefLangLabel: "पसंदीदा भाषा",
    reportedSymptoms: "बताए गए लक्षण",
    noSymptomsDesc: "पहले से कोई लक्षण नहीं चुना गया। लक्षण बताने के लिए वॉयस सहायता शुरू करें।",
    firstAidTitle: "तत्काल देखभाल और प्राथमिक चिकित्सा",
    
    // Symptoms
    symptomFever: "तेज बुखार / सर्दी",
    symptomCough: "सूखी या गीली खांसी",
    symptomChestPain: "सीने में दर्द या जकड़न",
    symptomSOB: "सांस की तकलीफ",
    symptomHeadache: "गंभीर सिरदर्द / माइग्रेन",
    symptomBodyPain: "मांसपेशियों या जोड़ों में गंभीर दर्द",

    // Categories
    catGeneral: "सामान्य",
    catRespiratory: "श्वसन",
    catCardiac: "हृदय",
    catNeurological: "न्यूरोलॉजिकल",

    // Self Care
    tipCardiacTitle: "तत्काल हृदय देखभाल",
    tipCardiacContent: "आरामदायक स्थिति में सीधे बैठें। किसी भी शारीरिक परिश्रम से बचें। तंग कपड़े ढीले करें। यदि लक्षण बने रहते हैं या आपकी बांह/जबड़े तक फैलते हैं, तो तुरंत आपातकालीन सहायता का अनुरोध करें।",
    tipRespTitle: "श्वसन प्रबंधन",
    tipRespContent: "शांत रहें। अपने कंधों को आराम देकर सीधे बैठें। कमरे में अधिकतम वेंटिलेशन सुनिश्चित करें। यदि आपके पास निर्धारित ब्रोन्कोडायलेटर/इनहेलर है, तो उसका अभी उपयोग करें।",
    tipFeverTitle: "बुखार और जलयोजन",
    tipFeverContent: "ठंडे कमरे में आराम करें। माथे पर गुनगुने पानी की गीली पट्टियां लगाएं। डिहाइड्रेशन से बचने के लिए ओआरएस (ORS), गुनगुना सूप या पानी पिएं।",
    tipCoughTitle: "खांसी से राहत",
    tipCoughContent: "भाप लें या गुनगुने पानी में नमक डालकर गरारे करें। सांस की नली को आराम देने के लिए शहद/नींबू के साथ गुनगुना पानी पिएं। ठंडे खाद्य पदार्थों/पेय पदार्थों से बचें।",
    tipGenTitle: "सामान्य स्वास्थ्य सलाह",
    tipGenContent: "पर्याप्त आराम करें, बुखार होने पर तापमान जांचें, हृदय गति की निगरानी करें, और नैदानिक ​​सहायता के लिए नीचे लाइव वॉयस असिस्टेंट परामर्श शुरू करें।"
  },
  Bengali: {
    welcome: "স্বাগতম স্বাস্থ্য সারথি-তে",
    welcomeDesc: "আপনার প্রাথমিক চিকিৎসাগত ট্রায়েজ শুরু করতে অনুগ্রহ করে আপনার বিবরণ এবং লক্ষণগুলি প্রদান করুন।",
    fullName: "সম্পূর্ণ নাম",
    placeholderName: "আপনার নাম লিখুন",
    age: "বয়স",
    placeholderAge: "বয়স",
    gender: "লিঙ্গ",
    selectGender: "নির্বাচন করুন...",
    male: "পুরুষ",
    female: "মহিলা",
    other: "অন্যান্য",
    prefLang: "পছন্দের পরামর্শের ভাষা",
    symptomsTitle: "আপনার বর্তমান লক্ষণগুলি চিহ্নিত করুন (ঐচ্ছিক)",
    startDiagnosis: "নির্ণয় শুরু করুন",
    preliminaryDiagnosis: "স্বাস্থ্য সারথি প্রাথমিক রোগ নির্ণয়",
    voiceActive: "লাইভ ভয়েস সহকারী সক্রিয়",
    resetIntake: "তথ্য রিসেট করুন",
    intakeSummary: "তথ্যের সারাংশ",
    nameLabel: "নাম",
    ageGenderLabel: "বয়স / লিঙ্গ",
    prefLangLabel: "পছন্দের ভাষা",
    reportedSymptoms: "জানানো লক্ষণসমূহ",
    noSymptomsDesc: "আগে থেকে কোনো লক্ষণ নির্বাচন করা হয়নি। লক্ষণগুলি বর্ণনা করতে ভয়েস পরামর্শ শুরু করুন।",
    firstAidTitle: "জরুরী যত্ন ও প্রাথমিক চিকিৎসা",
    
    // Symptoms
    symptomFever: "উচ্চ জ্বর / সর্দি",
    symptomCough: "শুকনো বা ভেজা কাশি",
    symptomChestPain: "বুকে ব্যথা বা জকড়ন",
    symptomSOB: "শ্বাসকষ্ট",
    symptomHeadache: "তীব্র মাথাব্যথা / মাইগ্রেন",
    symptomBodyPain: "তীব্র পেশী বা জয়েন্টে ব্যথা",

    // Categories
    catGeneral: "সাধারণ",
    catRespiratory: "শ্বাসকষ্ট সংক্রান্ত",
    catCardiac: "হৃদরোগ সংক্রান্ত",
    catNeurological: "স্নায়বিক",

    // Self Care
    tipCardiacTitle: "জরুরী হৃদরোগের যত্ন",
    tipCardiacContent: "একটি আরামদায়ক অবস্থানে সোজা হয়ে বসুন। যেকোনো শারীরিক পরিশ্রম এড়িয়ে চলুন। আঁটসাঁট পোশাক ঢিলেঢালা করুন। লক্ষণগুলি অব্যাহত থাকলে বা আপনার বাহু/চোয়ালে ছড়িয়ে পড়লে, অবিলম্বে জরুরি সহায়তার অনুরোধ করুন।",
    tipRespTitle: "শ্বাসকষ্টের ব্যবস্থাপনা",
    tipRespContent: "শান্ত থাকুন। কাঁধ শি灵活 করে সোজা হয়ে বসুন। ঘরের সর্বোচ্চ বায়ু চলাচল নিশ্চিত করুন। আপনার যদি কোনো নির্ধারিত ব্রঙ্কোডাইলেটর/ইনহেলার থাকে তবে তা এখনই ব্যবহার করুন।",
    tipFeverTitle: "জ্বর এবং হাইড্রেশন",
    tipFeverContent: "একটি ঠান্ডা ঘরে বিশ্রাম নিন। কপালে হালকা গরম জলের ভেজা জলপট্টি দিন। ডিহাইড্রেশন এড়াতে ওআরএস (ORS), হালকা গরম সুপ বা জল পান করুন।",
    tipCoughTitle: "কাশির উপশম",
    tipCoughContent: "ভাপ নিন বা হালকা গরম নুন জলে গার্গল করুন। শ্বাসনালীকে প্রশমিত করতে মধু/লেবুর সাথে হালকা গরম জল পান করুন। ঠান্ডা খাবার/পানীয় এড়িয়ে চলুন।",
    tipGenTitle: "সাধারণ স্বাস্থ্য পরামর্শ",
    tipGenContent: "পর্যাপ্ত বিশ্রাম নিন, শরীর গরম লাগলে তাপমাত্রা পরীক্ষা করুন, হৃদস্পন্দন পর্যবেক্ষণ করুন এবং ডায়াগनস্টিক সহায়তার জন্য নিচে লাইভ ভয়েস অ্যাসিস্ট্যান্ট পরামর্শ শুরু করুন।"
  },
  Marathi: {
    welcome: "स्वास्थ्य सारथी मध्ये आपले स्वागत आहे",
    welcomeDesc: "तुमची प्राथमिक क्लिनिकल तपासणी सुरू करण्यासाठी कृपया तुमची माहिती आणि लक्षणे प्रदान करा.",
    fullName: "पूर्ण नाव",
    placeholderName: "तुमचे नाव प्रविष्ट करा",
    age: "वय",
    placeholderAge: "वय",
    gender: "लिंग",
    selectGender: "निवडा...",
    male: "पुरुष",
    female: "महिला",
    other: "इतर",
    prefLang: "सल्लामसलत करण्याची आवडती भाषा",
    symptomsTitle: "तुमची सध्याची लक्षणे ओळखा (पर्यायी)",
    startDiagnosis: "तपासणी सुरू करा",
    preliminaryDiagnosis: "स्वास्थ्य सारथी प्राथमिक तपासणी",
    voiceActive: "थेट व्हॉइस असिस्टंट सक्रिय",
    resetIntake: "माहिती रीसेट करा",
    intakeSummary: "माहितीचा सारांश",
    nameLabel: "नाव",
    ageGenderLabel: "वय / लिंग",
    prefLangLabel: "पसंतीची भाषा",
    reportedSymptoms: "सांगितलेली लक्षणे",
    noSymptomsDesc: "आधी कोणतेही लक्षण निवडले नाही. लक्षणे सांगण्यासाठी व्हॉइस मदत सुरू करा.",
    firstAidTitle: "तात्काळ काळजी आणि प्रथमोपचार",
    
    // Symptoms
    symptomFever: "तीव्र ताप / सर्दी",
    symptomCough: "कोरडा किंवा ओला खोकला",
    symptomChestPain: "छातीत दुखणे किंवा जडपणा",
    symptomSOB: "श्वास घेण्यास त्रास होणे",
    symptomHeadache: "तीव्र डोकेदुखी / मायग्रेन",
    symptomBodyPain: "स्नायू किंवा सांधेदुखी",

    // Categories
    catGeneral: "सामान्य",
    catRespiratory: "श्वसन",
    catCardiac: "हृदय",
    catNeurological: "न्यूरोलॉजिकल",

    // Self Care
    tipCardiacTitle: "तात्काळ हृदय काळजी",
    tipCardiacContent: "आरामशीर स्थितीत ताठ बसा. कोणतेही शारीरिक श्रम टाळा. घट्ट कपडे सैल करा. लक्षणे कायम राहिल्यास किंवा हात/जबड्यापर्यंत पसरल्यास, त्वरित आपत्कालीन मदतीची विनंती करा.",
    tipRespTitle: "श्वसन व्यवस्थापन",
    tipRespContent: "शांत राहा. खांदे सैल ठेवून ताठ बसा. खोलीत भरपूर हवा खेळती राहू द्या. तुमच्याकडे आधीच लिहून दिलेले ब्रॉन्कोडायलेटर/इन्हेलर असल्यास, ते आत्ता वापरा.",
    tipFeverTitle: "ताप आणि हायड्रेशन",
    tipFeverContent: "थंड खोलीत विश्रांती घ्या. कपाळावर कोमट पाण्याच्या ओल्या पट्ट्या ठेवा. डिहायड्रेशन टाळण्यासाठी ओआरएस (ORS), कोमट सूप किंवा पाणी प्या.",
    tipCoughTitle: "खोकल्यापासून आराम",
    tipCoughContent: "वाफ घ्या किंवा कोमट पाण्यात मीठ टाकून गुळण्या करा. श्वसनमार्ग मोकळा करण्यासाठी मध/लिंबूसह कोमट पाणी प्या. थंड पदार्थ/पेये टाळा.",
    tipGenTitle: "सामान्य आरोग्य सल्ला",
    tipGenContent: "पुरेशी विश्रांती घ्या, ताप आल्यास तापमान तपासा, हृदय गतीचे निरीक्षण करा आणि वैद्यकीय मदतीसाठी खाली थेट व्हॉइस असिस्टंट सल्लामसलत सुरू करा।"
  }
};

export function PatientDashboard() {
  const [step, setStep] = useState(1);
  const [patientDetails, setPatientDetails] = useState({ 
    name: '', 
    age: '', 
    gender: '',
    language: 'English',
    selectedSymptoms: [] as string[]
  });

  const currentLang = (patientDetails.language as keyof typeof PATIENT_TRANSLATIONS) || 'English';
  const t = PATIENT_TRANSLATIONS[currentLang];

  const symptomOptions = [
    { id: 'fever', label: t.symptomFever, category: t.catGeneral, rawLabel: 'High Fever / Cold' },
    { id: 'cough', label: t.symptomCough, category: t.catRespiratory, rawLabel: 'Dry or Wet Cough' },
    { id: 'chest_pain', label: t.symptomChestPain, category: t.catCardiac, rawLabel: 'Chest Pain or Tightness' },
    { id: 'breathing_difficulty', label: t.symptomSOB, category: t.catRespiratory, rawLabel: 'Shortness of Breath' },
    { id: 'headache', label: t.symptomHeadache, category: t.catNeurological, rawLabel: 'Severe Headache / Migraine' },
    { id: 'body_pain', label: t.symptomBodyPain, category: t.catGeneral, rawLabel: 'Severe Muscle or Joint Pain' }
  ];

  const toggleSymptom = (rawLabel: string) => {
    if (patientDetails.selectedSymptoms.includes(rawLabel)) {
      setPatientDetails({
        ...patientDetails,
        selectedSymptoms: patientDetails.selectedSymptoms.filter(s => s !== rawLabel)
      });
    } else {
      setPatientDetails({
        ...patientDetails,
        selectedSymptoms: [...patientDetails.selectedSymptoms, rawLabel]
      });
    }
  };

  const getSelfCareTips = () => {
    const tips: { title: string, content: string, urgent: boolean }[] = [];
    
    if (patientDetails.selectedSymptoms.includes('Chest Pain or Tightness')) {
      tips.push({
        title: t.tipCardiacTitle,
        content: t.tipCardiacContent,
        urgent: true
      });
    }
    if (patientDetails.selectedSymptoms.includes('Shortness of Breath')) {
      tips.push({
        title: t.tipRespTitle,
        content: t.tipRespContent,
        urgent: true
      });
    }
    if (patientDetails.selectedSymptoms.includes('High Fever / Cold')) {
      tips.push({
        title: t.tipFeverTitle,
        content: t.tipFeverContent,
        urgent: false
      });
    }
    if (patientDetails.selectedSymptoms.includes('Dry or Wet Cough')) {
      tips.push({
        title: t.tipCoughTitle,
        content: t.tipCoughContent,
        urgent: false
      });
    }

    // Default general advice if no symptoms are selected or in addition
    if (tips.length === 0) {
      tips.push({
        title: t.tipGenTitle,
        content: t.tipGenContent,
        urgent: false
      });
    }

    return tips;
  };

  if (step === 1) {
    return (
      <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto items-center justify-center">
        <div className="bg-white max-w-xl w-full p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-1">{t.welcome}</h2>
          <p className="text-sm text-center text-slate-500 mb-8">{t.welcomeDesc}</p>
          
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
            
            {/* Row 1: Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">{t.fullName}</label>
                <input 
                  required
                  type="text" 
                  value={patientDetails.name}
                  onChange={e => setPatientDetails({...patientDetails, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder={t.placeholderName}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">{t.age}</label>
                <input 
                  required
                  type="number" 
                  value={patientDetails.age}
                  onChange={e => setPatientDetails({...patientDetails, age: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder={t.placeholderAge}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">{t.gender}</label>
                <select 
                  required
                  value={patientDetails.gender}
                  onChange={e => setPatientDetails({...patientDetails, gender: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">{t.selectGender}</option>
                  <option value="Male">{t.male}</option>
                  <option value="Female">{t.female}</option>
                  <option value="Other">{t.other}</option>
                </select>
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-indigo-500" /> {t.prefLang}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['English', 'Hindi', 'Bengali', 'Marathi'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setPatientDetails({...patientDetails, language: lang})}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      patientDetails.language === lang 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {lang === 'English' ? 'English' : lang === 'Hindi' ? 'हिंदी' : lang === 'Bengali' ? 'বাংলা' : 'मराठी'}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms Checklist */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-indigo-500" /> {t.symptomsTitle}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptomOptions.map((sym) => {
                  const isChecked = patientDetails.selectedSymptoms.includes(sym.rawLabel);
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => toggleSymptom(sym.rawLabel)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                        isChecked 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{sym.label}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                        isChecked ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {sym.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-indigo-200 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
              {t.startDiagnosis} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden text-slate-900">
      
      {/* Top Banner with profile */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">{t.preliminaryDiagnosis}</h2>
            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" /> {t.voiceActive}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.nameLabel}: <span className="font-bold text-slate-700">{patientDetails.name}</span> ({patientDetails.gender === 'Male' ? t.male : patientDetails.gender === 'Female' ? t.female : t.other}, {patientDetails.age} yrs) | {t.prefLangLabel}: <span className="font-bold text-slate-700">{patientDetails.language}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setStep(1);
            setPatientDetails({
              name: '',
              age: '',
              gender: '',
              language: patientDetails.language,
              selectedSymptoms: []
            });
          }}
          className="self-start sm:self-center px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-semibold transition-all"
        >
          {t.resetIntake}
        </button>
      </div>
      
      {/* Dynamic layout split */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        
        {/* Left column: Selected profile & Real-time self care suggestions */}
        <div className="w-full xl:w-80 bg-white border-r border-slate-200 p-5 flex flex-col gap-5 shrink-0 overflow-y-auto">
          
          {/* Diagnostic Context */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500" /> {t.intakeSummary}
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-100">
                <span className="text-slate-500">{t.nameLabel}</span>
                <span className="font-bold text-slate-800">{patientDetails.name}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-100">
                <span className="text-slate-500">{t.ageGenderLabel}</span>
                <span className="font-bold text-slate-800">{patientDetails.age} / {patientDetails.gender === 'Male' ? t.male : patientDetails.gender === 'Female' ? t.female : t.other}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-100">
                <span className="text-slate-500">{t.prefLangLabel}</span>
                <span className="font-bold text-slate-800">{patientDetails.language}</span>
              </div>
            </div>
          </div>

          {/* Present Symptoms List */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-500" /> {t.reportedSymptoms}
            </h3>
            {patientDetails.selectedSymptoms.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {patientDetails.selectedSymptoms.map((rawSymptom, idx) => {
                  const symOpt = symptomOptions.find(s => s.rawLabel === rawSymptom);
                  const displaySymptom = symOpt ? symOpt.label : rawSymptom;
                  return (
                    <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold rounded-lg uppercase">
                      {displaySymptom}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">{t.noSymptomsDesc}</p>
            )}
          </div>

          {/* First Aid Suggestions based on selected symptoms */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> {t.firstAidTitle}
            </h3>
            <div className="space-y-3 overflow-y-auto pr-1">
              {getSelfCareTips().map((tip, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border ${
                    tip.urgent 
                      ? 'bg-red-50/70 border-red-200 text-red-900' 
                      : 'bg-indigo-50/50 border-indigo-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {tip.urgent ? (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold tracking-tight">{tip.title}</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">{tip.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Interactive Voice Assistant (occupies remaining screen) */}
        <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden relative">
          <LiveVoiceAssistant isPatientView={true} patientName={patientDetails.name} preferredLanguage={patientDetails.language} />
        </div>

      </div>

    </div>
  );
}
