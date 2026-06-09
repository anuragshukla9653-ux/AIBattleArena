import runGraph from "../src/services/grap.ai.service.js";

async function test() {
    try {
        console.log("Running graph...");
        const result = await runGraph("What is 2+2?");
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("Error running graph:", err);
    }
}

test();
