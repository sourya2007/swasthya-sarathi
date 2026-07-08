"use client";

import React, { useState, useRef, useEffect } from "react";
import { TriageResultPayload, TriageStatus } from "@/types/triage";
import { ManagementPayload, StockWarning, DemandForecast, Redistribution, FlaggedCentre } from "@/types/management";
import { LiveVoiceAssistant } from "@/components/LiveVoiceAssistant";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "@/lib/firebase";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Languages, 
  Activity,
  Mic,
  Square,
  Building2,
  TrendingUp,
  PackageMinus,
  Users,
  Stethoscope,
  Network,
  AudioLines,
  LogOut,
  History,
  MapPin
} from "lucide-react";

const SAMPLE_SCENARIOS = [
  {
    label: "Chest Pain (Critical)",
    text: "Patient is a 55-year-old male presenting with severe, crushing chest pain radiating to the left arm and jaw. Started 30 minutes ago. He is sweating profusely and feels short of breath.",
  },
  {
    label: "Fever & Cough (Routine)",
    text: "12 year old boy with a mild fever of 99.8F and a dry cough for the past 2 days. Eating and drinking normally, no breathing difficulties.",
  },
  {
    label: "Animal Bite (Urgent)",
    text: "24-year-old woman bitten by a stray dog on her right calf about 2 hours ago. The wound is bleeding moderately and she hasn't had a tetanus shot in 10 years.",
  }
];

const MANAGEMENT_SCENARIOS = [
  {
    label: "Routine Morning Report",
    text: "We have had 150 patients today. 4 out of 5 doctors are present. We have 10 beds available. Paracetamol stock is low, might last 2 days. Dengue testing kits are completely out.",
  },
  {
    label: "Monsoon Outbreak",
    text: "Heavy footfall today, 300+ patients with fever and chills. All beds are full. We need urgent supply of IV fluids and antimalarials. 2 doctors on leave. Nearby CHC has free beds.",
  }
];

const UI_TRANSLATIONS = {
  English: {
    title: "Swasthya Sarathi",
    subtitle: "AI Public Healthcare Triage",
    tabTriage: "Patient Triage",
    tabManagement: "Centre Management",
    tabMonitoring: "Resource Monitoring",
    tabVoiceAssistance: "Live Assistant",
    patientIntake: "Patient Intake",
    symptomsDescription: "Symptoms Description",
    placeholder: "Describe the patient's condition in English, Hindi, or local dialect...",
    quickTestScenarios: "Quick Test Scenarios",
    analyzeButton: "Analyze & Triage Patient",
    boardTitle: "Triage Analytics Board",
    emptyBoard: "Enter a patient description to generate triage analytics.",
    processing: "Processing clinical data...",
    location: "Location",
    clinic: "Rural PHC",
    reportIntake: "Daily Centre Report",
    reportDescription: "Centre Status Description",
    reportPlaceholder: "Describe today's footfall, stock levels (e.g. Paracetamol), bed availability, and doctor attendance...",
    analyzeReportButton: "Analyze Centre Status",
    managementBoardTitle: "District Management Board",
    emptyManagementBoard: "Enter centre status report to generate district insights.",
    monitoringTitle: "Live Resource Grid",
    monitoringDesc: "Real-time resource tracking across district health centres.",
  },
  Hindi: {
    title: "स्वास्थ्य सारथी",
    subtitle: "एआई सार्वजनिक स्वास्थ्य ट्राइएज",
    tabTriage: "मरीज ट्राइएज",
    tabManagement: "केंद्र प्रबंधन",
    tabMonitoring: "संसाधन निगरानी",
    tabVoiceAssistance: "लाइव सहायक",
    patientIntake: "मरीज की जानकारी",
    symptomsDescription: "लक्षणों का विवरण",
    placeholder: "मरीज की स्थिति का वर्णन करें...",
    quickTestScenarios: "त्वरित परीक्षण परिदृश्य",
    analyzeButton: "विश्लेषण और ट्राइएज करें",
    boardTitle: "ट्राइएज एनालिटिक्स बोर्ड",
    emptyBoard: "ट्राइएज एनालिटिक्स उत्पन्न करने के लिए मरीज का विवरण दर्ज करें।",
    processing: "क्लिनिकल डेटा प्रोसेस हो रहा है...",
    location: "स्थान",
    clinic: "ग्रामीण प्राथमिक स्वास्थ्य केंद्र",
    reportIntake: "दैनिक केंद्र रिपोर्ट",
    reportDescription: "केंद्र स्थिति विवरण",
    reportPlaceholder: "आज की फुटफॉल, स्टॉक लेवल, बेड उपलब्धता का वर्णन करें...",
    analyzeReportButton: "केंद्र स्थिति का विश्लेषण करें",
    managementBoardTitle: "जिला प्रबंधन बोर्ड",
    emptyManagementBoard: "जिला इनसाइट्स उत्पन्न करने के लिए केंद्र स्थिति रिपोर्ट दर्ज करें।",
    monitoringTitle: "लाइव रिसोर्स ग्रिड",
    monitoringDesc: "जिला स्वास्थ्य केंद्रों में रीयल-टाइम संसाधन ट्रैकिंग।",
  },
  Bengali: {
    title: "স্বাস্থ্য সারথি",
    subtitle: "এআই পাবলিক হেলথকেয়ার ট্রায়েজ",
    tabTriage: "রোগীর ট্রায়েজ",
    tabManagement: "কেন্দ্র ব্যবস্থাপনা",
    tabMonitoring: "সম্পদ পর্যবেক্ষণ",
    tabVoiceAssistance: "লাইভ সহকারী",
    patientIntake: "রোগীর তথ্য",
    symptomsDescription: "লক্ষণগুলির বিবরণ",
    placeholder: "রোগীর অবস্থার বর্ণনা দিন...",
    quickTestScenarios: "দ্রুত পরীক্ষার পরিস্থিতি",
    analyzeButton: "বিশ্লেষণ এবং ট্রায়েজ করুন",
    boardTitle: "ট্রায়েজ অ্যানালিটিক্স বোর্ড",
    emptyBoard: "ট্রায়েজ অ্যানালিটিক্স তৈরি করতে রোগীর বিবরণ লিখুন।",
    processing: "ক্লিনিক্যাল ডেটা প্রসেস করা হচ্ছে...",
    location: "অবস্থান",
    clinic: "গ্রামীণ পিএইচসি",
    reportIntake: "দৈনিক কেন্দ্র রিপোর্ট",
    reportDescription: "কেন্দ্রের অবস্থার বিবরণ",
    reportPlaceholder: "আজকের ফুটফল, স্টকের মাত্রা, শয্যার প্রাপ্যতা বর্ণনা করুন...",
    analyzeReportButton: "কেন্দ্রের অবস্থা বিশ্লেষণ করুন",
    managementBoardTitle: "জেলা ব্যবস্থাপনা বোর্ড",
    emptyManagementBoard: "জেলা ইনসাইটস তৈরি করতে কেন্দ্রের অবস্থার রিপোর্ট লিখুন।",
    monitoringTitle: "লাইভ রিসোর্স গ্রিড",
    monitoringDesc: "জেলা স্বাস্থ্য কেন্দ্র জুড়ে রিয়েল-টাইম সম্পদ ট্র্যাকিং।",
  },
  Marathi: {
    title: "स्वास्थ्य सारथी",
    subtitle: "एआय सार्वजनिक आरोग्य ट्रायज",
    tabTriage: "रुग्ण ट्रायज",
    tabManagement: "केंद्र व्यवस्थापन",
    tabMonitoring: "संसाधन सनियंत्रण",
    tabVoiceAssistance: "थेट सहाय्यक",
    patientIntake: "रुग्णाची माहिती",
    symptomsDescription: "लक्षणे वर्णन",
    placeholder: "रुग्णाच्या स्थितीचे वर्णन करा...",
    quickTestScenarios: "त्वरित चाचणी परिस्थिती",
    analyzeButton: "विश्लेषण आणि ट्रायज करा",
    boardTitle: "ट्रायज ॲनालिटिक्स बोर्ड",
    emptyBoard: "ट्रायज ॲनालिटिक्स व्युत्पन्न करण्यासाठी रुग्णाचे वर्णन प्रविष्ट करा.",
    processing: "क्लिनिकल डेटा प्रक्रिया करत आहे...",
    location: "स्थान",
    clinic: "ग्रामीण प्राथमिक आरोग्य केंद्र",
    reportIntake: "दैनिक केंद्र अहवाल",
    reportDescription: "केंद्र स्थिति वर्णन",
    reportPlaceholder: "आजची फुटफॉल, स्टॉक पातळी, बेड उपलब्धता वर्णन करा...",
    analyzeReportButton: "केंद्र स्थितीचे विश्लेषण करा",
    managementBoardTitle: "जिल्हा व्यवस्थापन बोर्ड",
    emptyManagementBoard: "जिल्हा इनसाइट्स व्युत्पन्न करण्यासाठी केंद्र स्थिती अहवाल प्रविष्ट करा.",
    monitoringTitle: "थेट संसाधन ग्रिड",
    monitoringDesc: "जिल्हा आरोग्य केंद्रांवर रिअल-टाइम संसाधन ट्रॅकिंग.",
  }
};

import { AuthProvider, useSession, signIn, signOut } from "@/components/AuthProvider";
import { LiveResourceGrid } from "@/components/LiveResourceGrid";
import { CentreManagementView } from "@/components/CentreManagementView";
import { ProfileViewModal } from "@/components/ProfileViewModal";
import { DoctorDashboard } from "@/components/DoctorDashboard";
import { PatientDashboard } from "@/components/PatientDashboard";
import { useResourceMonitoring } from "@/hooks/useResourceMonitoring";

function SwasthyaSarathiPageContent() {
  const { data: session, status } = useSession();
  const resources = useResourceMonitoring();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"TRIAGE" | "MANAGEMENT" | "MONITORING" | "VOICE_ASSISTANT">("TRIAGE");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TriageResultPayload | null>(null);
  const [managementResult, setManagementResult] = useState<ManagementPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  
  const [selectedRole, setSelectedRole] = useState<"Centre Admin" | "Doctor" | "Patient">("Centre Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const baseT = UI_TRANSLATIONS[preferredLanguage as keyof typeof UI_TRANSLATIONS] || UI_TRANSLATIONS.English;

  // Saved record interfaces
  interface SavedTriageRecord {
    id: string;
    description: string;
    triageStatus: TriageStatus;
    languageDetected: string;
    estimatedDuration: string;
    extractedSymptoms: string[];
    suggestedAction: string;
    administrativeAlertFlags: string[];
    timestamp: string;
  }

  interface SavedManagementRecord {
    id: string;
    description: string;
    metrics: {
      footfall: string;
      bedsAvailable: string;
      doctorAttendance: string;
      testsAvailable: string;
    };
    stockWarnings: StockWarning[];
    demandForecasts: DemandForecast[];
    redistributionRecommendations: Redistribution[];
    flaggedCentres: FlaggedCentre[];
    timestamp: string;
  }

  const [savedTriageRecords, setSavedTriageRecords] = useState<SavedTriageRecord[]>([]);
  const [savedManagementRecords, setSavedManagementRecords] = useState<SavedManagementRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [historyCounter, setHistoryCounter] = useState(0);

  const loadHistory = () => {
    setHistoryCounter((prev) => prev + 1);
  };

  useEffect(() => {
    if (!session?.user?.email) return;
    
    let active = true;
    
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      try {
        // Wait for Firebase Auth to be ready (with timeout)
        await Promise.race([
          new Promise<void>((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
              unsubscribe();
              resolve();
            });
          }),
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 5000))
        ]);

        if (!auth.currentUser) {
          console.warn("Firebase Auth user is not initialized, skipping Firestore fetch.");
          if (active) setIsHistoryLoading(false);
          return;
        }

        if (activeTab === "TRIAGE") {
          const q = query(
            collection(db, "triage_records"),
            where("userId", "==", auth.currentUser.email)
          );
          const querySnapshot = await getDocs(q);
          const records: SavedTriageRecord[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            records.push({
              id: doc.id,
              description: data.description || "",
              triageStatus: data.triageStatus || "GREEN",
              languageDetected: data.languageDetected || "",
              estimatedDuration: data.estimatedDuration || "",
              extractedSymptoms: data.extractedSymptoms || [],
              suggestedAction: data.suggestedAction || "",
              administrativeAlertFlags: data.administrativeAlertFlags || [],
              timestamp: data.timestamp || new Date().toISOString(),
            });
          });
          // Sort in-memory client-side to avoid composite index requirement
          records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          if (active) {
            setSavedTriageRecords(records);
          }
        } else if (activeTab === "MANAGEMENT") {
          const q = query(
            collection(db, "management_records"),
            where("userId", "==", auth.currentUser.email)
          );
          const querySnapshot = await getDocs(q);
          const records: SavedManagementRecord[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            records.push({
              id: doc.id,
              description: data.description || "",
              metrics: data.metrics || { footfall: "0", bedsAvailable: "0", doctorAttendance: "0", testsAvailable: "0" },
              stockWarnings: data.stockWarnings || [],
              demandForecasts: data.demandForecasts || [],
              redistributionRecommendations: data.redistributionRecommendations || [],
              flaggedCentres: data.flaggedCentres || [],
              timestamp: data.timestamp || new Date().toISOString(),
            });
          });
          // Sort in-memory client-side to avoid composite index requirement
          records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          if (active) {
            setSavedManagementRecords(records);
          }
        }
      } catch (err) {
        console.error("Error loading history from Firestore:", err);
      } finally {
        if (active) {
          setIsHistoryLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      active = false;
    };
  }, [session?.user?.email, activeTab, historyCounter]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Small simulated delay to provide high-fidelity secure sync assurance
      await new Promise((resolve) => setTimeout(resolve, 800));
      await signOut();
    } catch (err) {
      console.error("Error during log out:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        audioChunksRef.current = [];
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          handleAnalyze({ audio: { base64: base64data, mimeType: audioBlob.type } });
        };
        stream.getTracks().forEach(track => track.stop());
      };
      
      audioChunksRef.current = [];
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing mic:", err);
      setError("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async (payload?: { audio?: { base64: string, mimeType: string } }) => {
    const isAudio = !!payload?.audio;
    if (!isAudio && !description.trim()) return;

    setIsLoading(true);
    setError(null);
    
    const bodyData = isAudio 
      ? { audio: payload.audio, description, preferredLanguage } 
      : { description, preferredLanguage };

    try {
      const endpoint = activeTab === "TRIAGE" ? "/api/triage" : "/api/management";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        let errMsg = "Failed to process request.";
        try {
          const errBody = await res.json();
          if (errBody.error) errMsg = errBody.error;
          if (errBody.details) errMsg += ` ${errBody.details}`;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      
      if (activeTab === "TRIAGE") {
        setResult(data);
        if (auth.currentUser?.email) {
          try {
            await addDoc(collection(db, "triage_records"), {
              userId: auth.currentUser.email,
              description: data.transcription || description,
              triageStatus: data.triageStatus || "GREEN",
              languageDetected: data.languageDetected || preferredLanguage,
              estimatedDuration: data.estimatedDuration || "",
              extractedSymptoms: data.extractedSymptoms || [],
              suggestedAction: data.suggestedAction || "",
              administrativeAlertFlags: data.administrativeAlertFlags || [],
              timestamp: new Date().toISOString(),
            });
            loadHistory();
          } catch (saveErr) {
            console.error("Failed to save triage record to Firestore:", saveErr);
          }
        }
      } else {
        setManagementResult(data);
        if (auth.currentUser?.email) {
          try {
            await addDoc(collection(db, "management_records"), {
              userId: auth.currentUser.email,
              description: data.transcription || description,
              metrics: data.metrics || { footfall: "0", bedsAvailable: "0", doctorAttendance: "0", testsAvailable: "0" },
              stockWarnings: data.stockWarnings || [],
              demandForecasts: data.demandForecasts || [],
              redistributionRecommendations: data.redistributionRecommendations || [],
              flaggedCentres: data.flaggedCentres || [],
              timestamp: new Date().toISOString(),
            });
            loadHistory();
          } catch (saveErr) {
            console.error("Failed to save management record to Firestore:", saveErr);
          }
        }
      }
      
      if (data.transcription) {
        setDescription(data.transcription);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: TriageStatus) => {
    switch (status) {
      case "RED": return <AlertCircle className="w-6 h-6 text-red-600" />;
      case "AMBER": return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case "GREEN": return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      default: return <Info className="w-6 h-6 text-slate-600" />;
    }
  };

  const t = result?.uiTranslations || {
    statusBannerPriority: "Priority Level",
    statusBannerMessage: result?.triageStatus === "RED" ? "Immediate Medical Intervention Required" :
                         result?.triageStatus === "AMBER" ? "Urgent Care Needed Soon" :
                         "Routine Care or Self-Management",
    estResponseTimeLabel: "Est. Response Time",
    languageLabel: "Language",
    estDurationLabel: "Est. Duration",
    extractedSymptomsLabel: "Extracted Symptoms",
    noSymptomsLabel: "No specific symptoms extracted.",
    suggestedActionPlanLabel: "Suggested Action Plan",
    administrativeAlertsLabel: "Administrative Alerts",
    patientIntakeLabel: baseT.patientIntake,
    symptomsDescriptionLabel: baseT.symptomsDescription,
    quickTestScenariosLabel: baseT.quickTestScenarios,
    analyzeButtonLabel: baseT.analyzeButton
  };

  const mt = managementResult?.uiTranslations || {
    metricsTitle: "Key Metrics",
    stockWarningsTitle: "Early Stock-Out Warnings",
    demandForecastsTitle: "AI Demand Forecasts",
    redistributionTitle: "Resource Redistribution",
    flaggedCentresTitle: "Flagged Centres",
  };

  const handleLogin = async () => {
    signIn();
  };

  if (status === "loading" || isLoggingOut) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        {isLoggingOut && (
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Storing clinical records & logging out securely...
          </p>
        )}
      </div>
    );
  }

  

  const handleLoginSubmit = async (e?: React.FormEvent, isGoogle = false) => {
    if (e) e.preventDefault();
    setIsLoginLoading(true);
    let apiRole = selectedRole === "Centre Admin" ? "administrator" : selectedRole === "Doctor" ? "doctor" : "patient";
    
    if (isGoogle) {
       
      await signIn(apiRole);
    } else {
      if (!email || !password || (isSignUpMode && !name)) {
        alert("Please fill in all required fields");
        setIsLoginLoading(false);
        return;
      }
      try {
        let firebaseUser;
        if (isSignUpMode) {
          try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            firebaseUser = cred.user;
          } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
              alert("Email is already in use. Please sign in instead.");
            } else {
              throw err;
            }
            setIsLoginLoading(false);
            return;
          }
        } else {
          try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            firebaseUser = cred.user;
          } catch (err: any) {
             throw err;
          }
        }
        
        if (typeof window !== "undefined") {
          localStorage.setItem("selected_role", apiRole);
        }
        
        await fetch("/api/auth/firebase-signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: firebaseUser.email,
            name: isSignUpMode ? name : (firebaseUser.displayName || email.split('@')[0]),
            image: firebaseUser.photoURL, 
            role: apiRole
          }),
        });
        window.location.reload();
      } catch (err) {
        console.error("Email auth failed", err);
        alert(isSignUpMode ? "Sign up failed" : "Sign in failed");
      }
    }
    setIsLoginLoading(false);
  };

  if (status === "unauthenticated" || !session) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{baseT.title}</h1>
          <p className="text-sm text-slate-500 mb-6">{baseT.subtitle}</p>
          
          <div className="mb-6 text-left">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              {["Centre Admin", "Doctor", "Patient"].map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r as any)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-colors ${selectedRole === r ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={(e) => handleLoginSubmit(e, false)} className="flex flex-col gap-3 mb-6">
            {isSignUpMode && (
              <input 
                type="text" 
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            )}
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button 
              type="submit"
              disabled={isLoginLoading}
              className="w-full bg-slate-900 text-white font-bold text-sm py-3 rounded-xl hover:bg-slate-800 active:scale-95 transition-all mt-2"
            >
              {isLoginLoading ? "Processing..." : (isSignUpMode ? "Sign Up with Email" : "Sign In with Email")}
            </button>
            <div className="text-center mt-2">
              <button 
                type="button" 
                onClick={() => setIsSignUpMode(!isSignUpMode)}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                {isSignUpMode ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </button>
            </div>
          </form>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">Or continue with</span></div>
          </div>

          <button 
            onClick={() => handleLoginSubmit(undefined, true)}
            disabled={isLoginLoading}
            className="w-full bg-indigo-600 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Google SSO
          </button>
        </div>
      </div>
    );
  }




  if (session?.user?.role === "doctor") {
    return (
      <div className="h-screen bg-slate-50 font-sans flex flex-col overflow-hidden text-slate-900">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-800">Swasthya Sarathi - Doctor</h1>
          </div>
          <button onClick={signOut} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-2"><LogOut className="w-4 h-4"/> Sign out</button>
        </header>
        <main className="flex-1 overflow-hidden">
          <DoctorDashboard />
        </main>
      </div>
    );
  }

  if (session?.user?.role === "patient") {
    return (
      <div className="h-screen bg-slate-50 font-sans flex flex-col overflow-hidden text-slate-900">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-800">Swasthya Sarathi - Patient Portal</h1>
          </div>
          <button onClick={signOut} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-2"><LogOut className="w-4 h-4"/> Exit</button>
        </header>
        <main className="flex-1 overflow-hidden">
          <PatientDashboard />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 font-sans flex overflow-hidden text-slate-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">{baseT.title}</h1>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("TRIAGE")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
              activeTab === "TRIAGE" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Stethoscope className="w-5 h-5" />
            {baseT.tabTriage}
          </button>
          
          {(session.user as any)?.role === "administrator" && (
            <>
              <button
                onClick={() => setActiveTab("MANAGEMENT")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
                  activeTab === "MANAGEMENT" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Building2 className="w-5 h-5" />
                {baseT.tabManagement}
              </button>

              <button
                onClick={() => setActiveTab("MONITORING")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
                  activeTab === "MONITORING" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Network className="w-5 h-5" />
                {baseT.tabMonitoring}
              </button>
            </>
          )}
          
          <button
            onClick={() => setActiveTab("VOICE_ASSISTANT")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
              activeTab === "VOICE_ASSISTANT" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <AudioLines className="w-5 h-5" />
            {baseT.tabVoiceAssistance}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
            <Languages className="w-4 h-4 text-slate-400" />
            <select 
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-300 outline-none cursor-pointer flex-1"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी</option>
              <option value="Bengali">বাংলা</option>
              <option value="Marathi">मराठी</option>
            </select>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all duration-200 font-semibold text-xs text-center active:scale-[0.98]"
            title="Securely log out and sync records"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out & Sync
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {activeTab === "TRIAGE" && baseT.tabTriage}
              {activeTab === "MANAGEMENT" && baseT.tabManagement}
              {activeTab === "MONITORING" && baseT.tabMonitoring}
              {activeTab === "VOICE_ASSISTANT" && baseT.tabVoiceAssistance}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {baseT.subtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-xs font-medium text-slate-500">{session.user?.name || baseT.location}</p>
              <p className="text-sm font-semibold text-slate-900 uppercase">{(session.user as any)?.role?.replace('_', ' ') || "USER"}</p>
            </div>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-inner flex items-center justify-center shrink-0 hover:bg-slate-300 transition-colors"
              title="Profile"
            >
              <span className="text-xs font-bold text-slate-600">{(session.user?.name || "U")[0].toUpperCase()}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Main Content */}
        <main className="flex-1 overflow-hidden">
          
          {activeTab === "VOICE_ASSISTANT" ? (
            <LiveVoiceAssistant preferredLanguage={preferredLanguage} />
          ) : activeTab === "MONITORING" ? (
            <LiveResourceGrid resources={resources} baseT={baseT} />
          ) : activeTab === "MANAGEMENT" ? (
            <CentreManagementView resources={resources} baseT={baseT} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 h-full overflow-hidden">
              {/* Left Column: Ingestion Form & Saved History */}
              <section className="md:col-span-5 flex flex-col gap-4 h-full overflow-hidden">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-[3] flex flex-col overflow-hidden">
                  
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">{activeTab === "TRIAGE" ? t.patientIntakeLabel : baseT.reportIntake}</h2>
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      AI Active
                    </span>
                  </div>
                  
                  <label htmlFor="description" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 shrink-0">
                    {activeTab === "TRIAGE" ? t.symptomsDescriptionLabel : baseT.reportDescription}
                  </label>
                  <div className="relative mb-4 flex-1 flex flex-col min-h-[120px]">
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={activeTab === "TRIAGE" ? baseT.placeholder : baseT.reportPlaceholder}
                      className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 pb-14"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      {isRecording && (
                        <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span> Listening...
                        </span>
                      )}
                      <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        title={isRecording ? "Stop Recording" : "Start Voice Input"}
                        className={`p-2.5 rounded-full shadow-sm transition-all ${
                          isRecording 
                            ? 'bg-red-500 text-white shadow-red-200 hover:bg-red-600' 
                            : 'bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200'
                        }`}
                      >
                        {isRecording ? <Square className="w-4 h-4" fill="currentColor" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 shrink-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{baseT.quickTestScenarios}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(activeTab === "TRIAGE" ? SAMPLE_SCENARIOS : MANAGEMENT_SCENARIOS).map((scenario, idx) => (
                        <button
                          key={idx}
                          onClick={() => setDescription(scenario.text)}
                          className="text-left p-3 text-xs border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors truncate"
                          title={scenario.label}
                        >
                          {scenario.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 shrink-0">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleAnalyze()}
                    disabled={(!description.trim() && !isRecording) || isLoading}
                    className="w-full bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 mt-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {baseT.processing}
                      </>
                    ) : (
                      <>
                        {activeTab === "TRIAGE" ? t.analyzeButtonLabel : baseT.analyzeReportButton}
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Saved History Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex-[2] flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-3 shrink-0 border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-indigo-500" />
                      {activeTab === "TRIAGE" ? "Saved Patient Triages (Cloud)" : "Saved Daily Reports (Cloud)"}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {activeTab === "TRIAGE" ? savedTriageRecords.length : savedManagementRecords.length} records
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-1">
                    {isHistoryLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      </div>
                    ) : activeTab === "TRIAGE" ? (
                      savedTriageRecords.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-4 text-center">
                          <p className="text-xs">No saved patient triages found.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Submit triage patient details to auto-save to cloud.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {savedTriageRecords.map((rec) => (
                            <button
                              key={rec.id}
                              onClick={() => {
                                setDescription(rec.description);
                                setResult({
                                  triageStatus: rec.triageStatus,
                                  languageDetected: rec.languageDetected,
                                  estimatedDuration: rec.estimatedDuration,
                                  extractedSymptoms: rec.extractedSymptoms,
                                  suggestedAction: rec.suggestedAction,
                                  administrativeAlertFlags: rec.administrativeAlertFlags,
                                });
                              }}
                              className="text-left p-2.5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-between gap-3 group active:scale-[0.98]"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                                  {rec.description}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {new Date(rec.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                                rec.triageStatus === "RED" ? "bg-red-50 text-red-600 border border-red-100" :
                                rec.triageStatus === "AMBER" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              }`}>
                                {rec.triageStatus}
                              </span>
                            </button>
                          ))}
                        </div>
                      )
                    ) : (
                      savedManagementRecords.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-4 text-center">
                          <p className="text-xs">No saved center reports found.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Submit a center report to auto-save to cloud.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {savedManagementRecords.map((rec) => (
                            <button
                              key={rec.id}
                              onClick={() => {
                                setDescription(rec.description);
                                setManagementResult({
                                  metrics: rec.metrics,
                                  stockWarnings: rec.stockWarnings,
                                  demandForecasts: rec.demandForecasts,
                                  redistributionRecommendations: rec.redistributionRecommendations,
                                  flaggedCentres: rec.flaggedCentres,
                                });
                              }}
                              className="text-left p-2.5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex flex-col gap-1 group active:scale-[0.98]"
                            >
                              <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition-colors w-full">
                                {rec.description}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 w-full">
                                <span>{new Date(rec.timestamp).toLocaleString()}</span>
                                <span className="font-medium text-slate-500">
                                  F: {rec.metrics.footfall} | B: {rec.metrics.bedsAvailable} | D: {rec.metrics.doctorAttendance}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>

              {/* Right Column: Analytics Board */}
              <section className="md:col-span-7 flex flex-col gap-4 h-full overflow-hidden min-h-0">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden min-h-0">
                  {/* Board Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">
                      {activeTab === "TRIAGE" ? baseT.boardTitle : baseT.managementBoardTitle}
                    </h2>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                  </div>

                  {activeTab === "TRIAGE" && !result && !isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                      <Activity className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">{baseT.emptyBoard}</p>
                    </div>
                  ) : activeTab === "MANAGEMENT" && !managementResult && !isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                      <Building2 className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">{baseT.emptyManagementBoard}</p>
                    </div>
                  ) : isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                      <p className="text-sm animate-pulse font-medium">{baseT.processing}</p>
                    </div>
                  ) : activeTab === "TRIAGE" && result ? (
                    <div className="flex flex-col h-full overflow-hidden min-h-0">
                      {/* Severity Banner */}
                      <div className={`px-6 py-4 border-y flex items-center justify-between shrink-0 transition-colors duration-500 ${
                        result.triageStatus === "RED" ? "bg-red-50 border-red-200 text-red-900" :
                        result.triageStatus === "AMBER" ? "bg-amber-50 border-amber-200 text-amber-900" :
                        "bg-emerald-50 border-emerald-200 text-emerald-900"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            result.triageStatus === "RED" ? "bg-red-100 text-red-600" :
                            result.triageStatus === "AMBER" ? "bg-amber-100 text-amber-600" :
                            "bg-emerald-100 text-emerald-600"
                          }`}>
                            {getStatusIcon(result.triageStatus)}
                          </div>
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-tighter ${
                              result.triageStatus === "RED" ? "text-red-900" :
                              result.triageStatus === "AMBER" ? "text-amber-900" :
                              "text-emerald-900"
                            }`}>
                              {t.statusBannerPriority}: {result.triageStatus}
                            </p>
                            <p className={`text-sm font-medium ${
                              result.triageStatus === "RED" ? "text-red-800" :
                              result.triageStatus === "AMBER" ? "text-amber-800" :
                              "text-emerald-800"
                            }`}>
                              {t.statusBannerMessage}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] font-bold uppercase ${
                            result.triageStatus === "RED" ? "text-red-700" :
                            result.triageStatus === "AMBER" ? "text-amber-700" :
                            "text-emerald-700"
                          }`}>
                            {t.estResponseTimeLabel}
                          </p>
                          <p className={`text-xl font-black ${
                            result.triageStatus === "RED" ? "text-red-900" :
                            result.triageStatus === "AMBER" ? "text-amber-900" :
                            "text-emerald-900"
                          }`}>
                            {result.triageStatus === "RED" ? "< 5 MIN" :
                             result.triageStatus === "AMBER" ? "< 60 MIN" :
                             "ROUTINE"}
                          </p>
                        </div>
                      </div>

                      {/* Analytics Details Grid */}
                      <div className="p-6 flex-1 overflow-y-auto flex flex-col">
                        
                        {/* Patient Relocation Directive */}
                        <div className={`p-4 rounded-xl border mb-6 shrink-0 flex items-center justify-between ${
                          result.triageStatus === 'RED' 
                            ? 'bg-red-50 border-red-200' 
                            : result.triageStatus === 'AMBER'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-emerald-50 border-emerald-200'
                        }`}>
                          <div className="flex flex-col">
                             <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                               result.triageStatus === 'RED' ? 'text-red-500' : result.triageStatus === 'AMBER' ? 'text-amber-500' : 'text-emerald-500'
                             }`}>Relocation Directive</p>
                             <p className={`text-sm font-semibold ${
                               result.triageStatus === 'RED' ? 'text-red-900' : result.triageStatus === 'AMBER' ? 'text-amber-900' : 'text-emerald-900'
                             }`}>
                               {result.triageStatus === 'RED' 
                                 ? 'Emergency ICU (Floor 2, Bed 14A)' 
                                 : 'General Waiting Room / Fast Action Clinic'}
                             </p>
                          </div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                             result.triageStatus === 'RED' ? 'bg-red-100 text-red-600' : result.triageStatus === 'AMBER' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 shrink-0">
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t.estDurationLabel}</p>
                            <p className="text-sm font-semibold text-slate-700">{result.estimatedDuration}</p>
                          </div>
                        </div>

                        <div className="mb-6 shrink-0">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t.extractedSymptomsLabel}</p>
                          <div className="flex flex-wrap gap-2">
                            {result.extractedSymptoms.map((symptom, idx) => (
                              <span key={idx} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                result.triageStatus === "RED" ? "bg-red-100 text-red-700 border-red-200" :
                                result.triageStatus === "AMBER" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                "bg-emerald-100 text-emerald-700 border-emerald-200"
                              }`}>
                                {symptom}
                              </span>
                            ))}
                            {result.extractedSymptoms.length === 0 && (
                              <span className="text-sm text-slate-400 italic font-medium">{t.noSymptomsLabel}</span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 bg-slate-900 rounded-xl mb-6 shrink-0">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">{t.suggestedActionPlanLabel}</p>
                          <p className="text-white font-medium text-base mb-1">{result.suggestedAction}</p>
                        </div>

                        {result.administrativeAlertFlags && result.administrativeAlertFlags.length > 0 && (
                          <div className="mt-auto shrink-0 pt-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t.administrativeAlertsLabel}</p>
                            <div className="flex flex-wrap gap-4">
                              {result.administrativeAlertFlags.map((flag, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-full border border-indigo-100">
                                  <Info className="w-3.5 h-3.5" />
                                  {flag}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : activeTab === "MANAGEMENT" && managementResult ? (
                    <div className="flex flex-col h-full overflow-hidden min-h-0">
                      <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
                        {/* Metrics */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Footfall</p>
                            <p className="text-lg font-bold text-slate-900">{managementResult.metrics.footfall}</p>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Beds Available</p>
                            <p className="text-lg font-bold text-slate-900">{managementResult.metrics.bedsAvailable}</p>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Doctors</p>
                            <p className="text-lg font-bold text-slate-900">{managementResult.metrics.doctorAttendance}</p>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tests Available</p>
                            <p className="text-lg font-bold text-slate-900">{managementResult.metrics.testsAvailable}</p>
                          </div>
                        </div>

                        {/* Early Stock-out Warnings */}
                        {managementResult.stockWarnings.length > 0 && (
                          <div className="shrink-0">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <PackageMinus className="w-4 h-4 text-amber-500" />
                              {mt.stockWarningsTitle}
                            </h3>
                            <div className="flex flex-col gap-2">
                              {managementResult.stockWarnings.map((w, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${w.warningLevel === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                                  <span className="font-semibold text-sm">{w.item}</span>
                                  <span className={`text-xs font-bold px-2 py-1 rounded ${w.warningLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {w.daysLeft} left
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Demand Forecasts */}
                        {managementResult.demandForecasts.length > 0 && (
                          <div className="shrink-0">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-indigo-500" />
                              {mt.demandForecastsTitle}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {managementResult.demandForecasts.map((f, idx) => (
                                <div key={idx} className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                  <p className="text-sm font-bold text-indigo-900 mb-1">{f.condition}</p>
                                  <p className="text-xs font-semibold text-indigo-700 mb-2">Surge: {f.expectedSurge}</p>
                                  <p className="text-xs text-indigo-800/80">{f.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resource Redistribution */}
                        {managementResult.redistributionRecommendations.length > 0 && (
                          <div className="shrink-0">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4 text-emerald-500" />
                              {mt.redistributionTitle}
                            </h3>
                            <div className="flex flex-col gap-2">
                              {managementResult.redistributionRecommendations.map((r, idx) => (
                                <div key={idx} className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 text-sm text-emerald-900">
                                    <span className="font-semibold">{r.fromCentre}</span>
                                    <span className="text-emerald-500">→</span>
                                    <span className="font-semibold">{r.toCentre}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-emerald-700">Move: {r.resource}</span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                                      r.urgency === 'HIGH' ? 'bg-red-100 text-red-700' :
                                      r.urgency === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                      {r.urgency}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Flagged Centres */}
                        {managementResult.flaggedCentres.length > 0 && (
                          <div className="shrink-0">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              {mt.flaggedCentresTitle}
                            </h3>
                            <div className="flex flex-col gap-2">
                              {managementResult.flaggedCentres.map((f, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border ${f.severity === 'CRITICAL' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                                  <p className={`text-sm font-bold mb-1 ${f.severity === 'CRITICAL' ? 'text-red-900' : 'text-amber-900'}`}>{f.centre}</p>
                                  <p className={`text-xs ${f.severity === 'CRITICAL' ? 'text-red-700' : 'text-amber-700'}`}>{f.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {isProfileOpen && (
        <ProfileViewModal 
          session={session} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}
    </div>
  );
}

export default function SwasthyaSarathiPage() {
  return (
    <AuthProvider>
      <SwasthyaSarathiPageContent />
    </AuthProvider>
  );
}
