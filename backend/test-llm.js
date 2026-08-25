import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import { generatePreVisitSummary } from './services/llmService.js';

const runTest = async () => {
  try {
    console.log('Testing Gemini LLM Service...');
    
    // Explicitly hide API keys from the output if they get logged by mistake
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing from .env');
      process.exit(1);
    }

    const result = await generatePreVisitSummary(
      "I have been experiencing fever, headache and body pain for three days."
    );
    
    console.log('\n--- SUCCESS ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n--- FAILURE ---');
    console.error(error.message);
  }
};

runTest();
