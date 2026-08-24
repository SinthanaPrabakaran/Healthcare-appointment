import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Direct HTTP request to check the available models for this specific API key
async function run() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.models) {
    const modelNames = data.models.map(m => m.name).filter(name => name.includes('flash') || name.includes('pro'));
    console.log("Available Gemini Models:");
    console.log(modelNames);
  } else {
    console.error("Failed to fetch:", data);
  }
}
run();
