import { GoogleGenAI, Type } from '@google/genai';

export const generatePreVisitSummary = async (symptoms) => {
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === '') {
    throw new Error('Symptoms are required to generate a summary.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL;

  if (!modelName) {
    throw new Error('GEMINI_MODEL is not configured.');
  }

  if (!apiKey) {
    throw new Error('LLM API key is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
You are a medical assistant summarizing patient symptoms for clinician review.
Do not provide a definitive diagnosis or treatment recommendation. Summarize the reported symptoms for clinician review.

Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and exactly three suggested questions for the doctor. 
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Symptoms: ${symptoms}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2, // Keep it factual and consistent
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            urgencyLevel: {
              type: Type.STRING,
              description: "Must be exactly 'Low', 'Medium', or 'High'"
            },
            chiefComplaint: {
              type: Type.STRING,
              description: "A concise summary of the chief complaint"
            },
            suggestedQuestions: {
              type: Type.ARRAY,
              description: "Exactly three suggested questions for the doctor",
              items: {
                type: Type.STRING
              }
            }
          },
          required: ["urgencyLevel", "chiefComplaint", "suggestedQuestions"]
        }
      }
    });

    const responseContent = response.text;
    if (!responseContent) {
      throw new Error('LLM returned an empty response.');
    }

    const parsedData = JSON.parse(responseContent);

    // Validate the structure
    const validUrgencyLevels = ['Low', 'Medium', 'High'];
    if (!validUrgencyLevels.includes(parsedData.urgencyLevel)) {
      throw new Error('Invalid urgencyLevel from LLM');
    }

    if (!parsedData.chiefComplaint || typeof parsedData.chiefComplaint !== 'string' || parsedData.chiefComplaint.trim() === '') {
      throw new Error('Invalid chiefComplaint from LLM');
    }

    if (!Array.isArray(parsedData.suggestedQuestions) || parsedData.suggestedQuestions.length !== 3) {
      throw new Error('Invalid suggestedQuestions from LLM. Must be exactly 3.');
    }
    
    // Ensure all questions are non-empty strings
    const validQuestions = parsedData.suggestedQuestions.every(q => typeof q === 'string' && q.trim() !== '');
    if (!validQuestions) {
       throw new Error('suggestedQuestions array contains invalid string elements');
    }

    return {
      urgencyLevel: parsedData.urgencyLevel,
      chiefComplaint: parsedData.chiefComplaint.trim(),
      suggestedQuestions: parsedData.suggestedQuestions.map(q => q.trim())
    };

  } catch (error) {
    // We throw the error to let the controller catch it and return a 503 safely.
    throw new Error(`Gemini LLM generation failed: ${error.message}`);
  }
};

export const generatePostVisitSummary = async (postVisitNotes, prescription = [], followUpInstructions = '') => {
  if (!postVisitNotes || typeof postVisitNotes !== 'string' || postVisitNotes.trim() === '') {
    throw new Error('Post-visit notes are required.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL;

  if (!modelName) {
    throw new Error('GEMINI_MODEL is not configured.');
  }

  if (!apiKey) {
    throw new Error('LLM API key is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const formattedPrescription = Array.isArray(prescription) && prescription.length > 0
    ? prescription.map(m => `- ${m.medicine}: ${m.dosage}, ${m.frequency} for ${m.duration}${m.instructions ? ` (${m.instructions})` : ''}`).join('\n')
    : 'None';

  const systemInstruction = `
You are a medical assistant converting clinical consultation notes into a patient-friendly summary.

Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps.

Requirements:
- Use simple language.
- Do not invent diagnoses.
- Do not invent medicines.
- Do not change dosage.
- Do not change frequency.
- Do not change duration.
- Do not add medical facts that are not present in the doctor's notes.
- Clearly explain the medication schedule.
- Clearly explain follow-up instructions.
- Do not provide a new diagnosis.
- Do not recommend additional medication.
- Do not contradict the doctor's prescription.
- Make the result understandable to a normal patient.
`;

  const userPrompt = `
Clinical notes:
${postVisitNotes}

Prescription:
${formattedPrescription}

Follow-up instructions:
${followUpInstructions || 'None'}
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });

    const responseContent = response.text;
    if (!responseContent || typeof responseContent !== 'string' || responseContent.trim() === '') {
      throw new Error('LLM returned an empty response.');
    }

    return responseContent.trim();
  } catch (error) {
    throw new Error(`Gemini LLM generation failed: ${error.message}`);
  }
};
