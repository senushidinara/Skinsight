import React, { useState, useEffect } from 'react';
import { AnalysisResult, SkinMode } from '../types';
import { X, Share2, Info, ArrowUp, ArrowDown, AlertCircle, Droplets, Activity, MoveHorizontal, Pill, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  result: AnalysisResult;
  image: string;
  mode: SkinMode;
  onReset: () => void;
}

const generateMockHistory = (currentScore: number) => [
  { date: 'W1', score: Math.max(0, currentScore - 15) },
  { date: 'W2', score: Math.max(0, currentScore - 8) },
  { date: 'W3', score: Math.max(0, currentScore - 12) },
  { date: 'W4', score: Math.max(0, currentScore - 5) },
  { date: 'Today', score: currentScore },
];

export const Dashboard: React.FC<DashboardProps> = ({ result, image, mode, onReset }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'recommendations'>('analysis');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [simulationIntensity, setSimulationIntensity] = useState<number>(result.uvDamageEstimate ?? 50);
  
  useEffect(() => {
    setSimulationIntensity(result.uvDamageEstimate ?? 50);
  }, [result.uvDamageEstimate]);

  const groupedSideEffects = result.medicationAnalysis?.sideEffectMatches.reduce((acc, match) => {
    const key = match.medication || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {} as Record<string, NonNullable<AnalysisResult['medicationAnalysis']>['sideEffectMatches']>) || {};

  const data = generateMockHistory(result.overallScore);
  const isUVMode = mode === SkinMode.UV_REVEALER;

  const intensity = simulationIntensity / 100;
  const uvFilterStyle = {
    filter: `contrast(${1.1 + (intensity * 1.2)}) brightness(${0.8 - (intensity * 0.2)}) grayscale(1) sepia(1) hue-rotate(${180 + (intensity * 30)}deg) saturate(${2 + (intensity * 4)})`
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isUVMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setSliderPosition(x);
  };

  const handleImageTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isUVMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    setSliderPosition(x);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 overflow-hidden">
      {/* Header with Image & Overlay */}
      <div className="relative h-[45vh] bg-gradient-to-b from-rose-100 to-blue-50 shrink-0 select-none">
        
        {/* Image Container with Slider Logic */}
        <div 
          className={`relative w-full h-full overflow-hidden ${isUVMode ? 'cursor-col-resize touch-none' : ''}`}
          onMouseMove={handleImageMouseMove}
          onTouchMove={handleImageTouchMove}
        >
           {/* Base Image (Natural) */}
           <img 
             src={image} 
             alt="Analyzed Face" 
             className="absolute inset-0 w-full h-full object-cover"
           />
           
           {isUVMode && (
             <>
                {/* Label: Natural */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-700 border border-white/60 pointer-events-none z-10 shadow-sm">
                    NATURAL
                </div>

                {/* UV Overlay Layer - Clipped */}
                <div 
                    className="absolute inset-0 bg-gradient-to-br from-purple-200 to-indigo-200 border-r-2 border-rose-400 overflow-hidden z-10"
                    style={{ width: `${sliderPosition}%` }}
                >
                    {/* Inner image wrapper to maintain full size relative to viewport/container */}
                    <div className="relative w-screen h-full">
                         <img 
                            src={image} 
                            alt="UV Scan" 
                            className="w-full h-full object-cover transition-all duration-300 ease-linear"
                            style={uvFilterStyle}
                         />
                         {/* Colored Overlay to deepen the UV effect based on intensity */}
                         <div 
                           className="absolute inset-0 mix-blend-overlay pointer-events-none"
                           style={{ backgroundColor: `rgba(147, 112, 219, ${0.2 + (intensity * 0.2)})` }}
                         ></div>
                    </div>
                    
                    {/* Label: UV Simulation */}
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-purple-700 border border-purple-300 pointer-events-none shadow-sm">
                        UV SIMULATION
                    </div>
                </div>

                {/* Slider Handle */}
                <div 
                    className="absolute top-0 bottom-0 w-0.5 z-20 pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white">
                        <MoveHorizontal size={16} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-6 w-32 text-center text-[10px] font-bold text-gray-700 drop-shadow-md tracking-widest">
                       DRAG TO REVEAL
                    </div>
                </div>
             </>
           )}
        </div>

        {/* Top Bar UI */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-30 pointer-events-none">
          <button onClick={onReset} className="p-2 bg-white/60 backdrop-blur rounded-full pointer-events-auto hover:bg-white/80 transition-colors shadow-md">
            <X size={20} className="text-gray-700" />
          </button>
          <div className="px-3 py-1 rounded-full bg-rose-300/40 border border-rose-300 text-rose-700 text-xs font-bold backdrop-blur shadow-md">
            {mode.replace('_', ' ')} MODE
          </div>
          <button className="p-2 bg-white/60 backdrop-blur rounded-full pointer-events-auto hover:bg-white/80 transition-colors shadow-md">
            <Share2 size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Bottom Stats Overlay */}
        <div className="absolute bottom-4 left-6 right-6 z-30 pointer-events-none">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-gray-600 text-sm mb-1 drop-shadow-md">Overall Health Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900 drop-shadow-lg">{result.overallScore}</span>
                <span className="text-emerald-600 text-sm font-bold flex items-center drop-shadow-md">
                    <ArrowUp size={12} className="mr-1"/> +12%
                </span>
              </div>
            </div>
            <div className="text-right">
                <p className="text-gray-600 text-xs uppercase tracking-wider drop-shadow-md">Skin Age</p>
                <p className="text-2xl font-semibold text-gray-900 drop-shadow-lg">{result.skinAge}</p>
            </div>
          </div>
        </div>
        
        {/* Gradient Bottom Shade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-20"></div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-white rounded-t-3xl -mt-6 relative z-40 px-6 pt-8 pb-20 shadow-2xl">
        
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
            <button 
                onClick={() => setActiveTab('analysis')}
                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Analysis Data
            </button>
            <button 
                onClick={() => setActiveTab('recommendations')}
                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'recommendations' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Smart Action Plan
            </button>
        </div>

        {activeTab === 'analysis' ? (
            <div className="space-y-8">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <MetricCard title="Hydration" value={result.hydration} icon={<Droplets size={16} className="text-blue-400"/>} />
                    <MetricCard title="Texture" value={result.texture} icon={<Activity size={16} className="text-purple-400"/>} />
                    <MetricCard title="Redness" value={result.redness} icon={<AlertCircle size={16} className="text-rose-400"/>} inverse />
                    <MetricCard title="UV Load" value={result.uvDamageEstimate} icon={<Info size={16} className="text-amber-400"/>} inverse />
                </div>

                {/* Medication Analysis Card - ONLY if Data Exists */}
                {result.medicationAnalysis && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 border-b border-rose-200 pb-3">
                             <Pill className="text-rose-400" size={20} />
                             <h3 className="text-rose-700 font-semibold">Medication Impact</h3>
                        </div>
                        
                        <p className="text-rose-800/80 text-sm mb-5 italic">
                            "{result.medicationAnalysis.impactSummary}"
                        </p>

                        <div className="space-y-4">
                            {Object.entries(groupedSideEffects).map(([medication, effects]) => (
                                <div key={medication} className="bg-white rounded-lg p-4 border border-rose-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-md"></div>
                                        <h4 className="text-gray-800 font-bold text-sm tracking-wide">{medication}</h4>
                                    </div>
                                    
                                    <div className="space-y-3 pl-2 border-l border-rose-200 ml-0.5">
                                        {effects.map((match, idx) => (
                                            <div key={idx} className="flex items-start gap-3 group ml-2">
                                                 {match.likelihood === 'confirmed' ? 
                                                    <AlertTriangle size={14} className="text-rose-500 mt-0.5 shrink-0" /> : 
                                                    (match.likelihood === 'likely' ? 
                                                        <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" /> :
                                                        <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                                    )
                                                }
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-700 text-sm leading-tight font-medium">{match.observedEffect}</p>
                                                </div>
                                                
                                                <div className="flex gap-2 shrink-0">
                                                    {/* Severity Badge */}
                                                    <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                                                        match.severity === 'severe' 
                                                            ? 'bg-rose-100 border-rose-300 text-rose-700'
                                                            : match.severity === 'moderate'
                                                                ? 'bg-amber-100 border-amber-300 text-amber-700'
                                                                : 'bg-blue-100 border-blue-300 text-blue-700'
                                                    }`}>
                                                        {match.severity}
                                                    </div>

                                                    {/* Likelihood Badge */}
                                                    <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                                                        match.likelihood === 'confirmed' 
                                                            ? 'bg-rose-100 border-rose-300 text-rose-700' 
                                                            : match.likelihood === 'likely'
                                                                ? 'bg-amber-100 border-amber-300 text-amber-700'
                                                                : 'bg-gray-100 border-gray-300 text-gray-700'
                                                    }`}>
                                                        {match.likelihood}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {result.medicationAnalysis.contraindications.length > 0 && (
                            <div className="mt-5 pt-4 border-t border-rose-200">
                                <p className="text-xs text-rose-600 font-bold mb-2 flex items-center gap-2">
                                    <AlertTriangle size={12} />
                                    CONTRAINDICATIONS
                                </p>
                                <div className="flex flex-col gap-2">
                                    {result.medicationAnalysis.contraindications.map((item, i) => (
                                        <div key={i} className="px-3 py-2 rounded-lg bg-rose-100 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                                            <div className="w-1 h-1 bg-rose-500 rounded-full mt-1.5 shrink-0"></div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Lie Detector Section */}
                {mode === SkinMode.LIE_DETECTOR && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-amber-900 font-semibold flex items-center gap-2">
                                Product Waste Score
                            </h3>
                            <span className="text-2xl font-bold text-amber-500">{result.wasteScore}%</span>
                        </div>
                        <p className="text-amber-900/70 text-xs leading-relaxed mb-2">
                            Based on your congestion levels compared to product usage, your current routine is showing signs of inefficiency.
                        </p>
                    </div>
                )}
                
                {/* UV Specific Insight */}
                {isUVMode && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>
                        <h3 className="text-purple-900 font-semibold mb-2 flex items-center gap-2">
                            <Sun size={16} className="text-purple-500" />
                            Deep Dermis Analysis
                        </h3>
                        <p className="text-purple-800/80 text-xs leading-relaxed mb-3">
                            The visual simulation above uses your UV Load score ({result.uvDamageEstimate}/100) to reveal potential subsurface damage. 
                            {result.uvDamageEstimate > 60 
                              ? " High contrast areas indicate accumulated pigmentation that may surface as sun spots." 
                              : " Your skin shows minimal hidden damage. Keep up the good sun protection!"}
                        </p>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                            <div 
                                className="h-full bg-gradient-to-r from-purple-400 to-rose-400" 
                                style={{ width: `${result.uvDamageEstimate}%` }}
                            ></div>
                        </div>

                        {/* Intensity Slider */}
                        <div className="mt-4 pt-4 border-t border-purple-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-purple-900 text-xs font-medium">Simulation Intensity</span>
                                <span className="text-purple-700 text-xs font-bold">{simulationIntensity}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={simulationIntensity} 
                                onChange={(e) => setSimulationIntensity(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-400 hover:accent-rose-500 transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* Graph */}
                <div className="h-48 w-full mt-4 bg-gradient-to-br from-blue-50 to-rose-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-bold text-gray-600 mb-4 uppercase">Skin Health Trend</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#1f2937' }}
                                itemStyle={{ color: '#ec4899' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#f472b6" fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Concerns List */}
                <div>
                    <h3 className="text-gray-900 font-semibold mb-3">Detected Concerns</h3>
                    <div className="space-y-3">
                        {result.concerns.map((c) => (
                            <div key={c.id} className="bg-gray-50 p-4 rounded-xl flex gap-4 border border-gray-200">
                                <div className={`w-1 h-full rounded-full ${c.severity === 'high' ? 'bg-rose-500' : c.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                <div>
                                    <div className="flex justify-between items-center w-full mb-1">
                                        <h4 className="text-sm font-medium text-gray-800">{c.name}</h4>
                                        <span className="text-[10px] uppercase tracking-wider text-gray-500">{c.location}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{c.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-rose-50 border border-rose-200 p-5 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-rose-300 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                             {rec.priority.toUpperCase()} PRIORITY
                        </div>
                        <h4 className="text-rose-900 font-semibold mb-1">{rec.title}</h4>
                        <p className="text-rose-800/70 text-sm mb-3">{rec.description}</p>
                        
                        <div className="flex items-center gap-3 mt-2">
                            <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-600">IMG</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 uppercase">Recommended Type</p>
                                <p className="text-sm text-gray-800">{rec.productType || "Treatment"}</p>
                            </div>
                            <button className="px-4 py-2 bg-rose-400 hover:bg-rose-300 rounded-lg text-xs font-bold transition-colors text-white shadow-md">
                                VIEW
                            </button>
                        </div>
                    </div>
                ))}
                
                <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mt-8 text-center border border-blue-200">
                    <h4 className="text-blue-900 font-bold mb-2">Unlock Full Analysis?</h4>
                    <p className="text-blue-800/70 text-xs mb-4">Get detailed ingredient breakdowns and dermatologist verification.</p>
                    <button className="w-full py-3 bg-rose-400 hover:bg-rose-300 text-white font-bold rounded-xl transition-colors shadow-md">
                        Upgrade to Pro ($4.99)
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: number; icon: React.ReactNode; inverse?: boolean }> = ({ title, value, icon, inverse }) => {
    const isGood = inverse ? value < 40 : value > 70;
    const isBad = inverse ? value > 70 : value < 40;
    
    const colorClass = isGood ? 'text-emerald-500' : isBad ? 'text-rose-500' : 'text-amber-500';
    const bgClass = isGood ? 'bg-emerald-100' : isBad ? 'bg-rose-100' : 'bg-amber-100';
    const borderClass = isGood ? 'border-emerald-200' : isBad ? 'border-rose-200' : 'border-amber-200';

    return (
        <div className={`bg-white p-4 rounded-xl border flex flex-col justify-between ${borderClass}`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-600 text-xs font-medium">{title}</span>
                {icon}
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                <div className={`h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden`}>
                    <div className={`h-full rounded-full ${colorClass.replace('text', 'bg')}`} style={{ width: `${value}%` }}></div>
                </div>
            </div>
            <p className={`text-[10px] mt-1 font-medium ${colorClass}`}>
                {isGood ? 'Optimal' : 'Needs Attention'}
            </p>
        </div>
    );
};

const Sun = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="m6.34 17.66-1.41 1.41"></path>
        <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
);
