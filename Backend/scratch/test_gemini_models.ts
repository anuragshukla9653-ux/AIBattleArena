import { ChatGoogle } from "@langchain/google";
import config from "../src/config/config.js";

async function testModel(modelName: string) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const model = new ChatGoogle({
            model: modelName,
            apiKey: config.GEMINI_API_KEY
        });
        const res = await model.invoke("Hello");
        console.log(`  Success for ${modelName}! Content:`, res.content);
        return true;
    } catch (err) {
        console.error(`  Failed for ${modelName}:`, err.message || err);
        return false;
    }
}

async function run() {
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-2.0-flash",
        "gemini-2.5-flash",
        "gemini-flash-latest"
    ];
    for (const m of models) {
        await testModel(m);
    }
}

run();
