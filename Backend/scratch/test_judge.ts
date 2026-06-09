import { mistralAIModel } from "../src/services/models.service.js";

const problem = "Add two numbers";
const solution_1 = "def add(a, b): return a + b";
const solution_2 = "def add(x, y): return x - y";

const prompt = `You are a judge evaluating two solutions to a problem.
Problem: ${problem}
Solution 1: ${solution_1}
Solution 2: ${solution_2}

Provide the response in the following exact JSON format:
{
  "solution_1_score": <number between 0 and 10>,
  "solution_2_score": <number between 0 and 10>,
  "solution_1_reasoning": "<reasoning text>",
  "solution_2_reasoning": "<reasoning text>"
}
Do not write anything else. Just the JSON.`;

async function run() {
    try {
        const res = await mistralAIModel.invoke(prompt);
        console.log("Raw output:\n", res.content);
        const jsonMatch = res.content.toString().match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log("Parsed successful:\n", parsed);
        } else {
            console.log("No JSON found");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

run();
