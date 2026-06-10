import { ChatGoogle } from "@langchain/google"
import { ChatMistralAI } from "@langchain/mistralai";
import { CohereClient } from "cohere-ai";
import config from "../config/config.js";

export const geminiModel = new ChatGoogle({
    model: "gemini-2.5-flash",
    apiKey: config.GEMINI_API_KEY
});

export const mistralAIModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: config.MISTRAL_API_KEY
});

// Using Cohere SDK v2 client directly because @langchain/cohere
// uses the deprecated /v1/chat endpoint which newer models don't support.
const cohereClient = new CohereClient({ token: config.COHERE_API_KEY });

export const cohereModel = {
    async invoke(prompt: string) {
        const response = await cohereClient.v2.chat({
            model: "command-a-03-2025",
            messages: [{ role: "user", content: prompt }],
        });
        const content = response.message?.content?.[0]?.type === "text"
            ? response.message.content[0].text
            : "";
        return { content, text: content };
    }
};
