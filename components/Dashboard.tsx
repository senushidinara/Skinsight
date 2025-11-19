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

// Mock historical data for the graph
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
  
  // Initialize intensity with the AI's estimate, but allow user adjustment
  const [simulationIntensity, setSimulationIntensity] = useState<number>(result.uvDamageEstimate ?? 50);
  
  useEffect(() => {
    // Reset to result estimate if the result changes
    setSimulationIntensity(result.uvDamageEstimate ?? 50);
  }, [result.uvDamageEstimate]);

  // Group side effects by medication
  const groupedSideEffects = result.medicationAnalysis?.sideEffectMatches.reduce((acc, match) => {
    const key = match.medication || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {} as Record<string, NonNullable<AnalysisResult['medicationAnalysis']>['sideEffectMatches']>) || {};

  const data = generateMockHistory(result.overallScore);
  const isUVMode = mode === SkinMode.UV_REVEALER;

  // Calculate UV Filter intensity based on user slider (or default score)
  // Scale factors: 0.0 to 1.0
  const intensity = simulationIntensity / 100; 
  
  // Wood's Lamp Simulation Logic:
  // High Contrast: highlights pigmentation
  // Low Brightness: simulates dark room/UV light
  // Purple/Blue Tint: standard UV photography look (Sepia + Hue Rotate)
  // Saturation: Higher damage = more vivid spots
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
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* Header with Image & Overlay */}
      <div className="relative h-[45vh] bg-slate-900 shrink-0 select-none">
        
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
                <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white/70 border border-white/10 pointer-events-none z-10">
                    NATURAL
                </div>

                {/* UV Overlay Layer - Clipped */}
                <div 
                    className="absolute inset-0 bg-slate-950 border-r-2 border-cyan-400 overflow-hidden z-10"
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
                           style={{ backgroundColor: `rgba(60, 20, 120, ${0.3 + (intensity * 0.3)})` }}
                         ></div>
                    </div>
                    
                    {/* Label: UV Simulation */}
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-cyan-300 border border-cyan-500/30 pointer-events-none shadow-lg">
                        UV SIMULATION
                    </div>
                </div>

                {/* Slider Handle */}
                <div 
                    className="absolute top-0 bottom-0 w-0.5 z-20 pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.6)] border-2 border-white text-white">
                        <MoveHorizontal size={16} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-6 w-32 text-center text-[10px] font-bold text-white/80 drop-shadow-md tracking-widest">
                       DRAG TO REVEAL
                    </div>
                </div>
             </>
           )}
        </div>

        {/* Top Bar UI */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-30 pointer-events-none">
          <button onClick={onReset} className="p-2 bg-black/30 backdrop-blur rounded-full pointer-events-auto hover:bg-black/50 transition-colors">
            <X size={20} />
          </button>
          <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-bold backdrop-blur shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            {mode.replace('_', ' ')} MODE
          </div>
          <button className="p-2 bg-black/30 backdrop-blur rounded-full pointer-events-auto hover:bg-black/50 transition-colors">
            <Share2 size={20} />
          </button>
        </div>

        {/* Bottom Stats Overlay */}
        <div className="absolute bottom-4 left-6 right-6 z-30 pointer-events-none">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-slate-400 text-sm mb-1 drop-shadow-md">Overall Health Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white drop-shadow-lg">{result.overallScore}</span>
                <span className="text-emerald-400 text-sm font-bold flex items-center drop-shadow-md">
                    <ArrowUp size={12} className="mr-1"/> +12%
                </span>
              </div>
            </div>
            <div className="text-right">
                <p className="text-slate-400 text-xs uppercase tracking-wider drop-shadow-md">Skin Age</p>
                <p className="text-2xl font-semibold drop-shadow-lg">{result.skinAge}</p>
            </div>
          </div>
        </div>
        
        {/* Gradient Bottom Shade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-20"></div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-slate-950 rounded-t-3xl -mt-6 relative z-40 px-6 pt-8 pb-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-800 mb-6">
            <button 
                onClick={() => setActiveTab('analysis')}
                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-400'}`}
            >
                Analysis Data
            </button>
            <button 
                onClick={() => setActiveTab('recommendations')}
                className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'recommendations' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-400'}`}
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
                    <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-5 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 border-b border-indigo-500/20 pb-3">
                             <Pill className="text-indigo-400" size={20} />
                             <h3 className="text-indigo-100 font-semibold">Medication Impact</h3>
                        </div>
                        
                        <p className="text-indigo-200/80 text-sm mb-5 italic">
                            "{result.medicationAnalysis.impactSummary}"
                        </p>

                        <div className="space-y-4">
                            {Object.entries(groupedSideEffects).map(([medication, effects]) => (
                                <div key={medication} className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_5px_rgba(129,140,248,0.8)]"></div>
                                        <h4 className="text-white font-bold text-sm tracking-wide">{medication}</h4>
                                    </div>
                                    
                                    <div className="space-y-3 pl-2 border-l border-slate-800/50 ml-0.5">
                                        {effects.map((match, idx) => (
                                            <div key={idx} className="flex items-start gap-3 group ml-2">
                                                 {match.likelihood === 'confirmed' ? 
                                                    <AlertTriangle size={14} className="text-rose-400 mt-0.5 shrink-0" /> : 
                                                    (match.likelihood === 'likely' ? 
                                                        <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" /> :
                                                        <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                                    )
                                                }
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-slate-300 text-sm leading-tight font-medium">{match.observedEffect}</p>
                                                </div>
                                                
                                                <div className="flex gap-2 shrink-0">
                                                    {/* Severity Badge */}
                                                    <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                                                        match.severity === 'severe' 
                                                            ? 'bg-red-500/10 border-red-500/20 text-red-300'
                                                            : match.severity === 'moderate'
                                                                ? 'bg-orange-500/10 border-orange-500/20 text-orange-300'
                                                                : 'bg-teal-500/10 border-teal-500/20 text-teal-300'
                                                    }`}>
                                                        {match.severity}
                                                    </div>

                                                    {/* Likelihood Badge */}
                                                    <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                                                        match.likelihood === 'confirmed' 
                                                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                                                            : match.likelihood === 'likely'
                                                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                                                                : 'bg-slate-800 border-slate-700 text-slate-400'
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
                            <div className="mt-5 pt-4 border-t border-indigo-500/20">
                                <p className="text-xs text-rose-300 font-bold mb-2 flex items-center gap-2">
                                    <AlertTriangle size={12} />
                                    CONTRAINDICATIONS
                                </p>
                                <div className="flex flex-col gap-2">
                                    {result.medicationAnalysis.contraindications.map((item, i) => (
                                        <div key={i} className="px-3 py-2 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-200 text-xs flex items-start gap-2">
                                            <div className="w-1 h-1 bg-rose-400 rounded-full mt-1.5 shrink-0"></div>
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
                    <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-rose-200 font-semibold flex items-center gap-2">
                                Product Waste Score
                            </h3>
                            <span className="text-2xl font-bold text-rose-400">{result.wasteScore}%</span>
                        </div>
                        <p className="text-rose-200/70 text-xs leading-relaxed mb-2">
                            Based on your congestion levels compared to product usage, your current routine is showing signs of inefficiency.
                        </p>
                    </div>
                )}
                
                {/* UV Specific Insight */}
                {isUVMode && (
                    <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                        <h3 className="text-indigo-200 font-semibold mb-2 flex items-center gap-2">
                            <Sun size={16} className="text-indigo-400" />
                            Deep Dermis Analysis
                        </h3>
                        <p className="text-indigo-200/70 text-xs leading-relaxed mb-3">
                            The visual simulation above uses your UV Load score ({result.uvDamageEstimate}/100) to reveal potential subsurface damage. 
                            {result.uvDamageEstimate > 60 
                              ? " High contrast areas indicate accumulated pigmentation that may surface as sun spots." 
                              : " Your skin shows minimal hidden damage. Keep up the good sun protection!"}
                        </p>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                                style={{ width: `${result.uvDamageEstimate}%` }}
                            ></div>
                        </div>

                        {/* Intensity Slider */}
                        <div className="mt-4 pt-4 border-t border-indigo-500/20">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-indigo-200 text-xs font-medium">Simulation Intensity</span>
                                <span className="text-indigo-300 text-xs font-bold">{simulationIntensity}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={simulationIntensity} 
                                onChange={(e) => setSimulationIntensity(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* Graph */}
                <div className="h-48 w-full mt-4 bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs font-bold text-slate-500 mb-4 uppercase">Skin Health Trend</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#22d3ee' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#06b6d4" fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Concerns List */}
                <div>
                    <h3 className="text-white font-semibold mb-3">Detected Concerns</h3>
                    <div className="space-y-3">
                        {result.concerns.map((c) => (
                            <div key={c.id} className="bg-slate-900 p-4 rounded-xl flex gap-4 border border-slate-800">
                                <div className={`w-1 h-full rounded-full ${c.severity === 'high' ? 'bg-rose-500' : c.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                <div>
                                    <div className="flex justify-between items-center w-full mb-1">
                                        <h4 className="text-sm font-medium text-slate-200">{c.name}</h4>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500">{c.location}</span>
                                    </div>
                                    <p className="text-xs text-slate-400">{c.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-indigo-950/20 border border-indigo-500/20 p-5 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                             {rec.priority.toUpperCase()} PRIORITY
                        </div>
                        <h4 className="text-indigo-100 font-semibold mb-1">{rec.title}</h4>
                        <p className="text-indigo-200/60 text-sm mb-3">{rec.description}</p>
                        
                        <div className="flex items-center gap-3 mt-2">
                            <div className="h-10 w-10 rounded bg-slate-800 flex items-center justify-center">
                                <span className="text-xs text-slate-500">IMG</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-400 uppercase">Recommended Type</p>
                                <p className="text-sm text-white">{rec.productType || "Treatment"}</p>
                            </div>
                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-colors">
                                VIEW
                            </button>
                        </div>
                    </div>
                ))}
                
                <div className="p-6 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-2xl mt-8 text-center border border-cyan-500/20">
                    <h4 className="text-cyan-100 font-bold mb-2">Unlock Full Analysis?</h4>
                    <p className="text-cyan-200/60 text-xs mb-4">Get detailed ingredient breakdowns and dermatologist verification.</p>
                    <button className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-colors">
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
    // Inverse means lower is better (like Redness)
    const isGood = inverse ? value < 40 : value > 70;
    const isBad = inverse ? value > 70 : value < 40;
    
    const colorClass = isGood ? 'text-emerald-400' : isBad ? 'text-rose-400' : 'text-amber-400';
    const bgClass = isGood ? 'bg-emerald-500/10' : isBad ? 'bg-rose-500/10' : 'bg-amber-500/10';

    return (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 text-xs font-medium">{title}</span>
                {icon}
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{value}</span>
                <div className={`h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden`}>
                    <div className={`h-full rounded-full ${colorClass.replace('text', 'bg')}`} style={{ width: `${value}%` }}></div>
                </div>
            </div>
            <p className={`text-[10px] mt-1 font-medium ${colorClass}`}>
                {isGood ? 'Optimal' : 'Needs Attention'}
            </p>
        </div>
    );
}
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