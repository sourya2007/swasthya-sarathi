"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Volume2, Activity, Info, AlertCircle, CheckCircle2 } from "lucide-react";

interface MedicalAidCard {
  title: string;
  instructions: string;
}

interface DashboardUpdate {
  symptoms?: string[];
  painPoints?: string[];
  medicalAidCards?: MedicalAidCard[];
}

const BodyAnatomy = ({ painPoints = [] }: { painPoints?: string[] }) => {
  const points: Record<string, { x: string, y: string }> = {
    head: { x: "50%", y: "10%" },
    neck: { x: "50%", y: "18%" },
    chest: { x: "50%", y: "28%" },
    left_arm: { x: "25%", y: "35%" },
    right_arm: { x: "75%", y: "35%" },
    stomach: { x: "50%", y: "42%" },
    left_leg: { x: "42%", y: "70%" },
    right_leg: { x: "58%", y: "70%" },
    back: { x: "50%", y: "35%" },
  };

  return (
    <div className="relative w-48 h-80 mx-auto flex items-center justify-center">
      <svg viewBox="0 0 100 200" className="w-full h-full text-slate-100 drop-shadow-sm" fill="currentColor">
         {/* Head */}
         <circle cx="50" cy="20" r="14" />
         {/* Neck */}
         <rect x="44" y="32" width="12" height="10" />
         {/* Torso */}
         <rect x="34" y="40" width="32" height="60" rx="12" />
         {/* Left Arm */}
         <rect x="18" y="44" width="12" height="50" rx="6" transform="rotate(12, 18, 44)" />
         {/* Right Arm */}
         <rect x="70" y="44" width="12" height="50" rx="6" transform="rotate(-12, 70, 44)" />
         {/* Left Leg */}
         <rect x="36" y="95" width="13" height="65" rx="6.5" />
         {/* Right Leg */}
         <rect x="51" y="95" width="13" height="65" rx="6.5" />
      </svg>
      {painPoints.map((point) => {
        const coords = points[point.toLowerCase()];
        if (!coords) return null;
        return (
          <div 
            key={point} 
            className="absolute w-5 h-5 rounded-full bg-red-500 animate-pulse border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.8)]"
            style={{ left: coords.x, top: coords.y, transform: "translate(-50%, -50%)" }}
          />
        );
      })}
    </div>
  );
};

const VOICE_TRANSLATIONS = {
  English: {
    title: "Live Voice Assistant",
    description: "Start a real-time conversation. The assistant will listen to symptoms in your language and help you triage.",
    connectionError: "Connection Error",
    endConversation: "End Conversation",
    startListening: "Start Listening",
    activeSession: "Active Session",
    you: "You",
    assistant: "Assistant",
    listening: "Listening...",
    thinking: "Thinking...",
    painPoints: "Pain Points Identified",
    identifiedSymptoms: "Identified Symptoms",
    noSymptoms: "No specific symptoms identified yet.",
    recommendedActions: "Recommended Actions",
    liveDashboard: "Live Health Dashboard",
    dashboardDesc: "Start the voice assistant and describe your symptoms. The dashboard will automatically update with an anatomy pain map and medical aid instructions.",
    connecting: "Connecting...",
  },
  Hindi: {
    title: "लाइव वॉयस असिस्टेंट",
    description: "वास्तविक समय में बातचीत शुरू करें। सहायक आपकी भाषा में लक्षण सुनेगा और ट्राइएज में मदद करेगा।",
    connectionError: "कनेक्शन त्रुटि",
    endConversation: "बातचीत समाप्त करें",
    startListening: "सुनना शुरू करें",
    activeSession: "सक्रिय सत्र",
    you: "आप",
    assistant: "सहायक",
    listening: "सुन रहा है...",
    thinking: "सोच रहा है...",
    painPoints: "पहचाने गए दर्द के बिंदु",
    identifiedSymptoms: "पहचाने गए लक्षण",
    noSymptoms: "अभी तक कोई विशिष्ट लक्षण नहीं मिले हैं।",
    recommendedActions: "अनुशंसित कार्रवाई",
    liveDashboard: "लाइव स्वास्थ्य डैशबोर्ड",
    dashboardDesc: "वॉयस असिस्टेंट शुरू करें और अपने लक्षण बताएं। शरीर के दर्द का नक्शा और चिकित्सा सहायता निर्देशों के साथ डैशबोर्ड स्वचालित रूप से अपडेट हो जाएगा।",
    connecting: "कनेक्ट हो रहा है...",
  },
  Bengali: {
    title: "লাইভ ভয়েস অ্যাসিস্ট্যান্ট",
    description: "রিয়েল-টাইম কথোপকথন শুরু করুন। অ্যাসিস্ট্যান্ট আপনার ভাষায় উপসর্গ শুনবে এবং ট্রায়াজে সাহায্য করবে।",
    connectionError: "সংযোগ ত্রুটি",
    endConversation: "কথোপকথন শেষ করুন",
    startListening: "শোনা শুরু করুন",
    activeSession: "সক্রিয় সেশন",
    you: "আপনি",
    assistant: "সহকারী",
    listening: "শুনছে...",
    thinking: "ভাবছে...",
    painPoints: "চিহ্নিত ব্যথার স্থান",
    identifiedSymptoms: "চিহ্নিত উপসর্গসমূহ",
    noSymptoms: "এখনও কোনও নির্দিষ্ট উপসর্গ চিহ্নিত করা যায়নি।",
    recommendedActions: "প্রস্তাবিত পদক্ষেপসমূহ",
    liveDashboard: "লাইভ স্বাস্থ্য ড্যাশবোর্ড",
    dashboardDesc: "ভয়েस অ্যাসিস্ট্যান্ট শুরু করুন এবং আপনার উপসর্গগুলি বর্ণনা করুন। ড্যাশবোর্ড স্বয়ংক্রিয়ভাবে অ্যানাটমি ব্যথার মানচিত্র এবং চিকিৎসা সহায়তার নির্দেশাবলীর সাথে আপডেট হবে।",
    connecting: "সংযোগ করা হচ্ছে...",
  },
  Marathi: {
    title: "थेट व्हॉइस असिस्टंट",
    description: "रिअल-टाइम संभाषण सुरू करा. असिस्टंट तुमच्या भाषेतील लक्षणे ऐकेल आणि ट्रायजमध्ये मदत करेल।",
    connectionError: "कनेक्शन त्रुटी",
    endConversation: "संभाषण संपवा",
    startListening: "ऐकणे सुरू करा",
    activeSession: "सक्रिय सत्र",
    you: "तुम्ही",
    assistant: "सहाय्यक",
    listening: "ऐकत आहे...",
    thinking: "विचार करत आहे...",
    painPoints: "वेदना गुण निश्चित केले",
    identifiedSymptoms: "ओळखलेली लक्षणे",
    noSymptoms: "अद्याप कोणतीही विशिष्ट लक्षणे आढळली नाहीत।",
    recommendedActions: "शिफारस केलेल्या कृती",
    liveDashboard: "थेट आरोग्य ड्याशबोर्ड",
    dashboardDesc: "व्हॉइस असिस्टंट सुरू करा आणि तुमच्या लक्षणांचे वर्णन करा। ड्याशबोर्ड स्वयंचलितपणे शरीर रचना वेदना नकाशा आणि वैद्यकीय मदत सूचनांसह अद्यतनित होईल।",
    connecting: "कनेक्ट होत आहे...",
  }
};

export function LiveVoiceAssistant({ 
  isPatientView, 
  patientName, 
  preferredLanguage = "English" 
}: { 
  isPatientView?: boolean; 
  patientName?: string; 
  preferredLanguage?: string; 
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [inputTranscript, setInputTranscript] = useState<string>("");
  const [outputTranscript, setOutputTranscript] = useState<string>("");
  const [dashboard, setDashboard] = useState<DashboardUpdate | null>(null);
  
  const currentLang = (preferredLanguage as keyof typeof VOICE_TRANSLATIONS) || "English";
  const t = VOICE_TRANSLATIONS[currentLang];
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const nextStartTimeRef = useRef<number>(0);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    setDashboard(null);
    setInputTranscript("");
    setOutputTranscript("");
    
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsConnected(true);
        setIsConnecting(false);
        
        // Input setup (microphone)
        const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
        inputAudioCtxRef.current = inputAudioCtx;
        
        // Output setup (speaker)
        const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
        outputAudioCtxRef.current = outputAudioCtx;
        nextStartTimeRef.current = 0;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const source = inputAudioCtx.createMediaStreamSource(stream);
        const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        
        source.connect(processor);
        processor.connect(inputAudioCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const channelData = e.inputBuffer.getChannelData(0);
            const base64 = pcmToBase64(channelData);
            ws.send(JSON.stringify({ audio: base64 }));
          }
        };
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.error) {
          setError(msg.error);
          disconnect();
          return;
        }
        
        if (msg.audio) {
          playAudioChunk(msg.audio);
        }
        
        if (msg.interrupted) {
          // Reset playback queue
          if (outputAudioCtxRef.current) {
            nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
          }
        }
        
        if (msg.inputTranscript) {
          setInputTranscript(msg.inputTranscript);
        }
        if (msg.outputTranscript) {
          setOutputTranscript(msg.outputTranscript);
        }
        if (msg.dashboardUpdate) {
          setDashboard(msg.dashboardUpdate);
        }
      };

      ws.onclose = () => {
        disconnect();
      };
      
      ws.onerror = () => {
        setError("WebSocket error occurred");
        disconnect();
      };
      
    } catch (err: any) {
      setError(err.message || "Failed to connect");
      disconnect();
    }
  };

  const playAudioChunk = (base64Audio: string) => {
    const audioCtx = outputAudioCtxRef.current;
    if (!audioCtx) return;

    try {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Convert 16-bit PCM bytes to Float32
      const float32Data = new Float32Array(bytes.length / 2);
      const dataView = new DataView(bytes.buffer);
      for (let i = 0; i < float32Data.length; i++) {
        float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }
      
      const buffer = audioCtx.createBuffer(1, float32Data.length, 24000);
      buffer.copyToChannel(float32Data, 0);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  };

  const pcmToBase64 = (channelData: Float32Array) => {
    const buffer = new ArrayBuffer(channelData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < channelData.length; i++) {
      let s = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const disconnect = () => {
    setIsConnected(false);
    setIsConnecting(false);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="h-full p-6 flex items-start justify-center overflow-y-auto">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Voice Interface */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center">
            
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6 relative">
              {isConnected && (
                 <span className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-ping opacity-20"></span>
              )}
              <Volume2 className={`w-10 h-10 ${isConnected ? 'text-indigo-600' : 'text-slate-400'}`} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.title}</h2>
            <p className="text-sm text-slate-500 mb-8 max-w-xs">
              {t.description}
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm w-full text-left">
                <p className="font-semibold">{t.connectionError}</p>
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <button
              onClick={isConnected ? disconnect : connect}
              disabled={isConnecting}
              className={`px-8 py-4 rounded-full font-bold text-sm shadow-lg transition-all flex items-center gap-3 ${
                isConnected 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.connecting}
                </>
              ) : isConnected ? (
                <>
                  <Square className="w-5 h-5" fill="currentColor" />
                  {t.endConversation}
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  {t.startListening}
                </>
              )}
            </button>

            {isConnected && (
              <div className="mt-8 flex flex-col items-center gap-6 w-full">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                   <Activity className="w-4 h-4 animate-pulse" />
                   {t.activeSession}
                </div>

                <div className="w-full flex flex-col gap-4 text-left">
                   <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-2 relative shadow-inner">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 absolute top-3 left-4">{t.you}</span>
                     <p className="text-sm font-medium text-slate-700 mt-4 min-h-[1.25rem]">
                       {inputTranscript || <span className="text-slate-300 italic">{t.listening}</span>}
                     </p>
                   </div>
                   
                   <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col gap-2 relative shadow-inner">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 absolute top-3 left-4">{t.assistant}</span>
                     <p className="text-sm font-medium text-indigo-900 mt-4 min-h-[1.25rem]">
                       {outputTranscript || <span className="text-indigo-300 italic">{t.thinking}</span>}
                     </p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Health Dashboard */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {dashboard ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 3D Anatomy Model */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 self-start w-full border-b pb-2">{t.painPoints}</h3>
                  <BodyAnatomy painPoints={dashboard.painPoints} />
                </div>

                {/* Symptoms Summary */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">{t.identifiedSymptoms}</h3>
                  {dashboard.symptoms && dashboard.symptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {dashboard.symptoms.map((symptom, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold uppercase">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">{t.noSymptoms}</p>
                  )}
                </div>
              </div>

              {/* Medical Aid Cards */}
              {dashboard.medicalAidCards && dashboard.medicalAidCards.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-500" />
                    {t.recommendedActions}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboard.medicalAidCards.map((card, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col gap-2 transition-transform hover:scale-[1.02]">
                        <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {card.title}
                        </h4>
                        <p className="text-xs font-medium text-indigo-800/80 leading-relaxed">
                          {card.instructions}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 shadow-sm p-12 flex flex-col items-center justify-center h-full text-center min-h-[400px]">
              <Activity className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">{t.liveDashboard}</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                {t.dashboardDesc}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
