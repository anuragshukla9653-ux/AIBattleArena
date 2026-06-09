import { ChatCohere } from "@langchain/cohere"; 
import config from "../src/config/config.js";

async function testModel(modelName: string) {
  console.log(`\n--- Testing model: ${modelName} ---`);
  const model = new ChatCohere({
      model: modelName,
      apiKey: config.COHERE_API_KEY,
  });

  try {
      console.log("Invoking...");
      const start = Date.now();
      const res = await model.invoke("Hello", { timeout: 10000 });
      console.log(`Success! Taken: ${Date.now() - start}ms`);
      console.log("Content:", res.content);
  } catch (err: any) {
      console.error("Failed:", err.message || err);
  }
}

async function run() {
  await testModel("command-a-03-2025");
  await testModel("command-a-reasoning-08-2025");
}

run();
