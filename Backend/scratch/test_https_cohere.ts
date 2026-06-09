import https from 'https';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("Requesting Cohere /v1/models via native https module...");
const req = https.request({
  hostname: 'api.cohere.ai',
  port: 443,
  path: '/v1/models',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + process.env.COHERE_API_KEY,
    'User-Agent': 'node-https'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  let body = '';
  res.on('data', (d) => {
    body += d;
  });
  res.on('end', () => {
    console.log('Body length:', body.length);
    try {
      const parsed = JSON.parse(body);
      console.log('Models found:', parsed.models?.length || 0);
    } catch {
      console.log('Raw body (first 200 chars):', body.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error("Connection error:", e);
});

req.setTimeout(8000, () => {
  console.error("Request timed out!");
  req.destroy();
});

req.end();
