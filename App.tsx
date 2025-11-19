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
      const result = await analyzeSkin(
        imageSrc, 
        currentMode === SkinMode.DASHBOARD ? SkinMode.LIE_DETECTOR : currentMode,
        medicationList
      );
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze skin. Please try again.");
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

  const renderContent = () => {
    if (showMedicationInput) {
        return (
            <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-white border border-rose-100 w-full max-w-md p-6 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Pill className="text-rose-400" />
                            Current Medications
                        </h3>
                        <button onClick={() => setShowMedicationInput(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="bg-rose-50 p-4 rounded-xl mb-4 border border-rose-100">
                        <p className="text-gray-700 text-sm font-semibold mb-2">Instructions:</p>
                        <ul className="text-gray-600 text-xs space-y-1.5 list-disc list-inside">
                            <li>List all active oral and topical medications.</li>
                            <li>Include dosage if known (e.g., 20mg).</li>
                            <li>Separate items with commas or new lines.</li>
                        </ul>
                    </div>

                    <textarea 
                        value={medicationList}
                        onChange={(e) => setMedicationList(e.target.value)}
                        placeholder="Example format:&#10;Accutane (20mg)&#10;Tretinoin 0.05%&#10;Spironolactone (100mg)"
                        className="w-full bg-white border border-rose-200 rounded-xl p-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 min-h-[140px] mb-6 font-mono text-sm"
                    />
                    <button 
                        onClick={handleMedicationSubmit}
                        disabled={!medicationList.trim()}
                        className="w-full bg-rose-400 hover:bg-rose-300 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
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
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6 bg-gradient-to-br from-rose-50 to-blue-50">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-4 border-rose-300/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-t-4 border-rose-400 rounded-full animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto text-rose-400 w-12 h-12 animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Skin...</h2>
            <p className="text-gray-600">Detecting patterns, measuring texture, and calculating health scores.</p>
          </div>
          {capturedImage && (
             <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-rose-300/50 shadow-lg">
                <img src={capturedImage} alt="Analyzing" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-300/20 to-transparent animate-scan h-full w-full pointer-events-none"></div>
             </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-rose-50 to-blue-50 pb-20">
        {/* Header */}
        <header className="p-6 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-300 rounded-lg flex items-center justify-center shadow-md">
                <Scan className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 tracking-wide">SkinSight AI</h1>
            </div>
            <div className="w-8 h-8 rounded-full bg-rose-200 border border-rose-300 overflow-hidden">
                <img src="https://picsum.photos/100/100" alt="User" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-rose-300 to-pink-300 rounded-2xl p-6 shadow-lg shadow-rose-200/40">
            <h2 className="text-2xl font-bold text-white mb-2">Good Evening, Sarah</h2>
            <p className="text-white/90 text-sm mb-4">Your skin score is trending up (+12%) this week. Ready for your nightly scan?</p>
            <div className="flex gap-3">
                <button 
                  onClick={() => setShowCamera(true)}
                  className="bg-white text-rose-400 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-rose-50 transition-colors shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  Quick Scan
                </button>
                
                <label className="bg-white/20 border border-white/40 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-white/30 transition-colors cursor-pointer backdrop-blur-sm shadow-md">
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
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Intelligence Modules</h3>
            <div className="grid gap-4">
              <FeatureCard 
                icon={<Pill className="text-rose-400" />}
                title="Medication Monitor"
                subtitle="Drug-Skin Interaction Analysis"
                color="bg-rose-100/50 border-rose-200 hover:border-rose-300 hover:bg-rose-100"
                onClick={startMedicationFlow}
              />
              <FeatureCard 
                icon={<Activity className="text-amber-400" />}
                title="Lie Detector"
                subtitle="Product Efficacy Tracking"
                color="bg-amber-100/50 border-amber-200 hover:border-amber-300 hover:bg-amber-100"
                onClick={() => { setCurrentMode(SkinMode.LIE_DETECTOR); setShowCamera(true); }}
              />
              <FeatureCard 
                icon={<Scan className="text-emerald-400" />}
                title="Acne Detective"
                subtitle="Root Cause Analysis"
                color="bg-emerald-100/50 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-100"
                onClick={() => { setCurrentMode(SkinMode.ACNE_DETECTIVE); setShowCamera(true); }}
              />
              <FeatureCard 
                icon={<Shield className="text-blue-400" />}
                title="Mole Guardian"
                subtitle="ABCDE Change Tracking"
                color="bg-blue-100/50 border-blue-200 hover:border-blue-300 hover:bg-blue-100"
                onClick={() => { setCurrentMode(SkinMode.MOLE_GUARDIAN); setShowCamera(true); }}
              />
              <FeatureCard 
                icon={<Sun className="text-yellow-400" />}
                title="UV Revealer"
                subtitle="Hidden Damage Simulation"
                color="bg-yellow-100/50 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-100"
                onClick={() => { setCurrentMode(SkinMode.UV_REVEALER); setShowCamera(true); }}
              />
              <FeatureCard 
                icon={<Sparkles className="text-purple-400" />}
                title="Routine Optimizer"
                subtitle="AI Sequencing & Timing"
                color="bg-purple-100/50 border-purple-200 hover:border-purple-300 hover:bg-purple-100"
                onClick={() => { setCurrentMode(SkinMode.ROUTINE_OPTIMIZER); setShowCamera(true); }}
              />
            </div>
          </section>
        </div>
        
        {error && (
            <div className="fixed bottom-20 left-6 right-6 bg-rose-400/90 text-white p-4 rounded-xl text-sm backdrop-blur shadow-lg">
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
    <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center shrink-0 shadow-sm">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="text-gray-800 font-medium group-hover:text-gray-700">{title}</h4>
      <p className="text-gray-600 text-xs mt-0.5">{subtitle}</p>
    </div>
    <ChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
  </button>
);

export default App;
