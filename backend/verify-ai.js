const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getRobustModel(ai, prompt) {
    const attempts = [
        { model: 'gemini-1.5-flash', apiVersion: 'v1' },
        { model: 'gemini-1.5-flash', apiVersion: 'v1beta' },
        { model: 'gemini-pro', apiVersion: 'v1' },
        { model: 'gemini-1.5-flash-latest', apiVersion: 'v1beta' }
    ];

    for (const attempt of attempts) {
        try {
            console.log(`Testing: ${attempt.model} on ${attempt.apiVersion}...`);
            const model = ai.getGenerativeModel({ model: attempt.model }, { apiVersion: attempt.apiVersion });
            const result = await model.generateContent(prompt);
            console.log(`✅ SUCCESS: ${attempt.model} on ${attempt.apiVersion}`);
            console.log("Response:", result.response.text().substring(0, 100) + "...");
            return true;
        } catch (error) {
            console.error(`❌ FAILED: ${attempt.model} on ${attempt.apiVersion} - ${error.message}`);
        }
    }
    return false;
}

async function verify() {
    console.log("Starting Robust AI Verification...");
    const success = await getRobustModel(ai, "Respond with 'STABLE' if you are functional.");
    if (success) {
        console.log("\n✨ AI INFRASTRUCTURE IS STABLE ✨");
        process.exit(0);
    } else {
        console.error("\n🚨 ALL AI MODELS FAILED 🚨");
        process.exit(1);
    }
}

verify();
