import React, { useState } from "react";
import { X, MapPin, Activity } from "lucide-react";
import { ResourceData } from "../hooks/useResourceMonitoring";
import { ClinicTrendsChart } from "./ClinicTrendsChart";

interface LiveResourceGridProps {
  resources: ResourceData[];
  baseT: any;
}

export function LiveResourceGrid({ resources, baseT }: LiveResourceGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"MAP" | "TRENDS">("MAP");

  const handleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setActiveTab("MAP");
    }
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{baseT.monitoringTitle}</h3>
            <p className="text-sm text-slate-500">{baseT.monitoringDesc}</p>
          </div>
          <div className="flex gap-2 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-lg bg-white border shadow-sm text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border shadow-sm text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border shadow-sm text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {resources.map((phc) => {
            const isExpanded = expandedId === phc.id;
            
            return (
              <div 
                key={phc.id} 
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
                  isExpanded ? 'lg:col-span-2 xl:col-span-3' : ''
                } ${
                  phc.status === 'CRITICAL' ? 'border-red-200' :
                  phc.status === 'WARNING' ? 'border-amber-200' : 'border-slate-200'
                }`}
              >
                <div 
                  className={`px-5 py-4 border-b flex items-center justify-between cursor-pointer hover:bg-opacity-80 transition-colors ${
                    phc.status === 'CRITICAL' ? 'bg-red-50/50 hover:bg-red-50' :
                    phc.status === 'WARNING' ? 'bg-amber-50/50 hover:bg-amber-50' : 'bg-slate-50/50 hover:bg-slate-50'
                  }`}
                  onClick={() => handleExpand(phc.id)}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-500">{phc.id}</p>
                    <h4 className="text-base font-bold text-slate-900">{phc.name}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full shadow-inner ${
                      phc.status === 'CRITICAL' ? 'bg-red-500 shadow-red-200' :
                      phc.status === 'WARNING' ? 'bg-amber-500 shadow-amber-200' : 'bg-emerald-500 shadow-emerald-200'
                    }`} />
                    <button className="text-slate-400 hover:text-slate-600">
                      {isExpanded ? <X className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className={`flex flex-col md:flex-row ${isExpanded ? 'h-[400px]' : ''}`}>
                  {/* Stats Section */}
                  <div className={`p-5 flex-1 grid grid-cols-2 gap-4 ${isExpanded ? 'overflow-y-auto border-r border-slate-100' : ''}`}>
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bed Availability</p>
                      <div className="flex items-end gap-2">
                        <span className={`text-2xl font-black ${
                          phc.beds / phc.totalBeds < 0.2 ? 'text-red-600' :
                          phc.beds / phc.totalBeds < 0.5 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>{phc.beds}</span>
                        <span className="text-sm font-semibold text-slate-500 mb-1">/ {phc.totalBeds}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                        <div className={`h-1.5 rounded-full transition-all duration-500 ${
                          phc.beds / phc.totalBeds < 0.2 ? 'bg-red-500' :
                          phc.beds / phc.totalBeds < 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} style={{ width: `${(phc.beds / phc.totalBeds) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doctors On Duty</p>
                      <div className="flex items-end gap-2">
                        <span className={`text-2xl font-black ${
                          phc.doctors / phc.totalDoctors < 0.5 ? 'text-red-600' :
                          phc.doctors / phc.totalDoctors < 0.8 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>{phc.doctors}</span>
                        <span className="text-sm font-semibold text-slate-500 mb-1">/ {phc.totalDoctors}</span>
                      </div>
                       <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                        <div className={`h-1.5 rounded-full transition-all duration-500 ${
                          phc.doctors / phc.totalDoctors < 0.5 ? 'bg-red-500' :
                          phc.doctors / phc.totalDoctors < 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} style={{ width: `${(phc.doctors / phc.totalDoctors) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className={`col-span-2 pt-2 border-t border-slate-100 mt-2 ${isExpanded ? 'flex-1 overflow-hidden flex flex-col' : ''}`}>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Supplies Stock</p>
                       <div className={`flex flex-col gap-2 ${isExpanded ? 'overflow-y-auto pr-2' : ''}`} style={isExpanded ? { maxHeight: '200px' } : {}}>
                          {(isExpanded ? phc.inventory : phc.inventory.slice(0, 3)).map(med => (
                            <div key={med.name} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-xs font-semibold text-slate-700">{med.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500">{med.stock}/{med.maxStock}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  med.status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                  med.status === 'LOW' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>{med.status}</span>
                              </div>
                            </div>
                          ))}
                          {!isExpanded && phc.inventory.length > 3 && (
                            <div className="text-center mt-1">
                               <span className="text-[10px] font-semibold text-indigo-500">+ {phc.inventory.length - 3} more (expand to view)</span>
                            </div>
                          )}
                       </div>
                    </div>
                    
                    {isExpanded && (
                       <div className="col-span-2 pt-4 mt-2">
                           <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Address</p>
                               <p className="text-xs text-slate-700 font-medium">{phc.address}</p>
                           </div>
                       </div>
                    )}
                  </div>

                  {/* Map/Trends Section */}
                  {isExpanded && (
                    <div className="flex-1 flex flex-col relative bg-white border-l border-slate-100 min-h-[300px] md:min-h-full z-0">
                      <div className="flex bg-slate-50 border-b border-slate-100 p-2 gap-2">
                        <button
                          onClick={() => setActiveTab("MAP")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                            activeTab === "MAP" 
                              ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                              : "text-slate-500 hover:bg-slate-200/50"
                          }`}
                        >
                          <MapPin className="w-4 h-4" /> Map View
                        </button>
                        <button
                          onClick={() => setActiveTab("TRENDS")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                            activeTab === "TRENDS" 
                              ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                              : "text-slate-500 hover:bg-slate-200/50"
                          }`}
                        >
                          <Activity className="w-4 h-4" /> 24h Trends
                        </button>
                      </div>
                      <div className="flex-1 relative overflow-hidden">
                        {activeTab === "MAP" ? (
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://maps.google.com/maps?q=${phc.lat},${phc.lng}&hl=en&z=14&output=embed`}
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="absolute inset-0">
                            <ClinicTrendsChart phc={phc} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
