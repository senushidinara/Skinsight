import React, { useState, useEffect } from 'react';
import { Scan, Activity, Shield, Sun, Sparkles, Camera, X, ChevronRight, Upload, Pill } from 'lucide-react';
import { CameraCapture } from './components/CameraCapture';
import { Dashboard } from './components/Dashboard';
import { analyzeSkin } from './services/geminiService';
import { AnalysisResult, SkinMode } from './types';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<SkinMode>(SkinMode.DASHBOARD);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Medication State
  const [showMedicationInput, setShowMedicationInput] = useState(false);
  const [medicationList, setMedicationList] = useState("");

  const handleImageCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setShowCamera(false);
    setIsAnalyzing(true);
    setError(null);

    try {
      // We pass the current mode and medication list to the AI
      const result = await analyzeSkin(
        imageSrc, 
        currentMode === SkinMode.DASHBOARD ? SkinMode.LIE_DETECTOR : currentMode,
        medicationList
      );
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze skin. Please ensure API Key is valid and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleImageCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setError(null);
    setMedicationList("");
  };

  const startMedicationFlow = () => {
    setCurrentMode(SkinMode.MEDICATION_MONITOR);
    setShowMedicationInput(true);
  };

  const handleMedicationSubmit = () => {
    setShowMedicationInput(false);
    setShowCamera(true);
  };

  // Simple navigation mapping
  const renderContent = () => {
    if (showMedicationInput) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-slate-900 border border-slate-700 w-full max-w-md p-6 rounded-2xl shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Pill className="text-indigo-400" />
                            Current Medications
                        </h3>
                        <button onClick={() => setShowMedicationInput(false)} className="text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-xl mb-4 border border-slate-700/50">
                        <p className="text-slate-300 text-sm font-semibold mb-2">Instructions:</p>
                        <ul className="text-slate-400 text-xs space-y-1.5 list-disc list-inside">
                            <li>List all active oral and topical medications.</li>
                            <li>Include dosage if known (e.g., 20mg).</li>
                            <li>Separate items with commas or new lines.</li>
                        </ul>
                    </div>

                    <textarea 
                        value={medicationList}
                        onChange={(e) => setMedicationList(e.target.value)}
                        placeholder="Example format:&#10;Accutane (20mg)&#10;Tretinoin 0.05%&#10;Spironolactone (100mg)"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 min-h-[140px] mb-6 font-mono text-sm"
                    />
                    <button 
                        onClick={handleMedicationSubmit}
                        disabled={!medicationList.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        Next: Analyze Skin
                    </button>
                </div>
            </div>
        )
    }

    if (showCamera) {
      return (
        <div className="fixed inset-0 z-50 bg-black">
          <CameraCapture onCapture={handleImageCapture} onCancel={() => setShowCamera(false)} />
        </div>
      );
    }

    if (capturedImage && analysisResult) {
      return (
        <Dashboard 
          result={analysisResult} 
          image={capturedImage} 
          mode={currentMode}
          onReset={handleReset}
        />
      );
    }

    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6 bg-slate-900">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto text-cyan-400 w-12 h-12 animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Analyzing Dermis Layer...</h2>
            <p className="text-slate-400">AI is detecting patterns, measuring texture, and calculating health scores.</p>
          </div>
          {capturedImage && (
             <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <img src={capturedImage} alt="Analyzing" className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-scan h-full w-full pointer-events-none"></div>
             </div>
          )}
        </div>
      );
    }

    // Landing / Mode Selection
    return (
      <div className="flex flex-col min-h-screen bg-slate-900 pb-20">
        {/* Header */}
        <header className="p-6 bg-gradient-to-b from-slate-800 to-transparent">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Scan className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-wide">SkinSight AI</h1>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 overflow-hidden">
                <img src="https://picsum.photos/100/100" alt="User" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-900/20">
            <h2 className="text-2xl font-bold text-white mb-2">Good Evening, Sarah</h2>
            <p className="text-indigo-100 text-sm mb-4">Your skin score is trending up (+12%) this week. Ready for your nightly scan?</p>
            <div className="flex gap-3">
                <button 
                  onClick={() => setShowCamera(true)}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-indigo-50 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Quick Scan
                </button>
                
                <label className="bg-indigo-500/30 border border-indigo-400/30 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-indigo-500/50 transition-colors cursor-pointer backdrop-blur-sm">
                    <Upload className="w-4 h-4" />
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
            </div>
          </div>
        </header>

        {/* Feature Grid */}
        <div className="flex-1 px-6 space-y-6 overflow-y-auto">
          <section>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Intelligence Modules</h3>
            <div className="grid gap-4">
              <FeatureCard 
                icon={<Pill className="text-indigo-400" />}
                title="Medication Monitor"
                subtitle="Drug-Skin Interaction Analysis"
                color="bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40"
                onClick={startMedicationFlow}
              />
              <FeatureCard 
                icon={<Activity className="text-rose-400" />}
                title="Lie Detector"
                subtitle="Product Efficacy Tracking"
                color="bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40"
                onClick={() => { setCurrentMode(SkinMode.LIE_DETECTOR); setShowCamera(true); }}
              />
              <FeatureCard 
                icon={<Scan className="text-emerald-400" />}
                title="Acne Detective"
                subtitle="Root Cause Analysis"
                color="bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40"
                onClick={() => { setCurrentMode(SkinMode.ACNE_DETECTIVE); setShowCamera(true); }}
              />
              <FeatureCard 
                icon={<Shield className="text-blue-400" />}
                title="Mole Guardian"
                subtitle="ABCDE Change Tracking"
                color="bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40"
                onClick={() => { setCurrentMode(SkinMode.MOLE_GUARDIAN); setShowCamera(true); }}
              />
              <FeatureCard 
                icon={<Sun className="text-amber-400" />}
                title="UV Revealer"
                subtitle="Hidden Damage Simulation"
                color="bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40"
                onClick={() => { setCurrentMode(SkinMode.UV_REVEALER); setShowCamera(true); }}
              />
              <FeatureCard 
                icon={<Sparkles className="text-purple-400" />}
                title="Routine Optimizer"
                subtitle="AI Sequencing & Timing"
                color="bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40"
                onClick={() => { setCurrentMode(SkinMode.ROUTINE_OPTIMIZER); setShowCamera(true); }}
              />
            </div>
          </section>
        </div>
        
        {error && (
            <div className="fixed bottom-20 left-6 right-6 bg-red-500/90 text-white p-4 rounded-xl text-sm backdrop-blur shadow-xl">
                {error}
                <button onClick={() => setError(null)} className="absolute top-2 right-2 text-white/70"><X size={14}/></button>
            </div>
        )}
      </div>
    );
  };

  return renderContent();
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
}> = ({ icon, title, subtitle, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full p-4 rounded-xl border backdrop-blur-sm transition-all text-left flex items-center gap-4 group ${color}`}
  >
    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0 shadow-inner">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="text-white font-medium group-hover:text-white/90">{title}</h4>
      <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
    </div>
    <ChevronRight className="text-slate-600 group-hover:translate-x-1 transition-transform" />
  </button>
);

export default App;