import React, { useState } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AuscultationStudio from './components/AuscultationStudio';
import DiagnosticDashboard from './components/DiagnosticDashboard';
import PatientRecordsAudit from './components/PatientRecordsAudit';
import ModelQA from './components/ModelQA';
import AuditInspectorModal from './components/AuditInspectorModal';
import ClinicalReportModal from './components/ClinicalReportModal';
import DoctorLoginModal from './components/DoctorLoginModal';
import { Activity, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentPatient, setCurrentPatient] = useState({
    tag: 'Patient #CS-8921',
    details: 'Male, 54y • Post-infarction murmur'
  });
  const [currentDoctor, setCurrentDoctor] = useState({
    id: 'DOC-8921',
    name: 'Dr. Robert H. Jehning, MD, FACC',
    email: 'dr.jehning@cardiosense.clinic',
    role: 'Attending Cardiologist',
    department: 'Division of Cardiovascular Medicine & Acoustics',
    npi: '1849201948',
    license: 'CA-829104',
    initials: 'RJ'
  });
  const [analysisData, setAnalysisData] = useState(null);
  const [inspectingSessionId, setInspectingSessionId] = useState(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Triggered when user runs audio analysis from Auscultation Studio
  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setActiveTab('diagnostic-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-body-md text-[#0F172A] selection:bg-sky-100 selection:text-sky-700 antialiased">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPatient={currentPatient}
        currentDoctor={currentDoctor}
        onOpenDoctorModal={() => setIsDoctorModalOpen(true)}
      />

      {/* Main Workspace Page Body */}
      <main className="w-full flex-1 flex flex-col">
        {activeTab === 'landing' && (
          <LandingPage
            onLaunchStudio={() => setActiveTab('auscultation-studio')}
            onExploreDashboard={() => setActiveTab('diagnostic-dashboard')}
            onExploreQA={() => setActiveTab('model-qa')}
          />
        )}

        {activeTab === 'auscultation-studio' && (
          <AuscultationStudio
            currentPatient={currentPatient}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {activeTab === 'diagnostic-dashboard' && (
          <DiagnosticDashboard
            analysisData={analysisData}
            onInspectAudit={(sessionId) => setInspectingSessionId(sessionId || 'REC-1049')}
            onRerun={() => setActiveTab('auscultation-studio')}
            onOpenReport={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'patient-records-audit' && (
          <PatientRecordsAudit
            onSelectRecord={(record) => {
              setCurrentPatient({
                tag: record.patientName,
                details: record.patientId
              });
            }}
            onInspectAudit={(sessionId) => setInspectingSessionId(sessionId || 'REC-1049')}
          />
        )}

        {activeTab === 'model-qa' && (
          <ModelQA />
        )}
      </main>

      {/* Audit Inspector Modal Dialog */}
      {inspectingSessionId && (
        <AuditInspectorModal
          sessionId={inspectingSessionId}
          onClose={() => setInspectingSessionId(null)}
        />
      )}

      {/* Doctor / Clinician Authentication Modal */}
      <DoctorLoginModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        currentDoctor={currentDoctor}
        onLogin={(doc) => setCurrentDoctor(doc)}
        onLogout={() => setCurrentDoctor(null)}
      />

      {/* Clinical Grade Diagnostic Report Modal */}
      <ClinicalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        analysisData={analysisData}
        currentPatient={currentPatient}
        currentDoctor={currentDoctor}
      />

      {/* Clinical Telemetry Footer for diagnostic workspaces */}
      {activeTab !== 'landing' && (
        <footer className="w-full bg-white border-t border-sky-100 py-4 shadow-[0_-2px_10px_rgba(2,132,199,0.03)] mt-auto no-print">
          <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-500 font-label-sm text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>CardioSense Biosignals Acoustic Engine © 2026 • High-Resolution PCG Telemetry Spec v4.8</span>
            </div>
            <div className="flex items-center gap-4 font-semibold">
              <span className="text-emerald-700">Sampling 48kHz / 24-bit</span>
              <span className="text-sky-700">Latency &lt;12ms</span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ISO 13485 Validated
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
