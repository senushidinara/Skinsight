export enum SkinMode {
  DASHBOARD = 'DASHBOARD',
  LIE_DETECTOR = 'LIE_DETECTOR',
  ACNE_DETECTIVE = 'ACNE_DETECTIVE',
  MOLE_GUARDIAN = 'MOLE_GUARDIAN',
  UV_REVEALER = 'UV_REVEALER',
  ROUTINE_OPTIMIZER = 'ROUTINE_OPTIMIZER',
  MEDICATION_MONITOR = 'MEDICATION_MONITOR'
}

export interface AnalysisResult {
  overallScore: number; // 0-100
  skinAge: number;
  wasteScore: number; // 0-100 (for Lie Detector)
  hydration: number; // 0-100
  texture: number; // 0-100
  redness: number; // 0-100
  uvDamageEstimate: number; // 0-100
  concerns: Array<{
    id: string;
    name: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    location?: string; // e.g., "forehead", "left_cheek"
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    productType?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  detectedProducts?: string[]; // For lie detector mock
  medicationAnalysis?: {
    analyzedMedications: string[];
    impactSummary: string;
    sideEffectMatches: Array<{
        medication: string;
        observedEffect: string;
        likelihood: 'possible' | 'likely' | 'confirmed';
        severity: 'mild' | 'moderate' | 'severe';
    }>;
    contraindications: string[];
  };
}

export interface HistoryDataPoint {
  date: string;
  score: number;
}