import OpenAI from 'openai';

export const generatePreVisitSummary = async (symptoms) => {
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim() === '') {
    throw new Error('Symptoms are required to generate a summary.');
  }

  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || 'gpt-3.5-turbo-0125'; // Fallback to a fast JSON-capable model if not set

  if (!apiKey) {
    throw new Error('LLM API key is not configured.');
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `
You are a medical assistant summarizing patient symptoms for clinician review.
Do not provide a definitive diagnosis or treatment recommendation. Summarize the reported symptoms for clinician review.

Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. 

You MUST return the output strictly as a JSON object with this exact structure:
{
    "urgencyLevel": "Low | Medium | High",
    "chiefComplaint": "string",
    "suggestedQuestions": [
        "string",
        "string",
        "string"
    ]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Symptoms: ${symptoms}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2 // Keep it factual and consistent
    });

    const responseContent = completion.choices[0]?.message?.content;
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
    // Throw error so the controller can catch it and return a 503 safely without crashing the server.
    throw new Error(`LLM Generation Failed: ${error.message}`);
  }
};
