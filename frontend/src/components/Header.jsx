import React from 'react';
import { CardioSenseLogo } from './CardioSenseLogo';
import { Stethoscope, UserCheck } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  currentPatient, 
  currentDoctor, 
  onOpenDoctorModal 
}) {
  const navItems = [
    { id: 'landing', label: 'Overview' },
    { id: 'auscultation-studio', label: 'Auscultation Studio' },
    { id: 'diagnostic-dashboard', label: 'Diagnostic Dashboard' },
    { id: 'patient-records-audit', label: 'Patient Records' },
    { id: 'model-qa', label: 'Model QA' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full pt-3 pb-3 px-4 sm:px-6 lg:px-8 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto backdrop-blur-md bg-white/95 border border-sky-100 rounded-full px-5 sm:px-6 py-2 shadow-sm flex items-center justify-between gap-3 sm:gap-4 pointer-events-auto">
        
        {/* Brand Logo (Left) */}
        <button
          onClick={() => setActiveTab('landing')}
          aria-label="CardioSense AI Home"
          className="flex items-center gap-2 group flex-shrink-0 cursor-pointer text-left whitespace-nowrap"
        >
          <CardioSenseLogo className="h-8 sm:h-9" textColor="#0f172a" />
        </button>

        {/* Central Navigation Tabs (Center) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-shrink-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 text-sky-600 font-bold border border-sky-200 shadow-xs'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Status & Launch CTA (Right) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Doctor / Clinician Authentication Button */}
          <button
            onClick={onOpenDoctorModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-slate-800 hover:text-sky-900 transition-all cursor-pointer shadow-2xs group"
            title={currentDoctor ? `Logged in: ${currentDoctor.name}` : 'Clinician Authentication Portal'}
          >
            {currentDoctor ? (
              <div className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {currentDoctor.initials || 'MD'}
              </div>
            ) : (
              <Stethoscope className="w-4 h-4 text-sky-600 shrink-0" />
            )}
            <span className="font-label-sm text-xs font-semibold max-w-[120px] sm:max-w-[150px] truncate">
              {currentDoctor ? currentDoctor.name.replace(/,.*$/, '') : 'Clinician Login'}
            </span>
            {currentDoctor && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            )}
          </button>

          {/* Live Node Status Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-700 whitespace-nowrap shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
            <span className="text-slate-800">Sys Live</span>
            <span className="text-slate-300">|</span>
            <span className="text-sky-700">{currentPatient?.tag?.replace('Patient ', '') || '#CS-8921'}</span>
          </div>

          {/* Action CTA Button */}
          <button
            onClick={() => {
              if (activeTab === 'auscultation-studio') {
                setActiveTab('diagnostic-dashboard');
              } else {
                setActiveTab('auscultation-studio');
              }
            }}
            style={{ backgroundColor: '#0284c7' }}
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 rounded-full shadow-sm hover:shadow-md transition-all duration-200 tracking-wide cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            {activeTab === 'auscultation-studio' ? 'View Dashboard' : 'Launch Studio'}
          </button>
        </div>

      </div>
    </header>
  );
}
