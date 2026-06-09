import express from 'express';
import path from 'node:path';
import runGraph from "./services/grap.ai.service.js"
// import cors from "cors"

const app = express();
const publicDir = path.resolve(process.cwd(), 'public');

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});


app.get('/health', (req, res) => {
    res.status(200).json({
        message: "AI Battle Arena backend is running",
        success: true
    })
})

app.use(express.static(publicDir));

app.post("/invoke", async (req, res) => {
    try {
        const { input } = req.body

        if (!input || typeof input !== "string") {
            res.status(400).json({
                message: "Input is required",
                success: false
            })
            return
        }

        const result = await runGraph(input)

        res.status(200).json({
            message: "Graph executed successfully",
            success: true,
            result
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Failed to execute graph",
            success: false
        })
    }

})

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
})

export default app;
