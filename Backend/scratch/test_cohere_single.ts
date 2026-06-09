import { ChatCohere } from "@langchain/cohere"; 
import config from "../src/config/config.js";

async function test() {
  console.log("Initializing Cohere with model...");
  const modelName = "command-a-reasoning-08-2025";
  console.log("Model name:", modelName);
  
  const model = new ChatCohere({
      model: modelName,
      apiKey: config.COHERE_API_KEY,
  });

  try {
      console.log("Invoking Cohere with timeout...");
      const res = await model.invoke("Hello", { timeout: 10000 });
      console.log("Success! Content:", res.content);
  } catch (err: any) {
      console.error("Failed:", err.message || err);
  }
}

test();
