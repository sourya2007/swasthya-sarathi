import React, { useState } from "react";
import { X, User, Briefcase, Building, MapPin, Save, ShieldAlert } from "lucide-react";

interface ProfileViewModalProps {
  onClose: () => void;
  session: any;
}

export function ProfileViewModal({ onClose, session }: ProfileViewModalProps) {
  const [name, setName] = useState(session?.user?.name || "");
  const [designation, setDesignation] = useState("Chief Medical Officer");
  const [organization, setOrganization] = useState("Swasthya Sarathi");
  const [orgInfo, setOrgInfo] = useState("District Health Department");
  const [location, setLocation] = useState("District XYZ");

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">User Profile</h2>
              <p className="text-xs text-slate-500 font-medium">Manage your account and organization details</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="profile-form" onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Designation</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Location</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Organization</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Organization Info</label>
              <textarea 
                value={orgInfo}
                onChange={(e) => setOrgInfo(e.target.value)}
                className="w-full min-h-[80px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 mt-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">Role: {(session.user as any)?.role?.replace('_', ' ') || "USER"}</p>
                <p className="text-xs font-medium text-amber-700 mt-0.5">Your role is managed by your administrator and cannot be changed here.</p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="profile-form"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-200 flex items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
          >
            {isSaving ? "Saving..." : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
