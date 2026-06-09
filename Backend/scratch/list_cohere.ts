import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    console.error("COHERE_API_KEY is not defined in .env file!");
    return;
  }
  
  try {
    const res = await fetch('https://api.cohere.ai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    const data: any = await res.json();
    console.log("Supported Cohere models:");
    const textGenModels = data.models.filter((m: any) => m.endpoints?.includes('generate') || m.endpoints?.includes('chat'));
    textGenModels.forEach((m: any) => {
      console.log(`- ${m.name}`);
    });
  } catch (error: any) {
    console.error("Failed to list models:", error.message);
  }
}

listModels();
