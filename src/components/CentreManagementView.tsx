import React, { useState, useMemo } from "react";
import { Building2, Stethoscope, AlertTriangle, Send, CheckCircle2, PackageMinus, MapPin, Flame } from "lucide-react";
import { ResourceData } from "../hooks/useResourceMonitoring";

interface CentreManagementViewProps {
  resources: ResourceData[];
  baseT: any;
}

export function CentreManagementView({ resources, baseT }: CentreManagementViewProps) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("PHC");
  const [issueType, setIssueType] = useState("STOCK_SHORTAGE");
  const [issueDescription, setIssueDescription] = useState("");
  
  const [reportedIssues, setReportedIssues] = useState<any[]>([]);

  // System-generated real-time critical alerts
  const systemAlerts = useMemo(() => {
    const alerts: any[] = [];
    resources.forEach(r => {
      // Bed availability reaches zero
      if (r.beds === 0) {
        alerts.push({
          id: `sys-bed-${r.id}`,
          locationName: r.name,
          issueType: 'ZERO_BEDS',
          description: `Critical: Zero beds available. Immediate action required.`,
        });
      }

      // Medicine stocks fall below a critical threshold
      const criticalMeds = r.inventory.filter(i => i.status === 'CRITICAL');
      if (criticalMeds.length > 0) {
        alerts.push({
          id: `sys-med-${r.id}`,
          locationName: r.name,
          issueType: 'CRITICAL_STOCK',
          description: `Critical stock shortage: ${criticalMeds.map(m => m.name).join(', ')}.`,
        });
      }
    });
    return alerts;
  }, [resources]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation || !issueDescription) return;

    const loc = resources.find(r => r.id === selectedLocation);
    
    const newIssue = {
      id: Date.now().toString(),
      locationName: loc ? loc.name : selectedLocation,
      locationId: selectedLocation,
      type: selectedType,
      issueType,
      description: issueDescription,
      timestamp: new Date().toISOString(),
      status: "OPEN"
    };

    setReportedIssues([newIssue, ...reportedIssues]);
    
    // Reset form
    setSelectedLocation("");
    setIssueDescription("");
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'STOCK_SHORTAGE': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'STAFF_ABSENCE': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'INFRASTRUCTURE': return 'text-red-600 bg-red-50 border-red-200';
      case 'OVERCROWDING': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 h-full overflow-hidden font-sans">
      {/* Left Column: Form */}
      <section className="md:col-span-5 flex flex-col gap-4 h-full overflow-hidden min-h-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full overflow-y-auto min-h-0">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-lg font-bold text-slate-800">Report Centre Issue</h2>
            <Building2 className="w-5 h-5 text-indigo-500" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Health Centre Type</label>
              <div className="flex gap-2">
                {['PHC', 'CHC'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      selectedType === type 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              >
                <option value="">Select a centre...</option>
                {resources.filter(r => r.type === selectedType).map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Issue Category</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="STOCK_SHORTAGE">Medicine/Equipment Stock Shortage</option>
                <option value="STAFF_ABSENCE">Doctor/Staff Absence</option>
                <option value="INFRASTRUCTURE">Infrastructure Failure (Power/Water)</option>
                <option value="OVERCROWDING">Overcrowding / Bed Shortage</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Issue Description</label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                required
                className="flex-1 min-h-[100px] w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              Submit Report
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Right Column: District Board */}
      <section className="md:col-span-7 flex flex-col gap-4 h-full overflow-hidden min-h-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden min-h-0">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">District Management Board</h2>
              <p className="text-xs text-slate-500 mt-1">Live overview of active centre issues</p>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 flex flex-col gap-4 min-h-0">
            
            {/* System Alerts Section */}
            {systemAlerts.length > 0 && (
              <div className="flex flex-col gap-3 mb-4">
                <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                  Real-time Critical Alerts ({systemAlerts.length})
                </h3>
                {systemAlerts.map(alert => (
                  <div key={alert.id} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-red-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          {alert.locationName}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider text-red-700 bg-red-100 border-red-200 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {alert.issueType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-red-800 font-medium">{alert.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Status: SYSTEM ALERT
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual Reports Section */}
            <div className="flex flex-col gap-3">
              {reportedIssues.length > 0 || systemAlerts.length > 0 ? (
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                   Manually Reported Issues ({reportedIssues.length})
                 </h3>
              ) : null}

              {reportedIssues.length === 0 && systemAlerts.length === 0 ? (
                <div className="h-full mt-10 flex flex-col items-center justify-center text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-400 opacity-50" />
                  <p className="text-sm font-semibold">No Active Issues Reported</p>
                  <p className="text-xs mt-1 text-center max-w-xs">All centres are operating normally. Reports submitted from the left panel will appear here.</p>
                </div>
              ) : (
                reportedIssues.map((issue) => (
                  <div key={issue.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {issue.locationName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(issue.timestamp).toLocaleString()}</p>
                      </div>
                      
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getIssueColor(issue.issueType)}`}>
                        {issue.issueType.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-sm text-slate-700">{issue.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                       <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                         <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                         Status: {issue.status}
                       </span>
                       <button 
                         onClick={() => setReportedIssues(reportedIssues.filter(i => i.id !== issue.id))}
                         className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                       >
                         Mark Resolved
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

