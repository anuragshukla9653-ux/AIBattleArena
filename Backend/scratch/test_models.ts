import { mistralAIModel, cohereModel, geminiModel } from "../src/services/models.service.js";

async function test() {
    console.log("Testing geminiModel...");
    try {
        const res = await geminiModel.invoke("Hello");
        console.log("Gemini works! Content:", res.content);
    } catch (err) {
        console.error("Gemini failed:", err.message || err);
    }

    console.log("Testing mistralAIModel...");
    try {
        const res = await mistralAIModel.invoke("Hello");
        console.log("Mistral works! Content:", res.content);
    } catch (err) {
        console.error("Mistral failed:", err.message || err);
    }

    console.log("Testing cohereModel...");
    try {
        const res = await cohereModel.invoke("Hello");
        console.log("Cohere works! Content:", res.content);
    } catch (err) {
        console.error("Cohere failed:", err.message || err);
    }
}

test();
