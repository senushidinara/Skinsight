import { GoogleGenAI, Type } from "@google/genai";
import { SkinMode, AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are SkinSight AI, an advanced dermatological analysis engine. 
Your goal is to analyze skin images and provide scientific, data-driven insights.
You are NOT a doctor, but a cosmetic analyst. 
Analyze the provided face image for texture, spots, redness, wrinkles, and potential UV damage.
When medications are provided, cross-reference observed skin conditions (e.g., dryness, rash, sensitivity) with known side effects of the drugs.
Always return valid JSON conforming to the schema.
Be critical but constructive.
DO NOT hallucinate results. If the image is not clear, state that in the analysis.
`;

export const analyzeSkin = async (base64Image: string, mode: SkinMode, medicationContext?: string): Promise<AnalysisResult> => {
  // Remove data URL prefix if present
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  const modelId = 'gemini-2.5-flash';

  let prompt = "";
  switch (mode) {
    case SkinMode.LIE_DETECTOR:
      prompt = "Analyze this skin for overall health. Estimate 'waste score' which implies how ineffective current products might be based on dryness or congestion. Compare against a theoretical baseline.";
      break;
    case SkinMode.ACNE_DETECTIVE:
      prompt = "Focus heavily on active breakouts, inflammation, and scarring. Identify specific types of acne (comedonal, inflammatory).";
      break;
    case SkinMode.MOLE_GUARDIAN:
      prompt = "Scan for pigmented lesions. Analyze borders and symmetry. Provide a general stability score.";
      break;
    case SkinMode.UV_REVEALER:
      prompt = "Analyze deep pigmentation, sun spots, and fine lines associated with photoaging. Estimate hidden UV damage.";
      break;
    case SkinMode.ROUTINE_OPTIMIZER:
      prompt = "Analyze skin type (oily/dry/combo) and barrier health to suggest routine adjustments.";
      break;
    case SkinMode.MEDICATION_MONITOR:
      prompt = `User reports taking: "${medicationContext}". 
      ANALYZE the skin image for side effects SPECIFIC to these medications. 
      1. Cross-reference provided meds with observed features (e.g. Accutane -> dryness/flaking).
      2. For each match, estimate SEVERITY (mild/moderate/severe) based on visual intensity.
      3. Identify CONTRAINDICATIONS: ingredients/procedures to avoid. Be specific and suggest alternatives where possible (e.g., "Avoid Salicylic Acid; use Lactic Acid instead").
      Return a 'medicationAnalysis' object detailing these findings.`;
      break;
    default:
      prompt = "General skin health analysis.";
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: "0-100 health score" },
            skinAge: { type: Type.INTEGER, description: "Estimated skin age" },
            wasteScore: { type: Type.INTEGER, description: "0-100 ineffectiveness of current routine" },
            hydration: { type: Type.INTEGER, description: "0-100 hydration level" },
            texture: { type: Type.INTEGER, description: "0-100 smoothness" },
            redness: { type: Type.INTEGER, description: "0-100 inflammation level" },
            uvDamageEstimate: { type: Type.INTEGER, description: "0-100 estimate of sun damage" },
            concerns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                  description: { type: Type.STRING },
                  location: { type: Type.STRING }
                }
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  productType: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["high", "medium", "low"] }
                }
              }
            },
            medicationAnalysis: {
                type: Type.OBJECT,
                description: "Only populate if medicationContext was provided",
                properties: {
                    analyzedMedications: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "List of medications identified from input" 
                    },
                    impactSummary: { type: Type.STRING, description: "Brief summary of how these meds are affecting the skin" },
                    sideEffectMatches: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                medication: { type: Type.STRING },
                                observedEffect: { type: Type.STRING },
                                likelihood: { type: Type.STRING, enum: ["possible", "likely", "confirmed"] },
                                severity: { type: Type.STRING, enum: ["mild", "moderate", "severe"] }
                            }
                        }
                    },
                    contraindications: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Skincare ingredients or treatments to avoid with alternatives"
                    }
                }
            }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No analysis returned from AI");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Analysis failed. Please try again with a valid API Key.");
  }
};