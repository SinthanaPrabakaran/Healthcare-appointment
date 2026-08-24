import { GoogleGenAI, Type } from '@google/genai';

export const generatePreVisitSummary = async (symptoms) => {
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === '') {
    throw new Error('Symptoms are required to generate a summary.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

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
