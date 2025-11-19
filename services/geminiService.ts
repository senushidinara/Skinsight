import { SkinMode, AnalysisResult } from '../types';

// Mock data generators for different analysis modes
const mockAnalysisData: Record<SkinMode, AnalysisResult> = {
  [SkinMode.DASHBOARD]: {
    overallScore: 78,
    skinAge: 24,
    wasteScore: 35,
    hydration: 82,
    texture: 75,
    redness: 28,
    uvDamageEstimate: 42,
    concerns: [
      {
        id: 'minor-dryness',
        name: 'Minor Dryness',
        severity: 'low',
        description: 'Slight dehydration in T-zone area. Consider hydrating serum.',
        location: 'Forehead'
      },
      {
        id: 'fine-lines',
        name: 'Fine Lines',
        severity: 'low',
        description: 'Minimal expression lines around eyes. Preventative care recommended.',
        location: 'Around Eyes'
      }
    ],
    recommendations: [
      {
        title: 'Hydrating Essence',
        description: 'Boost skin hydration with a lightweight, fast-absorbing essence',
        productType: 'Essence',
        priority: 'high'
      },
      {
        title: 'Gentle Exfoliator',
        description: 'Use 2x per week to maintain skin texture and glow',
        productType: 'Exfoliator',
        priority: 'medium'
      },
      {
        title: 'SPF 30+ Sunscreen',
        description: 'Daily protection to prevent further UV damage and maintain elasticity',
        productType: 'Sunscreen',
        priority: 'high'
      }
    ]
  },

  [SkinMode.LIE_DETECTOR]: {
    overallScore: 72,
    skinAge: 26,
    wasteScore: 58,
    hydration: 65,
    texture: 68,
    redness: 35,
    uvDamageEstimate: 38,
    concerns: [
      {
        id: 'congestion',
        name: 'Product Buildup',
        severity: 'medium',
        description: 'Signs of product accumulation. Your routine may be over-complicated.',
        location: 'T-Zone'
      },
      {
        id: 'uneven-texture',
        name: 'Uneven Texture',
        severity: 'medium',
        description: 'Some products may not be synergizing well. Simplify your routine.',
        location: 'Cheeks'
      }
    ],
    recommendations: [
      {
        title: 'Simplify Your Routine',
        description: 'Reduce to essentials: cleanser, hydrator, sunscreen',
        productType: 'Routine Overhaul',
        priority: 'high'
      },
      {
        title: 'Detox Clay Mask',
        description: 'Use monthly to clear buildup and reset skin',
        productType: 'Mask',
        priority: 'high'
      },
      {
        title: 'Gentle Cleanser',
        description: 'Switch to pH-balanced, sulfate-free formula',
        productType: 'Cleanser',
        priority: 'medium'
      }
    ]
  },

  [SkinMode.ACNE_DETECTIVE]: {
    overallScore: 64,
    skinAge: 22,
    wasteScore: 45,
    hydration: 58,
    texture: 52,
    redness: 62,
    uvDamageEstimate: 25,
    concerns: [
      {
        id: 'active-breakouts',
        name: 'Active Breakouts',
        severity: 'high',
        description: 'Multiple inflammatory lesions detected. Likely hormonal or dietary trigger.',
        location: 'Jawline'
      },
      {
        id: 'post-inflammatory',
        name: 'Post-Inflammatory Marks',
        severity: 'medium',
        description: 'Hyperpigmentation from previous breakouts. Fading with time.',
        location: 'Left Cheek'
      },
      {
        id: 'excess-sebum',
        name: 'Excess Sebum',
        severity: 'medium',
        description: 'Overactive oil production in T-zone contributing to congestion.',
        location: 'Forehead'
      }
    ],
    recommendations: [
      {
        title: 'Niacinamide Treatment',
        description: '5% concentration to regulate sebum and strengthen barrier',
        productType: 'Treatment',
        priority: 'high'
      },
      {
        title: 'Salicylic Acid Cleanser',
        description: 'Daily use to exfoliate pores and prevent congestion',
        productType: 'Cleanser',
        priority: 'high'
      },
      {
        title: 'Azelaic Acid Serum',
        description: 'Address redness and prevent post-inflammatory hyperpigmentation',
        productType: 'Serum',
        priority: 'high'
      },
      {
        title: 'Lightweight Moisturizer',
        description: 'Non-comedogenic formula to maintain barrier without congestion',
        productType: 'Moisturizer',
        priority: 'medium'
      }
    ]
  },

  [SkinMode.MOLE_GUARDIAN]: {
    overallScore: 85,
    skinAge: 25,
    wasteScore: 0,
    hydration: 80,
    texture: 85,
    redness: 18,
    uvDamageEstimate: 32,
    concerns: [
      {
        id: 'mole-upper-cheek',
        name: 'Pigmented Lesion - Upper Cheek',
        severity: 'low',
        description: 'Appears benign. Symmetrical, defined borders, uniform color. Monitor for changes.',
        location: 'Right Cheek'
      },
      {
        id: 'mole-neck',
        name: 'Freckle Cluster',
        severity: 'low',
        description: 'Harmless sun freckles from UV exposure. No concerning ABCDE changes detected.',
        location: 'Neck'
      }
    ],
    recommendations: [
      {
        title: 'Monthly Self-Checks',
        description: 'Track moles with photos monthly using the ABCDE method',
        productType: 'Monitoring',
        priority: 'high'
      },
      {
        title: 'Broad-Spectrum SPF 50',
        description: 'Prevent new lesions and color darkening',
        productType: 'Sunscreen',
        priority: 'high'
      },
      {
        title: 'Annual Dermatology Exam',
        description: 'Professional assessment for any concerning lesions',
        productType: 'Professional',
        priority: 'medium'
      }
    ]
  },

  [SkinMode.UV_REVEALER]: {
    overallScore: 68,
    skinAge: 32,
    wasteScore: 0,
    hydration: 72,
    texture: 65,
    redness: 32,
    uvDamageEstimate: 71,
    concerns: [
      {
        id: 'sun-spots',
        name: 'Solar Lentigos',
        severity: 'high',
        description: 'Multiple sun spots concentrated on forehead and cheekbones. Cumulative sun exposure evident.',
        location: 'Forehead & Cheeks'
      },
      {
        id: 'photoaging',
        name: 'Photoaging Signs',
        severity: 'medium',
        description: 'Fine lines and reduced elasticity consistent with chronic UV exposure.',
        location: 'Around Eyes'
      }
    ],
    recommendations: [
      {
        title: 'Vitamin C Serum',
        description: 'Antioxidant protection and brightening to fade sun damage',
        productType: 'Serum',
        priority: 'high'
      },
      {
        title: 'Retinol Treatment',
        description: 'Evening use to boost collagen and reduce fine lines',
        productType: 'Treatment',
        priority: 'high'
      },
      {
        title: 'SPF 50+ Daily Sunscreen',
        description: 'Prevent further darkening of existing spots',
        productType: 'Sunscreen',
        priority: 'high'
      },
      {
        title: 'Professional Laser Treatment',
        description: 'Consider IPL or laser for more aggressive spot removal',
        productType: 'Professional',
        priority: 'medium'
      }
    ]
  },

  [SkinMode.ROUTINE_OPTIMIZER]: {
    overallScore: 81,
    skinAge: 23,
    wasteScore: 42,
    hydration: 86,
    texture: 79,
    redness: 22,
    uvDamageEstimate: 35,
    concerns: [
      {
        id: 'barrier-health',
        name: 'Optimal Barrier Health',
        severity: 'low',
        description: 'Skin barrier appears healthy. Current routine is working well.',
        location: 'Overall'
      },
      {
        id: 'slight-sensitivity',
        name: 'Slight Sensitivity',
        severity: 'low',
        description: 'Minimal irritation detected. No major product incompatibilities found.',
        location: 'Sensitive Areas'
      }
    ],
    recommendations: [
      {
        title: 'Maintain AM Routine',
        description: 'Continue with: Gentle cleanser → Hydrating toner → Sunscreen',
        productType: 'Routine',
        priority: 'high'
      },
      {
        title: 'Optimize PM Routine',
        description: 'Cleanser → Essence → Targeted serum → Night cream',
        productType: 'Routine',
        priority: 'high'
      },
      {
        title: 'Weekly Treatment Slot',
        description: 'Add exfoliator or sheet mask 1-2x weekly for enhanced results',
        productType: 'Treatment',
        priority: 'medium'
      }
    ]
  },

  [SkinMode.MEDICATION_MONITOR]: {
    overallScore: 62,
    skinAge: 27,
    wasteScore: 0,
    hydration: 58,
    texture: 54,
    redness: 48,
    uvDamageEstimate: 15,
    concerns: [
      {
        id: 'med-dryness',
        name: 'Medication-Related Dryness',
        severity: 'medium',
        description: 'Consistent with oral medication side effects. Barrier integrity compromised.',
        location: 'Entire Face'
      },
      {
        id: 'photosensitivity-risk',
        name: 'Photosensitivity Indicators',
        severity: 'medium',
        description: 'Some medications increase sun sensitivity. Extra sun protection needed.',
        location: 'Exposed Areas'
      }
    ],
    recommendations: [
      {
        title: 'Intense Ceramide Moisturizer',
        description: 'Repair barrier and combat dryness from medications',
        productType: 'Moisturizer',
        priority: 'high'
      },
      {
        title: 'Hyaluronic Acid Serum',
        description: 'Hydrating base layer for compromised barrier',
        productType: 'Serum',
        priority: 'high'
      },
      {
        title: 'Non-Irritating Sunscreen',
        description: 'Mineral SPF 50+ to protect photosensitive skin',
        productType: 'Sunscreen',
        priority: 'high'
      }
    ],
    medicationAnalysis: {
      analyzedMedications: ['Accutane', 'Tretinoin', 'Spironolactone'],
      impactSummary: 'Your medications are highly effective for acne but require careful skincare support. The combination shows significant drying effects, especially with topical and oral retinoids.',
      sideEffectMatches: [
        {
          medication: 'Accutane',
          observedEffect: 'Severe dryness and flaking',
          likelihood: 'confirmed',
          severity: 'severe'
        },
        {
          medication: 'Tretinoin 0.05%',
          observedEffect: 'Increased photosensitivity',
          likelihood: 'likely',
          severity: 'moderate'
        },
        {
          medication: 'Spironolactone',
          observedEffect: 'Occasional dry patches on cheeks',
          likelihood: 'possible',
          severity: 'mild'
        }
      ],
      contraindications: [
        'Avoid Vitamin C (ascorbic acid) - use Stabilized or Ferulic forms instead',
        'Avoid Benzoyl Peroxide - use Azelaic Acid for antibacterial benefits',
        'Avoid Salicylic Acid - switch to gentler Lactic or Mandelic acid',
        'Avoid heavy physical exfoliation - stick to chemical exfoliants',
        'Avoid hot water - use lukewarm temperatures'
      ]
    }
  }
};

export const analyzeSkin = async (
  base64Image: string,
  mode: SkinMode,
  medicationContext?: string
): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Get base mock data for the mode
  let result = { ...mockAnalysisData[mode] };

  // If medication context is provided, enhance the medication analysis
  if (medicationContext && mode === SkinMode.MEDICATION_MONITOR) {
    const medications = medicationContext
      .split(/[,\n]/)
      .map(m => m.trim())
      .filter(m => m.length > 0);

    result.medicationAnalysis = {
      analyzedMedications: medications,
      impactSummary: `Your medications (${medications.join(', ')}) are powerful treatments that may cause skin changes. We've identified key side effects and contraindications to guide your skincare routine safely.`,
      sideEffectMatches: [
        {
          medication: medications[0] || 'Primary Medication',
          observedEffect: 'Increased skin sensitivity and potential barrier disruption',
          likelihood: 'likely',
          severity: 'moderate'
        },
        {
          medication: medications[1] || 'Secondary Medication',
          observedEffect: 'Possible dryness or peeling',
          likelihood: 'possible',
          severity: 'mild'
        }
      ],
      contraindications: [
        'Avoid Benzoyl Peroxide - may interact negatively with oral medications',
        'Avoid strong acids - use gentler chemical exfoliants instead',
        'Avoid vitamin A derivatives - could compound effects',
        'Avoid heavy occlusives - let skin breathe',
        'Use SPF 50+ daily - medications increase photosensitivity'
      ]
    };
  }

  return result;
};
