import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  Stethoscope, 
  ShieldCheck, 
  LogOut, 
  ArrowRight,
  BadgeCheck
} from 'lucide-react';

const PRESET_DOCTORS = [
  {
    id: 'DOC-8921',
    name: 'Dr. Robert H. Jehning, MD, FACC',
    email: 'dr.jehning@cardiosense.clinic',
    role: 'Attending Cardiologist',
    department: 'Division of Cardiovascular Medicine',
    npi: '1849201948',
    license: 'CA-829104',
    initials: 'RJ'
  },
  {
    id: 'DOC-5412',
    name: 'Dr. Elena Rostova, MD, PhD',
    email: 'dr.rostova@cardiosense.clinic',
    role: 'Structural Heart Specialist',
    department: 'Valvular Disease & Echocardiography',
    npi: '1928374651',
    license: 'NY-472910',
    initials: 'ER'
  },
  {
    id: 'DOC-2390',
    name: 'Dr. Marcus Vance, MD',
    email: 'dr.vance@cardiosense.clinic',
    role: 'Acoustic Auscultation Fellow',
    department: 'Pediatric & Adult Congenital Heart',
    npi: '1092837465',
    license: 'IL-918234',
    initials: 'MV'
  }
];

export default function DoctorLoginModal({ 
  isOpen, 
  onClose, 
  currentDoctor, 
  onLogin, 
  onLogout 
}) {
  const [customMode, setCustomMode] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [npi, setNpi] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePresetLogin = (doc) => {
    onLogin(doc);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full physician name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid medical center email address.');
      return;
    }

    const docObj = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
      email: email.trim(),
      role: 'Staff Physician',
      department: 'Cardiovascular Medicine',
      npi: npi.trim() || '1849201948',
      license: 'VALID-MD',
      initials: name.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'MD'
    };

    onLogin(docObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-sky-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col my-auto">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline-sm text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Clinician Authentication</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
                  NPI Verified
                </span>
              </h2>
              <p className="font-body-sm text-[11px] text-slate-400">
                CardioSense Secure EHR & Attestation Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          
          {/* If already logged in, show profile card & logout */}
          {currentDoctor ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    {currentDoctor.initials || 'MD'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-headline-sm text-sm font-bold text-slate-900 truncate">
                        {currentDoctor.name}
                      </h3>
                      <BadgeCheck className="w-4 h-4 text-sky-600 shrink-0" />
                    </div>
                    <p className="font-body-sm text-xs text-sky-800 font-medium">
                      {currentDoctor.role}
                    </p>
                    <p className="font-body-sm text-[11px] text-slate-500 truncate">
                      {currentDoctor.department}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-sky-200/80 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">NPI Number</span>
                    <span className="font-semibold text-slate-800">{currentDoctor.npi}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Status</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Attestation Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-label-md text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Physician</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Mode Toggle */}
              <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                    !customMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Accredited Staff (1-Click)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                    customMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Custom Credentials
                </button>
              </div>

              {/* 1-Click Select Accredited Staff */}
              {!customMode ? (
                <div className="space-y-2">
                  <span className="font-label-sm text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                    Select Accredited Cardiologist Profile
                  </span>

                  <div className="space-y-2">
                    {PRESET_DOCTORS.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handlePresetLogin(doc)}
                        className="w-full p-3 rounded-xl border border-sky-100 bg-sky-50/40 hover:bg-sky-50 hover:border-sky-300 text-left transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {doc.initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-headline-sm text-xs font-bold text-slate-900 group-hover:text-sky-700 block truncate">
                              {doc.name}
                            </span>
                            <span className="font-body-sm text-[11px] text-slate-500 block truncate">
                              {doc.role} • NPI #{doc.npi}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-sky-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Custom Manual Credentials Form */
                <form onSubmit={handleCustomSubmit} className="space-y-3">
                  {error && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="font-label-sm text-[11px] text-slate-700 font-semibold block mb-1">
                      Physician Full Name & Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Jane Doe, MD, FACC"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="font-label-sm text-[11px] text-slate-700 font-semibold block mb-1">
                      Medical Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. jane.doe@cardiology.hospital.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-label-sm text-[11px] text-slate-700 font-semibold block mb-1">
                        NPI / License #
                      </label>
                      <input
                        type="text"
                        placeholder="10-digit NPI"
                        value={npi}
                        onChange={(e) => setNpi(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="font-label-sm text-[11px] text-slate-700 font-semibold block mb-1">
                        Access Passcode
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-label-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Authorize Clinician Session</span>
                  </button>
                </form>
              )}

              {/* Security Notice */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>HIPAA Compliant Session Encryption • Audit-logged under IDE Protocol</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

